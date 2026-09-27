function ls(k) { try { return localStorage.getItem(k) || ""; } catch (e) { return ""; } }

function updateStorage(patch) {
  chrome.storage.local.get("ds_auth", (r) => {
    const cur = r.ds_auth || {};
    const next = Object.assign({}, cur, patch, { _updated: Date.now() });
    chrome.storage.local.set({ ds_auth: next });
  });
}

function readFromLS() {
  const out = {};
  try {
    const ut = JSON.parse(ls("userToken") || "{}");
    out.token = ut.value || "";
  } catch (e) {}
  try {
    let v = JSON.parse(ls("hif_leim_cached") || '""');
    if (typeof v === "string") v = JSON.parse(v);
    out.hif_leim = v || "";
  } catch (e) {}
  try {
    const s = ls("smidV2");
    out.smidV2 = s ? (JSON.parse(s) || s) : "";
  } catch (e) { out.smidV2 = ls("smidV2"); }
  return out;
}

updateStorage(readFromLS());
setTimeout(() => updateStorage(readFromLS()), 3000);
setTimeout(() => updateStorage(readFromLS()), 8000);

window.addEventListener("message", (e) => {
  if (e.source !== window) return;
  const d = e.data;
  if (!d || !d.__dsx) return;
  const patch = {};
  if (d.token) patch.token = d.token;
  if (d.hif_leim) patch.hif_leim = d.hif_leim;
  if (d.hif_dliq) patch.hif_dliq = d.hif_dliq;
  if (Object.keys(patch).length) updateStorage(patch);
});
