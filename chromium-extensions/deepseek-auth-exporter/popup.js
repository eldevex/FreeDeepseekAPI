const $ = (id) => document.getElementById(id);

function setStatus(text, cls) {
  $('status').textContent = text;
  $('status').className = 'status ' + cls;
}

function renderFields(auth) {
  const rows = [
    ['token',    auth.token],
    ['hif_leim', auth.hif_leim],
    ['hif_dliq', auth.hif_dliq],
    ['cookie',   auth.cookie],
    ['wasmUrl',  auth.wasmUrl]
  ];
  $('fields').innerHTML = rows.map(([k, v]) => {
    const ok = !!v;
    const shown = ok
      ? (v.length > 42 ? v.slice(0, 42) + '…' : v)
      : '<span class="miss">пусто</span>';
    return `<div>${ok ? '✅' : '<span class="miss">❌</span>'} <b>${k}</b>: ${shown}</div>`;
  }).join('');
}

function render(auth, missing) {
  $('preview').textContent = JSON.stringify(auth, null, 2);
  renderFields(auth);
  if (!missing || missing.length === 0) {
    setStatus('✅ Все ключевые поля собраны — можно скачивать', 'ok');
  } else {
    setStatus('⚠️ Не хватает: ' + missing.join(', '), 'warn');
  }
}

function collect() {
  setStatus('⏳ Собираю данные...', 'warn');
  chrome.runtime.sendMessage({ action: 'collect' }, (r) => {
    if (r && r.success) render(r.auth, r.missing);
    else setStatus('❌ ' + (r?.error || 'Неизвестная ошибка'), 'err');
  });
}

$('btnCollect').addEventListener('click', collect);

$('btnCopy').addEventListener('click', () => {
  navigator.clipboard.writeText($('preview').textContent).then(() => {
    const b = $('btnCopy'); b.textContent = '✅ Скопировано';
    setTimeout(() => b.textContent = '📋 Копировать', 1200);
  });
});

$('btnSave').addEventListener('click', () => {
  const blob = new Blob([$('preview').textContent + '\n'], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'deepseek-auth.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

collect();  // автосбор при открытии popup