const captured = { token: '', hif_leim: '', hif_dliq: '' };

window.addEventListener('message', (e) => {
  if (e.source !== window) return;
  const d = e.data;
  if (d && d.__dsxCapture && d.captured) {
    Object.assign(captured, d.captured);
  }
});

function ls(key) {
  try { return localStorage.getItem(key) || ''; } catch (e) { return ''; }
}

function safeJson(str, fallback) {
  try { return JSON.parse(str); } catch (e) { return fallback; }
}

// userToken = {"value":"+Xh3trs...","__version":"0"}
function tokenFromLS() {
  const raw = ls('userToken');
  if (!raw) return '';
  const j = safeJson(raw, null);
  if (j && typeof j === 'object' && typeof j.value === 'string') return j.value;
  return '';
}

// hif_leim_cached = "\"3Gsd...\""  (двойная JSON-сериализация)
function hifLeimFromLS() {
  const raw = ls('hif_leim_cached');
  if (!raw) return '';
  let v = safeJson(raw, raw);
  if (typeof v === 'string') v = safeJson(v, v);
  return typeof v === 'string' ? v : '';
}

// Запрос к hif-dliq.deepseek.com/query
async function fetchHifDliq() {
  try {
    const r = await fetch('https://hif-dliq.deepseek.com/query', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'x-client-bundle-id': 'com.deepseek.chat',
        'x-client-platform': 'web',
        'x-client-version': '2.5.0',
        'x-client-locale': (navigator.language || 'en_US').replace('-', '_'),
        'x-client-timezone-offset': String(-new Date().getTimezoneOffset() * 60),
        'accept': '*/*'
      }
    });
    const j = await r.json();
    return (
      (j && j.data && j.data.biz_data && j.data.biz_data.value) ||
      (j && j.data && j.data.value) ||
      ''
    );
  } catch (e) {
    return '';
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getLocalData') {
    (async () => {
      const fetched = await fetchHifDliq();
      sendResponse({
        success: true,
        data: {
          token_ls: tokenFromLS(),
          hif_leim_ls: hifLeimFromLS(),
          hif_dliq_fetched: fetched,
          smidV2_ls: ls('smidV2'),
          captured: { ...captured }
        }
      });
    })();
    return true;
  }
});