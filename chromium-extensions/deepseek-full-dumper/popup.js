const $ = (id) => document.getElementById(id);

function readDump() {
  return new Promise((res) => chrome.storage.local.get("ds_dump", (r) => res(r.ds_dump || {})));
}

function readCookies() {
  return new Promise((res) => chrome.cookies.getAll({ domain: "deepseek.com" }, (c) => res(c || [])));
}

async function build() {
  const [dump, cookies] = await Promise.all([readDump(), readCookies()]);
  return {
    timestamp: new Date().toISOString(),
    tabUrl: dump.url || "",
    userAgent: dump.userAgent || "",
    cookies: cookies.map((c) => ({
      name: c.name,
      value: c.value,
      domain: c.domain,
      path: c.path,
      secure: c.secure,
      httpOnly: c.httpOnly,
      sameSite: c.sameSite,
      session: c.session,
      expirationDate: c.expirationDate || null
    })),
    localStorage: dump.localStorage || {},
    sessionStorage: dump.sessionStorage || {},
    capturedRequests: dump.capturedRequests || []
  };
}

function renderStats(d) {
  $("stats").innerHTML =
    "Cookies: <b>" + d.cookies.length + "</b>" +
    " · localStorage: <b>" + Object.keys(d.localStorage).length + "</b>" +
    " · sessionStorage: <b>" + Object.keys(d.sessionStorage).length + "</b>" +
    " · Запросов: <b>" + d.capturedRequests.length + "</b>";
}

async function render() {
  const d = await build();
  $("preview").textContent = JSON.stringify(d, null, 2);
  renderStats(d);
  if (d.capturedRequests.length > 0) {
    $("status").textContent = "✅ Собрано (" + d.capturedRequests.length + " сетевых записей)";
    $("status").className = "status ok";
  } else if (d.localStorage && Object.keys(d.localStorage).length > 0) {
    $("status").textContent = "⚠️ Storage собран, но запросы ещё не ловились. Отправь сообщение в чате.";
    $("status").className = "status warn";
  } else {
    $("status").textContent = "⏳ Пока пусто. Перезагрузи вкладку DeepSeek и отправь сообщение.";
    $("status").className = "status warn";
  }
}

$("btnRefresh").addEventListener("click", render);

$("btnClear").addEventListener("click", () => {
  chrome.tabs.query({ url: "https://chat.deepseek.com/*" }, (tabs) => {
    if (!tabs.length) { render(); return; }
    chrome.tabs.sendMessage(tabs[0].id, { action: "clearCaptured" }, () => {
      setTimeout(render, 300);
    });
  });
});

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
  a.download = "deepseek-dump-" + Date.now() + ".json";
  a.click();
  URL.revokeObjectURL(a.href);
});

render();
setInterval(render, 1500);
