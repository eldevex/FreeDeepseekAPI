// Копим перехваченные запросы в памяти и раз в секунду сбрасываем в chrome.storage
const reqBuffer = [];

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

function patchStorage(key, patch) {
  chrome.storage.local.get(key, (r) => {
    const cur = r[key] || {};
    chrome.storage.local.set({ [key]: Object.assign({}, cur, patch, { _updated: Date.now() }) });
  });
}

// Первичный снимок storage
patchStorage("ds_dump", {
  url: location.href,
  userAgent: navigator.userAgent,
  localStorage: dumpStorage(localStorage),
  sessionStorage: dumpStorage(sessionStorage)
});

// Перечитываем через 3 и 8 секунд — на случай, если приложение ещё дописывает ключи
setTimeout(() => patchStorage("ds_dump", {
  localStorage: dumpStorage(localStorage),
  sessionStorage: dumpStorage(sessionStorage)
}), 3000);
setTimeout(() => patchStorage("ds_dump", {
  localStorage: dumpStorage(localStorage),
  sessionStorage: dumpStorage(sessionStorage)
}), 8000);

// Принимаем перехваченные запросы от injector.js
window.addEventListener("message", (e) => {
  if (e.source !== window) return;
  const d = e.data;
  if (!d || d.__dsx !== "req" || !d.entry) return;
  reqBuffer.push(d.entry);
  if (reqBuffer.length > 300) reqBuffer.shift();
});

// Раз в секунду сбрасываем накопленный буфер в storage
setInterval(() => {
  if (!reqBuffer.length) return;
  chrome.storage.local.get("ds_dump", (r) => {
    const cur = r.ds_dump || {};
    const reqs = (cur.capturedRequests || []).concat(reqBuffer.splice(0));
    if (reqs.length > 300) reqs.splice(0, reqs.length - 300);
    cur.capturedRequests = reqs;
    cur._updated = Date.now();
    chrome.storage.local.set({ ds_dump: cur });
  });
}, 1000);

// Слушаем команду очистки от popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.action === "clearCaptured") {
    reqBuffer.length = 0;
    chrome.storage.local.get("ds_dump", (r) => {
      const cur = r.ds_dump || {};
      cur.capturedRequests = [];
      chrome.storage.local.set({ ds_dump: cur }, () => sendResponse({ ok: true }));
    });
    return true;
  }
  if (msg && msg.action === "rescanStorage") {
    patchStorage("ds_dump", {
      localStorage: dumpStorage(localStorage),
      sessionStorage: dumpStorage(sessionStorage)
    });
    sendResponse({ ok: true });
    return true;
  }
});
