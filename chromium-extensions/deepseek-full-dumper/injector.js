(function () {
  const MAX_BODY = 100000;
  const captured = [];

  function truncate(s) {
    if (typeof s !== 'string') return s;
    return s.length > MAX_BODY ? s.slice(0, MAX_BODY) + '...[truncated]' : s;
  }

  function headersToObj(h) {
    const out = {};
    try {
      if (!h) return out;
      if (h instanceof Headers) h.forEach((v, k) => (out[k] = v));
      else if (Array.isArray(h)) h.forEach(([k, v]) => (out[k] = v));
      else Object.assign(out, h);
    } catch (e) {}
    return out;
  }

  function push(entry) {
    captured.push({ ...entry, ts: new Date().toISOString() });
    if (captured.length > 500) captured.shift();
    window.postMessage({ __dsx: true, type: 'capture', entry }, '*');
  }

  const interesting = (url) =>
    typeof url === 'string' &&
    (url.includes('deepseek') || url.includes('/api/'));

  // --- Hook fetch ---
  const origFetch = window.fetch;
  window.fetch = function (input, init) {
    let url = '', method = 'GET', headers = {}, body = '';
    try {
      url = typeof input === 'string' ? input : (input && input.url) || '';
      method = (init && init.method) || (input && input.method) || 'GET';
      headers = headersToObj((init && init.headers) || (input && input.headers));
      let b = init && init.body;
      if (b && typeof b !== 'string') {
        try { b = JSON.stringify(b); } catch (e) { b = String(b); }
      }
      body = truncate(b || '');
      if (interesting(url)) {
        push({ kind: 'fetch.request', url, method, headers, body });
      }
    } catch (e) {}

    const p = origFetch.apply(this, arguments);
    p.then((res) => {
      try {
        if (interesting(url)) {
          const clone = res.clone();
          clone.text().then((t) => {
            push({
              kind: 'fetch.response',
              url,
              status: res.status,
              headers: headersToObj(res.headers),
              body: truncate(t),
            });
          }).catch(() => {});
        }
      } catch (e) {}
    }).catch(() => {});
    return p;
  };

  // --- Hook XMLHttpRequest ---
  const OrigXHR = window.XMLHttpRequest;
  function WrappedXHR() {
    const xhr = new OrigXHR();
    const _open = xhr.open;
    const _send = xhr.send;
    const _setHeader = xhr.setRequestHeader;
    let _method, _url, _headers = {};

    xhr.open = function (method, url) {
      _method = method; _url = url;
      return _open.apply(xhr, arguments);
    };
    xhr.setRequestHeader = function (k, v) {
      _headers[k] = v;
      return _setHeader.apply(xhr, arguments);
    };
    xhr.send = function (body) {
      try {
        if (interesting(_url)) {
          let b = body;
          if (b && typeof b !== 'string') {
            try { b = JSON.stringify(b); } catch (e) { b = String(b); }
          }
          push({
            kind: 'xhr.request',
            url: _url,
            method: _method,
            headers: _headers,
            body: truncate(b || ''),
          });
          xhr.addEventListener('load', () => {
            push({
              kind: 'xhr.response',
              url: _url,
              status: xhr.status,
              body: truncate(xhr.responseText || ''),
            });
          });
        }
      } catch (e) {}
      return _send.apply(xhr, arguments);
    };
    return xhr;
  }
  WrappedXHR.prototype = OrigXHR.prototype;
  window.XMLHttpRequest = WrappedXHR;

  window.__dsxGetCaptured = () => captured;
  window.__dsxClearCaptured = () => { captured.length = 0; };

  window.postMessage({ __dsx: true, type: 'ready' }, '*');
})();