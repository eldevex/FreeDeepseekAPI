# FreeDeepseekAPI

<p align="center">
  <strong>Локальный OpenAI-совместимый API-прокси для веб-чата DeepSeek</strong>
</p>

<p align="center">
  <a href="https://github.com/Swastik36/FreeDeepseekAPI/blob/main/LICENSE"><img alt="License MIT" src="https://img.shields.io/badge/license-MIT-green.svg" /></a>
  <img alt="Node.js 18 plus" src="https://img.shields.io/badge/node-18%2B-339933.svg" />
  <img alt="No npm dependencies" src="https://img.shields.io/badge/dependencies-0-blue.svg" />
  <img alt="OpenAI compatible" src="https://img.shields.io/badge/OpenAI-compatible-111111.svg" />
</p>

<p align="center">
  <a href="#-быстрый-старт">Быстрый старт</a> •
  <a href="#-возможности">Возможности</a> •
  <a href="#-примеры-запросов">Примеры</a> •
  <a href="#-модели">Модели</a> •
  <a href="#-эндпоинты">Эндпоинты</a> •
  <a href="#-open-webui">Open WebUI</a>
</p>

## ⚡ Быстрый старт

Установка одной командой (Linux/macOS нативно; Windows под Git Bash):

```bash
curl -fsSL https://raw.githubusercontent.com/Swastik36/FreeDeepseekAPI/main/scripts/install.sh | sh
```

Скрипт клонирует форк, проводит вас через вход в DeepSeek и устанавливает
systemd-сервис. Обновление позже — через `npm run update` (запускать из Git Bash
на Windows): команда отказывается работать при незакоммиченных изменениях,
делает только fast-forward, запускает тесты перед перезапуском и автоматически
откатывается при их провале.
*Ручная установка описана ниже.

FreeDeepseekAPI запускает локальный API-сервер для **веб-чата DeepSeek** (`chat.deepseek.com`) и позволяет подключать DeepSeek Web к Open WebUI, LiteLLM, Hermes, Claude Code, клиентам на базе OpenAI SDK и другим OpenAI-совместимым инструментам.

Проект работает через вашу обычную учётную запись DeepSeek в отдельном профиле Chrome. Локальный сервер принимает API-запросы и обращается к самому DeepSeek Web, используя сохранённую браузерную сессию.

> ⚠️ Это экспериментальный прокси для веб-чата. DeepSeek может изменить свой внутренний Web API без предупреждения. Для продакшена официальный платный API DeepSeek надёжнее. ⚠️

