const $ = (id) => document.getElementById(id);

function readAuth() {
  return new Promise((res) => chrome.storage.local.get("ds_auth", (r) => res(r.ds_auth || {})));
}

function readCookies() {
  return new Promise((res) => chrome.cookies.getAll({ domain: "deepseek.com" }, (c) => res(c || [])));
}

async function buildJson() {
  const stored = await readAuth();
  const cookies = await readCookies();

  const ds = cookies.find((c) => c.name === "ds_session_id");
  const smidCookie = cookies.find((c) => c.name === "smidV2");

  const smid = stored.smidV2 || (smidCookie ? smidCookie.value : "");
  const parts = [];
  if (ds) parts.push("ds_session_id=" + ds.value);
  if (smid) parts.push("smidV2=" + smid);

  return {
    token: stored.token || "",
    hif_dliq: stored.hif_dliq || "",
    hif_leim: stored.hif_leim || "",
    cookie: parts.join("; "),
    wasmUrl: "https://fe-static.deepseek.com/chat/static/sha3_wasm_bg.7b9ca65ddd.wasm"
  };
}

function renderFields(auth) {
  const rows = [
    ["token", auth.token],
    ["hif_dliq", auth.hif_dliq],
    ["hif_leim", auth.hif_leim],
    ["cookie", auth.cookie]
  ];
  $("fields").innerHTML = rows.map(([k, v]) => {
    const ok = !!v;
    const shown = ok ? (v.length > 42 ? v.slice(0, 42) + "…" : v) : '<span class="miss">пусто</span>';
    return '<div>' + (ok ? "✅" : "❌") + ' <b>' + k + '</b>: ' + shown + '</div>';
  }).join("");
}

async function render() {
  const auth = await buildJson();
  $("preview").textContent = JSON.stringify(auth, null, 2);
  renderFields(auth);
  const missing = ["token", "hif_leim", "cookie"].filter((k) => !auth[k]);
  if (missing.length === 0) {
    $("status").textContent = "✅ Всё собрано — можно копировать или скачивать";
    $("status").className = "status ok";
  } else {
    $("status").textContent = "⚠️ Не хватает: " + missing.join(", ") + ". Перезагрузи вкладку DeepSeek и отправь сообщение в чате.";
    $("status").className = "status warn";
  }
}

$("btnCopy").addEventListener("click", () => {
  navigator.clipboard.writeText($("preview").textContent).then(() => {
    $("btnCopy").textContent = "✅ Скопировано";
    setTimeout(() => $("btnCopy").textContent = "📋 Копировать", 1200);
  });
});

$("btnSave").addEventListener("click", () => {
  const blob = new Blob([$("preview").textContent + "\n"], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "deepseek-auth.json";
  a.click();
  URL.revokeObjectURL(a.href);
});

render();
setInterval(render, 1000);
