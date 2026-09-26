const STORAGE_KEY = 'deepseek_dump';

const getCookies = (filter) =>
  new Promise((resolve) => chrome.cookies.getAll(filter, (c) => resolve(c || [])));

const findTab = () =>
  new Promise((resolve) =>
    chrome.tabs.query({ url: 'https://chat.deepseek.com/*' }, (t) => resolve(t?.[0] || null))
  );

async function collectAll() {
  const tab = await findTab();
  if (!tab) throw new Error('Открой вкладку chat.deepseek.com и перезагрузи её');

  const [byDomain, byUrl] = await Promise.all([
    getCookies({ domain: 'deepseek.com' }),
    getCookies({ url: 'https://chat.deepseek.com' }),
  ]);

  const pageData = await new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tab.id, { action: 'collectFromPage' }, (resp) => {
      if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
      resolve(resp?.data || {});
    });
  });

  const dump = {
    timestamp: new Date().toISOString(),
    tabUrl: tab.url,
    cookies: { byDomain, byUrl },
    localStorage: pageData.localStorage || {},
    sessionStorage: pageData.sessionStorage || {},
    capturedRequests: pageData.captured || [],
    userAgent: pageData.userAgent || '',
  };

  await chrome.storage.local.set({ [STORAGE_KEY]: dump });
  return dump;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'collect') {
    collectAll().then(
      (dump) => sendResponse({ success: true, dump }),
      (err) => sendResponse({ success: false, error: err.message })
    );
    return true;
  }
  if (request.action === 'getDump') {
    chrome.storage.local.get(STORAGE_KEY, (r) =>
      sendResponse({ success: true, dump: r[STORAGE_KEY] || null })
    );
    return true;
  }
  if (request.action === 'clearCaptured') {
    findTab().then((tab) => {
      if (!tab) return sendResponse({ success: false });
      chrome.tabs.sendMessage(tab.id, { action: 'clearCaptured' }, () =>
        sendResponse({ success: true })
      );
    });
    return true;
  }
});