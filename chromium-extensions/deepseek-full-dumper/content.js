const captured = [];

window.addEventListener('message', (event) => {
  if (event.source !== window) return;
  const d = event.data;
  if (!d || !d.__dsx) return;
  if (d.type === 'capture') {
    captured.push(d.entry);
    if (captured.length > 500) captured.shift();
  }
});

function dumpStorage(storage) {
  const out = {};
  try {
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      out[k] = storage.getItem(k);
    }
  } catch (e) {}
  return out;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'collectFromPage') {
    // ask page to also return its own captured array (in case we missed something)
    let pageCaptured = [];
    try {
      if (typeof window.__dsxGetCaptured === 'function') pageCaptured = window.__dsxGetCaptured();
    } catch (e) {}

    sendResponse({
      success: true,
      data: {
        url: location.href,
        userAgent: navigator.userAgent,
        localStorage: dumpStorage(localStorage),
        sessionStorage: dumpStorage(sessionStorage),
        captured: (captured.length ? captured : pageCaptured).slice(),
      },
    });
    return true;
  }
  if (request.action === 'clearCaptured') {
    captured.length = 0;
    try { window.__dsxClearCaptured && window.__dsxClearCaptured(); } catch (e) {}
    sendResponse({ success: true });
    return true;
  }
});