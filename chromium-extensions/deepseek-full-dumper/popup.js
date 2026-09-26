const $ = (id) => document.getElementById(id);

function setStatus(text, cls) {
  $('status').textContent = text;
  $('status').className = 'status ' + cls;
}

function renderStats(dump) {
  if (!dump) { $('stats').textContent = ''; return; }
  const c = (dump.cookies?.byUrl?.length || 0) + (dump.cookies?.byDomain?.length || 0);
  const ls = Object.keys(dump.localStorage || {}).length;
  const ss = Object.keys(dump.sessionStorage || {}).length;
  const rq = (dump.capturedRequests || []).length;
  $('stats').innerHTML =
    `Cookies: <b>${c}</b> · localStorage: <b>${ls}</b> · sessionStorage: <b>${ss}</b> · Запросов: <b>${rq}</b>`;
}

function render(dump) {
  $('preview').textContent = dump ? JSON.stringify(dump, null, 2) : '{ }';
  renderStats(dump);
  if (!dump) { setStatus('⚠️ Ещё ничего не собрано', 'warn'); return; }
  const rq = (dump.capturedRequests || []).length;
  if (rq > 0) setStatus(`✅ Собрано (${rq} сетевых записей) — ищи token/hif_* в capturedRequests`, 'ok');
  else setStatus('⚠️ Запросы не перехвачены — перезагрузи вкладку и отправь сообщение', 'warn');
}

function load() {
  chrome.runtime.sendMessage({ action: 'getDump' }, (r) => {
    render(r?.dump || null);
  });
}

$('btnCollect').addEventListener('click', () => {
  setStatus('⏳ Собираю...', 'warn');
  chrome.runtime.sendMessage({ action: 'collect' }, (r) => {
    if (r?.success) render(r.dump);
    else setStatus('❌ ' + (r?.error || 'Ошибка'), 'err');
  });
});

$('btnClear').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'clearCaptured' }, () => {
    setStatus('🧹 Лог перехвата очищен. Отправь сообщение в чате и нажми "Собрать" заново.', 'warn');
  });
});

$('btnCopy').addEventListener('click', () => {
  navigator.clipboard.writeText($('preview').textContent).then(() => {
    const b = $('btnCopy'); b.textContent = '✅ Скопировано';
    setTimeout(() => (b.textContent = '📋 Копировать'), 1200);
  });
});

$('btnSave').addEventListener('click', () => {
  const blob = new Blob([$('preview').textContent], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `deepseek-dump-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
});

load();