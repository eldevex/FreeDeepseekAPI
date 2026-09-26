(function () {
  const captured = { token: '', hif_leim: '', hif_dliq: '' };

  function emit() {
    window.postMessage({ __dsxCapture: true, captured: { ...captured } }, '*');
  }

  function recordHeaders(raw) {
    if (!raw) return;
    let h = raw;
    try {
      if (h instanceof Headers) {
        const o = {}; h.forEach((v, k) => o[k.toLowerCase()] = v); h = o;
      } else if (Array.isArray(h)) {
        const o = {}; h.forEach(([k, v]) => o[k.toLowerCase()] = v); h = o;
      } else {
        const o = {}; Object.keys(h).forEach(k => o[k.toLowerCase()] = h[k]); h = o;
      }
      let changed = false;
      const auth = h['authorization'];
      if (auth && !captured.token) {
        captured.token = String(auth).replace(/^Bearer\s+/i, '');
        changed = true;
      }
      if (h['x-hif-leim'] && captured.hif_leim !== h['x-hif-leim']) {
        captured.hif_leim = h['x-hif-leim']; changed = true;
      }
      if (h['x-hif-dliq'] && captured.hif_dliq !== h['x-hif-dliq']) {
        captured.hif_dliq = h['x-hif-dliq']; changed = true;
      }
      if (changed) emit();
    } catch (e) {}
  }

  // --- fetch ---
  const _fetch = window.fetch;
  window.fetch = function (input, init) {
    try {
      const h = (init && init.headers) || (input && input.headers);
      recordHeaders(h);
    } catch (e) {}
    return _fetch.apply(this, arguments);
  };

  // --- XHR ---
  const _XHR = window.XMLHttpRequest;
  function Wrapped() {
    const xhr = new _XHR();
    const _open = xhr.open;
    const _send = xhr.send;
    const _setHeader = xhr.setRequestHeader;
    const _headers = {};
    xhr.open = function () { return _open.apply(xhr, arguments); };
    xhr.setRequestHeader = function (k, v) {
      _headers[String(k).toLowerCase()] = v;
      return _setHeader.apply(xhr, arguments);
    };
    xhr.send = function () {
      try { recordHeaders(_headers); } catch (e) {}
      return _send.apply(xhr, arguments);
    };
    return xhr;
  }
  Wrapped.prototype = _XHR.prototype;
  window.XMLHttpRequest = Wrapped;

  emit();
})();