(function () {
  const cap = {};

  function emit() {
    window.postMessage({ __dsx: true, ...cap }, "*");
  }

  function grab(h) {
    if (!h) return;
    try {
      const o = {};
      if (h instanceof Headers) h.forEach((v, k) => o[k.toLowerCase()] = v);
      else if (Array.isArray(h)) h.forEach(([k, v]) => o[k.toLowerCase()] = v);
      else Object.keys(h).forEach(k => o[k.toLowerCase()] = h[k]);

      let changed = false;
      const auth = o["authorization"];
      if (auth) {
        const t = String(auth).replace(/^Bearer\s+/i, "");
        if (t && t !== cap.token) { cap.token = t; changed = true; }
      }
      if (o["x-hif-leim"] && o["x-hif-leim"] !== cap.hif_leim) {
        cap.hif_leim = o["x-hif-leim"]; changed = true;
      }
      if (o["x-hif-dliq"] && o["x-hif-dliq"] !== cap.hif_dliq) {
        cap.hif_dliq = o["x-hif-dliq"]; changed = true;
      }
      if (changed) emit();
    } catch (e) {}
  }

  const _f = window.fetch;
  window.fetch = function (input, init) {
    try { grab((init && init.headers) || (input && input.headers)); } catch (e) {}
    return _f.apply(this, arguments);
  };

  const _X = window.XMLHttpRequest;
  function W() {
    const x = new _X();
    const _o = x.open, _s = x.send, _sh = x.setRequestHeader;
    const hs = {};
    x.open = function () { return _o.apply(x, arguments); };
    x.setRequestHeader = function (k, v) { hs[k.toLowerCase()] = v; return _sh.apply(x, arguments); };
    x.send = function () { try { grab(hs); } catch (e) {} return _s.apply(x, arguments); };
    return x;
  }
  W.prototype = _X.prototype;
  window.XMLHttpRequest = W;

  setTimeout(async () => {
    if (cap.hif_dliq) return;
    try {
      const r = await _f.call(window, "https://hif-dliq.deepseek.com/query", {
        credentials: "include",
        headers: {
          "x-client-bundle-id": "com.deepseek.chat",
          "x-client-platform": "web",
          "x-client-version": "2.5.0",
          "accept": "*/*"
        }
      });
      const j = await r.json();
      const v = j && j.data && (j.data.biz_data && j.data.biz_data.value || j.data.value);
      if (v) { cap.hif_dliq = v; emit(); }
    } catch (e) {}
  }, 3000);
})();