> Форк [ForgetMeAI/FreeDeepseekAPI](https://github.com/ForgetMeAI/FreeDeepseekAPI), поддерживается на [Swastik36/FreeDeepseekAPI](https://github.com/Swastik36/FreeDeepseekAPI).

---

## Навигация

- [Что это даёт](#-что-это-даёт)
- [Возможности](#-возможности)
- [Быстрый старт](#-быстрый-старт)
- [Настройка Windows](#-настройка-windows)
- [Установка Linux / Chromium](#-установка-linux--chromium)
- [Установка на VPS / headless](#-установка-на-vps--headless)
- [Rootless Podman](#-rootless-podman)
- [Диагностика / doctor](#-диагностика--doctor)
- [Переиспользование сессий и сброс чатов](#-переиспользование-сессий-и-сброс-чатов)
- [Пул мультиаккаунтов](#-пул-мультиаккаунтов)
- [Идеи для консольной авторизации](#-идеи-для-консольной-авторизации)
- [Smoke-тест](#-smoke-тест)
- [Примеры запросов](#-примеры-запросов)
  - [Chat Completions](#chat-completions)
  - [Reasoning](#reasoning)
  - [Веб-поиск](#веб-поиск)
  - [Стриминг](#стриминг)
  - [Anthropic Messages API](#anthropic-messages-api)
  - [OpenAI Responses API](#openai-responses-api)
  - [Tool calling](#tool-calling)
- [Модели](#-модели)
- [Эндпоинты](#-эндпоинты)
- [Open WebUI](#-open-webui)
- [OpenCode](#-opencode)
- [Обновление логина](#-обновление-логина)
- [Статус проекта](#-статус-проекта)

---

## 🎯 Что это даёт

- Используйте DeepSeek Web как локальный API-эндпоинт.
- Подключайте DeepSeek к Open WebUI и другим OpenAI-совместимым клиентам.
- Получайте обычные JSON-ответы или SSE-стриминг.
- Используйте reasoning-модели с отдельным `reasoning_content`.
- Работайте через шим Anthropic Messages API для Claude Code / Anthropic SDK.
- Используйте шим OpenAI Responses API для новых клиентов в стиле OpenAI/Codex.
- Держите отдельные веб-сессии для разных агентов/пользователей.

## ✨ Возможности

- **OpenAI-совместимый API:** `POST /v1/chat/completions`
- **Шим Anthropic:** `POST /v1/messages`
- **Шим OpenAI Responses:** `POST /v1/responses`
- **Стриминг:** SSE-чанки и обычные non-stream JSON-ответы
- **Вывод reasoning:** отдельный `reasoning_content` для thinking-моделей
- **Tool calling:** парсинг OpenAI tools, Anthropic tools и function tools из Responses
- **Возможности моделей:** `GET /v1/model-capabilities` с алиасами → реальный веб-режим
- **Сессии агентов:** отдельная сессия DeepSeek для каждого `user` / agent id
- **Восстановление сессий:** автосброс устаревших цепочек/сессий
- **Ноль зависимостей:** Node.js 18+, никаких npm-зависимостей

---

Ручная установка:

```bash
git clone https://github.com/Swastik36/FreeDeepseekAPI.git
cd FreeDeepseekAPI
npm run auth
npm start
```

`npm run auth` открывает меню авторизации:

1. выберите пункт `1`;
2. войдите в DeepSeek в отдельном профиле Chrome;
3. отправьте короткое сообщение вроде `ok`;
4. вернитесь в терминал и нажмите Enter.

`npm start` показывает меню запуска:

- `1` — авторизоваться / обновить вход в DeepSeek
- `2` — показать модели и их статусы
- `3` — запустить прокси
- `4` — выход

Для headless/CI-запуска без меню:

```bash
NON_INTERACTIVE=1 npm start
# или
SKIP_ACCOUNT_MENU=1 npm start
```

По умолчанию сервер слушает:

```text
http://localhost:9655
```

По умолчанию прокси доступен только с этой машины. Для доступа по сети
явно задайте адрес привязки и отдельный ключ прокси:

```bash
HOST=0.0.0.0 PROXY_API_KEY='замените-на-длинное-случайное-значение' npm start
```

После этого передавайте ключ как `Authorization: Bearer <ключ>`. Без
`PROXY_API_KEY` все эндпоинты, кроме health, остаются без аутентификации, так что не
выставляйте такой инстанс в сеть.

Запросы из браузера разрешены с loopback-origin'ов. Если UI открыт по другому адресу,
добавьте его точный origin через запятую, например
`PROXY_CORS_ORIGINS=https://ui.example.com,http://192.168.1.20:3000`.

---

## 🪟 Настройка Windows

```powershell
git clone https://github.com/Swastik36/FreeDeepseekAPI.git
cd FreeDeepseekAPI
npm run auth
npm start
```

Если Chrome установлен в нестандартном месте, укажите путь явно:

```powershell
$env:CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
npm run auth
```

Если Chrome не найден, `npm run auth` теперь печатает готовые инструкции для Windows/macOS/Linux вместо загадочного стека ошибок.

---

## 🐧 Установка Linux / Chromium

```bash
git clone https://github.com/Swastik36/FreeDeepseekAPI.git
cd FreeDeepseekAPI
CHROME_PATH=$(which chromium) npm run auth
npm start
```

Если Chromium называется иначе:

```bash
CHROME_PATH=$(which chromium-browser) npm run auth
# или
CHROME_PATH=$(which google-chrome) npm run auth
```

---

## 🖥 Установка на VPS / headless

Самый надёжный сценарий без Chrome на сервере:

1. На домашнем ПК с GUI/Chrome:

```bash
npm run auth
```

2. Скопируйте `deepseek-auth.json` на VPS:

```bash
scp deepseek-auth.json user@your-vps:/opt/FreeDeepseekAPI/deepseek-auth.json
```

3. На VPS импортируйте/проверьте файл и выставьте безопасные права:

```bash
cd /opt/FreeDeepseekAPI
npm run auth:import -- --input ./deepseek-auth.json
npm run doctor -- --offline
```

4. Запустите прокси без интерактивного меню:

```bash
NON_INTERACTIVE=1 npm start
```

Можно импортировать не только готовый `deepseek-auth.json`, но и экспорт cookie из браузера:

```bash
DEEPSEEK_TOKEN="<token>" npm run auth:import -- --input ./cookies.json
```

> Важно: `deepseek-auth.json` — это доступ к вашему входу в DeepSeek Web. Не коммитьте и не публикуйте его; храните с правами `0600`.

---

## 🐳 Rootless Podman

Контейнер предназначен только для неинтерактивного запуска прокси. Браузерную
авторизацию делайте на хосте через `npm run auth`: скрипты авторизации и
`deepseek-auth.json` не копируются в образ.

Запускайте Podman от обычного пользователя, без `sudo`.

1. Соберите локальный образ:

```bash
podman build --tag localhost/free-deepseek-api:local --file Containerfile .
```

2. Передайте DeepSeek-авторизацию и отдельный ключ прокси через секреты Podman:

```bash
podman secret create --replace free-deepseek-auth ./deepseek-auth.json

printf 'Proxy API key: '
IFS= read -r -s PROXY_API_KEY
printf '\n'
printf '%s' "$PROXY_API_KEY" |
  podman secret create --replace free-deepseek-proxy-key -
```

Используйте длинный случайный ключ. Значение остаётся в переменной
`PROXY_API_KEY` текущей оболочки, чтобы вы могли проверять API; оно не попадает
ни в образ, ни в командную строку Podman.

3. Запустите контейнер с минимальными привилегиями:

```bash
podman run --detach \
  --name free-deepseek-api \
  --publish 127.0.0.1:9655:9655 \
  --secret free-deepseek-auth,target=deepseek-auth.json,uid=1000,gid=1000,mode=0400 \
  --secret free-deepseek-proxy-key,target=proxy-api-key,uid=1000,gid=1000,mode=0400 \
  --read-only \
  --cap-drop=ALL \
  --security-opt=no-new-privileges \
  localhost/free-deepseek-api:local
```

Внутри контейнера уже заданы `NON_INTERACTIVE=1`, `HOST=0.0.0.0` и
пути к обоим секретам. `REQUIRE_PROXY_API_KEY=1` не даёт контейнеру запуститься,
если секрет с ключом отсутствует или пуст. На хосте порт публикуется только на
`127.0.0.1`; не убирайте этот адрес без отдельного сетевого фаервола/политики
доступа.

4. Проверьте живость, готовность аккаунта и защищённый эндпоинт:

```bash
podman healthcheck run free-deepseek-api
curl --fail http://127.0.0.1:9655/readyz
curl --fail \
  -H "Authorization: Bearer $PROXY_API_KEY" \
  http://127.0.0.1:9655/v1/models
```

Встроенный healthcheck проверяет локальный `/health` (жив ли процесс).
`/readyz` дополнительно возвращает `503`, если ни один аккаунт не подходит под
предикат готовности (credential/cooldown/quota); это не индикатор ёмкости.
Диагностика контейнера:

```bash
podman logs free-deepseek-api
podman inspect --format '{{.State.Health.Status}}' free-deepseek-api
```

Остановка и удаление контейнера вместе с сохранёнными секретами Podman:

```bash
podman stop free-deepseek-api
podman rm free-deepseek-api
podman secret rm free-deepseek-auth free-deepseek-proxy-key
unset PROXY_API_KEY
```

При ротации авторизации или ключа прокси заменяйте соответствующий секрет и пересоздавайте
контейнер, чтобы поведение не зависело от версии Podman.

---

## 🩺 Диагностика / doctor

```bash
npm run doctor
# без сетевых запросов к DeepSeek:
npm run doctor -- --offline
```

`doctor` проверяет:

- находится ли `deepseek-auth.json` / `DEEPSEEK_AUTH_DIR`;
- валиден ли JSON;
- присутствуют ли `token`, `cookie`, `wasmUrl`;
- безопасны ли права файла на macOS/Linux (`0600`);
- при обычном запуске — доступен ли PoW-эндпоинт DeepSeek (таймаут 30 секунд на аккаунт, проверяется последовательно).

Если видите `data.biz_data is null`, `fetch failed`, `401/403/429` или Hermes/OpenCode не видит модели — сначала запустите `npm run doctor`.

---

## ♻️ Переиспользование сессий и сброс чатов

FreeDeepseekAPI не создаёт новый чат DeepSeek на каждый HTTP-запрос без причины. Логика такая:

- один `x-agent-session`, `session` или `user` → одна сессия чата DeepSeek;
- если id сессии уже существует — прокси переиспользует её и продолжает цепочку через `parent_message_id`;
- только явный `/new` или эндпоинт сброса очищает живой чат; клиентская компактация и миграция при rate-limit — два санкционированных пути сброса;
- параллельные ходы для одной и той же разрешённой сессии отклоняются с `409 session_busy`, а не гоняются за курсором parent;
- локальная история хранится как ограниченное recovery-резюме для санкционированных путей создания нового чата;
- длинные запросы агента ограничиваются `DEEPSEEK_MAX_PROMPT_CHARS` до отправки (по умолчанию 80 000 символов): начало задачи, свежие результаты инструментов и адаптер инструментов сохраняются;
- если клиент уже прислал многоходовую историю, локальная recovery-история не добавляется второй раз;
- пустой ответ повторяется максимум `DEEPSEEK_MAX_RETRIES` раз (по умолчанию 2), с сокращением контекста на каждой попытке.

Чтобы явно задать агента/сессию:

```bash
curl -X POST http://localhost:9655/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "x-agent-session: my-agent" \
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"Привет"}]}'
```

Список активных сессий:

```bash
curl --fail -H "Authorization: Bearer ${PROXY_API_KEY}" \
  http://localhost:9655/v1/sessions
```

Сброс одной сессии:

```bash
curl --fail -X POST \
  -H "Authorization: Bearer ${PROXY_API_KEY}" \
  "http://localhost:9655/reset-session?agent=my-agent"
```

Сброс всех сессий в пространстве имён аутентифицированного вызывающего:

```bash
curl --fail -X POST \
  -H "Authorization: Bearer ${PROXY_API_KEY}" \
  "http://localhost:9655/reset-session?agent=all"
```

При заданном `PROXY_API_KEY` логические имена агентов изолированы по ключу-принципалу. Без
ключа имена, задаваемые заголовком, намеренно отключены: loopback-вызывающие используют общий
бакет `dev-agent`, а удалённые изолируются по IP. Reset-all никогда
не пересекает границу этого безключевого пространства имён.

Почему чаты всё равно видны в DeepSeek Web: прокси работает через внутренний Web Chat API, и DeepSeek хранит реальные сессии чата у себя. Для веб-прокси это нормально. Смысл переиспользования сессий — не плодить новые чаты без нужды и аккуратно сбрасывать только когда цепочка устарела/сломалась.

---

## 👥 Пул мультиаккаунтов

Можно подключить несколько auth-файлов. Правильная модель — один «липкий» аккаунт на агента/сессию: прокси никогда молча не переключает учётные данные внутри живого чата DeepSeek. Если аккаунт возвращает `401/403` или уходит в cooldown `429`, существующий удалённый чат падает быстро, сохраняя своего владельца и курсор; ротация возможна только для сессий без чата, а явный путь миграции при rate-limit выполняет перенос с восстановительным промптом.

Вариант 1 — директория с auth-файлами:

```bash
mkdir -p accounts
cp deepseek-auth-main.json accounts/main.json
cp deepseek-auth-backup.json accounts/backup.json
chmod 600 accounts/*.json
DEEPSEEK_AUTH_DIR=./accounts NON_INTERACTIVE=1 npm start
```

Вариант 2 — список файлов:

```bash
DEEPSEEK_AUTH_PATH="./accounts/main.json,./accounts/backup.json" NON_INTERACTIVE=1 npm start
```

Как работает пул:

- новый агент/сессия получает аккаунт с наименьшим счётом (умная маршрутизация, см. ниже);
- выбранный аккаунт закрепляется за сессией (`sticky`);
- HTTP `429` отправляет аккаунт в таймаут cooldown; HTTP `401`/`403` помечает его учётные данные недоступными;
- живой чат никогда не переезжает на другие учётные данные за спиной клиента: владельцы в состоянии cooling, исчерпанной квоты, насыщения или мёртвой авторизации падают быстро, сохраняя удалённый чат; сессии без чата могут ротироваться;
- авторизованные вызывающие видят санитизированный статус аккаунтов в `/health`; анонимные пробы получают только данные о живости, если не задан `DEEPSEEK_PUBLIC_STATUS=1`;
- auth-файлы должны храниться с правами `0600`.

Приём запросов ограничен глобально и по аккаунту:

```bash
DEEPSEEK_MAX_CONCURRENT=24 npm start    # положительное целое; одновременные ходы completion по всему пулу
DEEPSEEK_MAX_PER_ACCOUNT=1 npm start    # целое 0-10; 0 отключает этот потолок на аккаунт
```

Лизинг на аккаунт держится в течение всего апстрим-хода, включая стриминг токенов
и повторные попытки на месте. При начальном/sticky-приёме возвращается короткий
ответ `503 overloaded`, если все в остальном готовые аккаунты на потолке;
миграция при rate-limit использует ту же классификацию, когда соседи просто заняты.

Неожиданные рантайм-сбои (`unhandledRejection`/`uncaughtException`) сохраняют
сессии и завершают процесс с ненулевым кодом, чтобы systemd перезапустил чистый процесс (по умолчанию включено):

```bash
DEEPSEEK_FATAL_ON_UNHANDLED=0 npm start  # 0 = только лог, продолжать работу (отладка)
```

### Умная маршрутизация

Новые чаты назначаются по наименьшему счёту: занятые аккаунты сбрасывают нагрузку, проблемные избегаются в течение одной-двух ошибок, старые ошибки затухают, а недавно успешный аккаунт получает небольшой бонус. Предпочтительный аккаунт и домашняя привязка — это смещения, а не блокировки. Настройка:

```bash
DEEPSEEK_ROUTING_CONSECUTIVE_STRIKES=2 npm start        # ошибок до отстранения аккаунта
DEEPSEEK_ROUTING_ESCALATION_COOLDOWN_MS=60000 npm start # короткое отстранение при повторных мягких сбоях
DEEPSEEK_ROUTING_FAILURE_HALFLIFE_MS=300000 npm start   # период полураспада ошибок (0 отключает затухание)
DEEPSEEK_ROUTING_FAILURE_WEIGHT=4 npm start             # штраф скорера за ошибку
DEEPSEEK_ROUTING_TIMEOUT_WEIGHT=12 npm start            # штраф скорера за подряд идущий таймаут
DEEPSEEK_ROUTING_HOT_BONUS=2 npm start                  # бонус самому недавно успешному аккаунту
DEEPSEEK_ROUTING_HOT_WINDOW_MS=60000 npm start          # насколько «недавно успешный» — недавно
```

Дополнительные fallback-теги для tool-call (строковые субстроки-сентинелы, `;` разделяет
начала и концы, `|` разделяет записи — регулярки никогда не используются; максимум 32 тега
по 128 символов, лишние `;`-секции игнорируются с предупреждением; читается один раз при
старте, для применения перезапустите):

```bash
DEEPSEEK_TOOL_TAGS="<mytools>|<tool_begin>;</mytools>|<tool_end>" npm start
```

Опциональный повтор при rate-limit в том же чате (по умолчанию выключен — сохранён fail-fast 429):

```bash
DEEPSEEK_RETRY_RATELIMIT=1 npm start  # одна пауза 2с + повтор на месте, только для неизвестных/коротких бэкоффов
```

С включённым повтором ход, ограниченный по рейту, ждёт один раз (2с, либо `Retry-After`
апстрима вплоть до лимита в 10с — более длинные бэкоффы сразу уходят в миграцию), снимает
cooldown аккаунта ровно на одну попытку тем же аккаунтом и тем же чатом и восстанавливает
его без продления при ошибке. Когда всё исчерпано, прокси отвечает 429 с сообщением
о бэкоффе + рекомендацией `/compact` (статус и `Retry-After`
не меняются, чтобы клиенты продолжали бэкоффиться, а не долбить).

Настройка cooldown:

```bash
DEEPSEEK_ACCOUNT_COOLDOWN_MS=600000 npm start
```

Почасовой лимит запросов на аккаунт (анти-мут — апстрим успокаивает аккаунты,
которые держат сотни запросов в час; аккаунты сверх квоты отсиживаются как в
cooldown; когда все исчерпаны — 429 с `Retry-After`):

```bash
DEEPSEEK_HOURLY_QUOTA=60 npm start  # 0 отключает; скользящее окно 1ч на аккаунт
```

Ограничение всплесков (анти-скорость — максимум ходов на скользящее окно 60с;
быстро отклоняет 429, не трогая состояние скорера; выключено до замеров):

```bash
DEEPSEEK_BURST_PER_MINUTE=0 npm start  # 0 отключает; кандидат 10 после замеров
```

Turn-aware pacing (анти-скорость — минимальный промежуток между последовательными
ходами цикла агента на одном аккаунте; человеческие ходы никогда не задерживаются).
Пейсер спит, только пока остаётся достаточно бюджета дедлайна запроса; иначе
отвечает 429 с `Retry-After` и сохраняет чат. Значения по умолчанию ВКЛЮЧЕНЫ — задайте
промежуток в `0`, чтобы отключить:

```bash
DEEPSEEK_AGENT_TURN_GAP_MS=6000 npm start       # целевой минимальный промежуток между ходами агента (0 отключает; максимум 60000)
DEEPSEEK_TURN_JITTER_MS=2000 npm start          # случайный равномерный джиттер к промежутку (максимум 60000)
DEEPSEEK_MIN_USABLE_UPSTREAM_MS=10000 npm start # минимальный бюджет дедлайна для сна вместо отклонения (максимум: дедлайн запроса)
```
Значения вне диапазона логируют предупреждение и откатываются к дефолтам; промежуток
не меньше минимально используемого логирует предупреждение при загрузке, так как
при жёстких дедлайнах будет отклонение, а не сон.

Фоновая телеметрия (совещательная — периодический `GET /api/v0/users/current` на аккаунт,
чтобы логин показывал нормальное присутствие браузерного маршрута; по умолчанию выключено,
fire-and-forget, 401 логируется, но никогда не остужает аккаунт):

```bash
DEEPSEEK_AMBIENT_TELEMETRY=1 npm start          # 0 отключает
DEEPSEEK_TELEMETRY_INTERVAL_MS=900000 npm start # минимальный интервал между пингами (по умолчанию 15м)
```

Обнаружение моделей (совещательное — часовой опрос флагов моделей апстрима в `/health`;
никогда не добавляет/удаляет алиасы):

```bash
DEEPSEEK_MODEL_DISCOVERY=1 npm start   # 0 отключает
```

---

## 🔑 Идеи для консольной авторизации

Поток с паролем из PR #3 реализуем, но безопаснее не хранить пароль и не делать его поведением по умолчанию. Разумная реализация:

1. `npm run auth:console` запрашивает email/телефон и пароль через скрытый ввод.
2. Пароль живёт только в памяти процесса — никогда не пишется в файлы/логи/историю.
3. Скрипт воспроизводит веб-поток входа через `fetch`/CDP: получает challenge captcha/verify, отдаёт человеку ссылку/код, ждёт подтверждения.
4. После успешного входа сохраняется только `deepseek-auth.json` стандартного формата.
5. Если DeepSeek просит captcha/2FA — скрипт честно говорит «открой ссылку, пройди проверку, нажми Enter», вместо попыток обойти защиту.
6. Для VPS лучше режим `auth:console --no-save-password --output deepseek-auth.json`.

Минимальный безопасный MVP: консольная авторизация только интерактивная, без пароля из env. Приемлемый вариант автоматизации: `DEEPSEEK_EMAIL=... npm run auth:console`, но пароль всё равно вводится через скрытый prompt.

---

## ✅ Smoke-тест

```bash
curl --fail http://localhost:9655/health
curl --fail http://localhost:9655/readyz
curl --fail -H "Authorization: Bearer ${PROXY_API_KEY}" \
  http://localhost:9655/v1/models
curl --fail -H "Authorization: Bearer ${PROXY_API_KEY}" \
  http://localhost:9655/v1/model-capabilities
```

`/health` — проба живости, всегда возвращает `status: "ok"`, пока
процесс работает. `/readyz` — семантическая проба готовности: возвращает HTTP
200, когда хотя бы у одного аккаунта есть учётные данные и он не находится в auth-unavailable, probe-active, cooling или quota/burst-limited. Предикат (см. `isAccountReady` в server.js): `ready = has-credentials AND NOT (auth-unavailable OR probe-active OR cooling OR quota/burst-limited)`. Он намеренно остаётся готовым при нормальном стриминговом
насыщении и не утверждает, что PoW WASM URL провалидирован. Анонимные
пробы статуса не содержат данные об аккаунте, модели и сессии; настройте
`PROXY_API_KEY` и отправляйте `Authorization: Bearer ...` для санитизированного операционного
статуса, либо явно включите `DEEPSEEK_PUBLIC_STATUS=1` в доверенной
сети.

---

## 🧪 Примеры запросов

### Chat Completions

```bash
curl -X POST http://localhost:9655/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Привет! Ответь одним предложением."}],
    "stream": false
  }'
```

### Reasoning

```bash
curl -X POST http://localhost:9655/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-reasoner",
    "messages": [{"role": "user", "content": "Кратко: почему небо синее?"}],
    "stream": false
  }'
```

Для reasoning-моделей API возвращает цепочку размышлений отдельно от финального ответа:

- non-stream: `choices[0].message.reasoning_content`
- stream: `choices[0].delta.reasoning_content`
- usage: `usage.completion_tokens_details.reasoning_tokens`

`reasoning_tokens` — грубая оценка из извлечённого из DeepSeek Web текста `THINK`, поскольку веб-стрим не сообщает официальное потребление токенов на reasoning отдельно.

### Веб-поиск

```bash
curl -X POST http://localhost:9655/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat-search",
    "messages": [{"role": "user", "content": "Найди свежий факт о DeepSeek и ответь кратко."}],
    "stream": false
  }'
```

### Стриминг

```bash
curl -N -X POST http://localhost:9655/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Напиши короткую шутку."}],
    "stream": true
  }'
```

### Anthropic Messages API

```bash
curl -X POST http://localhost:9655/v1/messages \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "max_tokens": 512,
    "messages": [{"role": "user", "content": "Ответь ровно OK"}],
    "stream": false
  }'
```

Для Claude Code можно направить бэкенд напрямую:

```bash
export ANTHROPIC_BASE_URL="http://127.0.0.1:9655"
export ANTHROPIC_AUTH_TOKEN="dummy-key"
export CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY=1
claude --model deepseek-chat
```

### OpenAI Responses API

```bash
curl -X POST http://localhost:9655/v1/responses \
  -H "Content-Type: application/json" \
  -d '{
    "model": "deepseek-chat",
    "input": "Ответь ровно OK",
    "stream": false
  }'
```

### Tool calling

FreeDeepseekAPI принимает:

- OpenAI `tools`;
- Anthropic `tools`;
- function tools из Responses API.

Прокси просит DeepSeek вернуть строгий JSON tool call, но также умеет парсить fallback-форматы:

- `TOOL_CALL:`
- JSON в ограждении с явной обёрткой `tool_call`, `tool_calls` или `function_call`
- `<tool_call>...</tool_call>`
- DeepSeek DSML (`<｜DSML｜tool_calls>...`) и веб-вариант с `
