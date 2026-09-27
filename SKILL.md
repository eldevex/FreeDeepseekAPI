---
name: reset
description: Сбросить сессию FreeDeepseekAPI и начать новый чат DeepSeek. Вызывать при фразах: новый чат, начни новый чат, создай новый чат, давай новый чат, начнём заново, начни с нуля, начни с чистого листа, сбрось сессию, сбрось чат, сбрось DeepSeek, сбрось контекст, очисти сессию, очисти чат, обнули чат, обнули контекст, забудь контекст, перезапусти сессию, reset deepseek, reset chat, start fresh, new chat, deepseek stuck, мы застряли, сообщения идут в старый чат. Также при ошибке context_length_exceeded.
---

# Reset DeepSeek Session

## Точные URL

| Действие | Метод | URL |
|---|---|---|
| Список сессий | GET | `http://localhost:9655/v1/sessions` |
| Сброс сессии | POST | `http://localhost:9655/reset-session?agent=<id>` |

Путей `/v1/reset-session` и `/v1/sessions/reset` **не существует** — они дают 404.

## Алгоритм

Выполни через `execute_shell_command`, без рассуждений:

### 1. Список сессий

```sh
curl -sS "http://localhost:9655/v1/sessions"
