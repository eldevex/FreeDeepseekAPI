const WASM_URL = 'https://fe-static.deepseek.com/chat/static/sha3_wasm_bg.7b9ca65ddd.wasm';

function getCookie(name) {
  return new Promise((resolve) => {
    chrome.cookies.get({ url: 'https://chat.deepseek.com', name }, (c) => {
      resolve(c ? c.value : '');
    });
  });
}

function findTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ url: 'https://chat.deepseek.com/*' }, (tabs) => {
      resolve(tabs && tabs[0] ? tabs[0] : null);
    });
  });
}

function askContent(tabId) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, { action: 'getLocalData' }, (resp) => {
      if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
      resolve((resp && resp.data) || {});
    });
  });
}

async function collect() {
  const tab = await findTab();
  if (!tab) throw new Error('Открой вкладку chat.deepseek.com');

  const [ds_session_id, smidV2_cookie, content] = await Promise.all([
    getCookie('ds_session_id'),
    getCookie('smidV2'),
    askContent(tab.id).catch(() => ({}))
  ]);

  const cap = content.captured || {};

  const token    = cap.token    || content.token_ls        || '';
  const hif_leim = cap.hif_leim || content.hif_leim_ls     || '';
  const hif_dliq = cap.hif_dliq || content.hif_dliq_fetched || '';
  const smidV2   = smidV2_cookie || content.smidV2_ls       || '';

  const cookieParts = [];
  if (ds_session_id) cookieParts.push(`ds_session_id=${ds_session_id}`);
  if (smidV2)        cookieParts.push(`smidV2=${smidV2}`);

  const auth = {
    token,
    hif_dliq,
    hif_leim,
    cookie: cookieParts.join('; '),
    wasmUrl: WASM_URL
  };

  const missing = ['token', 'hif_leim', 'cookie']
    .filter((k) => !auth[k]);   // hif_dliq не обязателен

  await chrome.storage.local.set({ deepseek_auth_last: auth });
  return { auth, missing };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'collect') {
    collect().then(
      (r) => sendResponse({ success: true, auth: r.auth, missing: r.missing }),
      (e) => sendResponse({ success: false, error: e.message })
    );
    return true;
  }
});