# MessageVault — сервис для сохранения сообщений

## Описание проекта

Вам предстоит развернуть небольшое веб-приложение **MessageVault** с помощью **Dockerfile**, **Nginx** и **Docker Compose**.

MessageVault позволяет сохранять текстовые сообщения через веб-интерфейс и просматривать ранее сохраненные сообщения.

Проект состоит из трех сервисов:

- **Frontend** — React + TypeScript + Vite
- **Backend** — FastAPI
- **PostgreSQL** — база данных для хранения сообщений

Ваша задача — контейнеризировать приложение и объединить все сервисы с помощью **Docker Compose**, чтобы весь проект можно было запустить одной командой.

Схема приложения должна выглядеть примерно так:

```text
Browser
   |
   v
Nginx
   | \
   |  \ /api/*
   |   \
   v    v
React  FastAPI
          |
          v
      PostgreSQL
```

---

## Что такое Dockerfile?

**Dockerfile** — это текстовый файл с инструкциями для создания Docker-образа.

В нем описывается окружение приложения: базовый образ, установка зависимостей, копирование исходного кода и команда запуска контейнера.

[Документация Dockerfile](https://docs.docker.com/reference/dockerfile/)

---

## Что такое Docker Compose?

**Docker Compose** позволяет описать и запустить сразу несколько связанных Docker-контейнеров.

В данном проекте с помощью `docker-compose.yml` необходимо объединить:

```text
frontend
backend
postgres
```

После настройки весь проект должен запускаться одной командой:

```bash
docker compose up -d --build
```

[Документация Docker Compose](https://docs.docker.com/compose/)

---

# Развертывание приложения

## Backend

Backend проекта написан на **Python 3.12** с использованием **FastAPI**.

Ваша задача — написать для него `Dockerfile`.

### Установка зависимостей

Зависимости находятся в:

```text
backend/requirements.txt
```

Для установки используется команда:

```bash
pip install --no-cache-dir -r requirements.txt
```

### Запуск Backend

Backend запускается через Uvicorn:

```bash
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

Обратите внимание на:

```text
--host 0.0.0.0
```

В Docker-контейнере приложение не должно слушать только `localhost`, иначе другие контейнеры не смогут к нему подключиться.

Используя эти данные и документацию Docker, напишите `Dockerfile` для Backend.

---

## PostgreSQL

Backend использует базу данных **PostgreSQL**.

Для PostgreSQL собственный Dockerfile писать не требуется — используйте официальный образ:

[PostgreSQL Docker Image](https://hub.docker.com/_/postgres)

Параметры базы данных должны задаваться через переменные окружения.

Пример:

```env
POSTGRES_DB=messagevault
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
```

Обратите внимание:

```env
POSTGRES_HOST=postgres
```

В Docker Compose контейнеры обращаются друг к другу по **имени сервиса**.

Если сервис базы данных называется:

```yaml
services:
  postgres:
```

то Backend должен обращаться к PostgreSQL по адресу:

```text
postgres:5432
```

а не:

```text
localhost:5432
```

---

# Frontend

Frontend проекта написан на:

- React
- TypeScript
- Vite

Для production нельзя использовать встроенный dev-сервер Vite.

То есть вариант:

```bash
npm run dev
```

для production-контейнера использовать не нужно.

Frontend должен сначала собираться:

```bash
npm install
npm run build
```

После этого Vite создаст директорию:

```text
dist/
```

Готовые файлы из `dist/` необходимо отдавать через **Nginx**.

---

## Dockerfile для Frontend

Для Frontend рекомендуется использовать **multi-stage build**.

Примерная схема:

```text
Node.js
   |
   | npm install
   | npm run build
   v
 dist/
   |
   v
 Nginx
```

Первый stage должен использовать Node.js и собирать приложение.

Второй stage должен использовать Nginx и содержать только готовую production-сборку.

Ваша задача — самостоятельно написать такой Dockerfile.

Документация:

- [Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- [Nginx Docker Image](https://hub.docker.com/_/nginx)

---

# Настройка Nginx

Для Frontend необходимо самостоятельно написать конфигурацию Nginx.

Например:

```text
frontend/nginx.conf
```

Nginx должен выполнять две задачи:

1. Отдавать собранный React Frontend.
2. Проксировать запросы к Backend.

Frontend должен быть доступен через:

```text
/
```

API-запросы должны проксироваться через:

```text
/api/
```

Пример маршрутизации:

```text
GET /
        -> React

GET /assets/*
        -> React static files

GET /api/messages
        -> backend:8000/messages

POST /api/messages
        -> backend:8000/messages
```

Для React также необходимо настроить fallback на `index.html`, чтобы маршруты SPA не приводили к `404`.

Для этого изучите:

- [Nginx try_files](https://nginx.org/en/docs/http/ngx_http_core_module.html#try_files)
- [Nginx proxy_pass](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass)

В итоговой конфигурации вам понадобятся директивы вроде:

```nginx
location / {
    ...
}

location /api/ {
    ...
}
```

Готовый `nginx.conf` в задании не предоставляется — его необходимо написать самостоятельно.

---

# VITE_API_URL

Frontend не должен содержать жестко прописанный адрес Backend, например:

```text
http://localhost:8000
```

Адрес API необходимо передавать через переменную окружения Vite.

Используйте переменную:

```env
VITE_API_URL=/api
```

В коде Frontend значение должно читаться через:

```ts
import.meta.env.VITE_API_URL
```

Например, базовый URL API может выглядеть так:

```ts
const API_URL = import.meta.env.VITE_API_URL
```

После этого запрос сообщений должен строиться относительно этой переменной:

```text
${VITE_API_URL}/messages
```

При production-развертывании:

```env
VITE_API_URL=/api
```

тогда браузер будет отправлять запрос:

```text
/api/messages
```

а Nginx уже перенаправит его в Backend.

Важно понимать:

```text
backend:8000
```

доступен внутри Docker-сети, но браузер пользователя не знает, что такое Docker-сервис `backend`.

Поэтому писать во Frontend:

```env
VITE_API_URL=http://backend:8000
```

неправильно.

Правильная схема:

```text
Browser
   |
   | /api/messages
   v
Nginx
   |
   | proxy_pass
   v
backend:8000/messages
```

---

## Переменные Vite и Docker Build

Переменные `VITE_*` подставляются Vite **во время сборки Frontend**.

Поэтому значение `VITE_API_URL` должно быть доступно на этапе:

```bash
npm run build
```

Вы можете решить это одним из способов:

- использовать `.env`;
- передать переменную через Docker build argument;
- настроить другой подход передачи переменной во время сборки.

Главное требование:

```env
VITE_API_URL=/api
```

должно попасть в production-сборку Frontend.

Документация:

[Vite Env Variables](https://vite.dev/guide/env-and-mode)

---

# Docker Compose

После создания Dockerfile для Backend и Frontend необходимо написать:

```text
docker-compose.yml
```

Он должен объединять три сервиса:

```text
frontend
backend
postgres
```

Примерная схема:

```text
┌─────────────────┐
│    Frontend     │
│ React + Nginx   │
└───────┬─────────┘
        │
        │ /api
        ▼
┌─────────────────┐
│     Backend     │
│     FastAPI     │
└───────┬─────────┘
        │
        ▼
┌─────────────────┐
│   PostgreSQL    │
└─────────────────┘
```

Frontend должен обращаться к Backend через Nginx.

Backend должен обращаться к PostgreSQL через внутреннюю Docker-сеть.

---

# Переменные окружения Backend

Создайте `.env` для Backend.

Пример:

```env
POSTGRES_DB=messagevault
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

CORS_ORIGINS=http://localhost
```

Не добавляйте настоящий `.env` в Git.

Добавьте:

```gitignore
.env
```

В репозитории можно оставить:

```text
.env.example
```

---

# Важные моменты

## 1. Данные PostgreSQL должны сохраняться

После:

```bash
docker compose down
```

и повторного:

```bash
docker compose up -d
```

ранее сохраненные сообщения не должны исчезать.

Для этого необходимо настроить Docker Volume для PostgreSQL.

[Документация Docker Volumes](https://docs.docker.com/reference/compose-file/volumes/)

---

## 2. PostgreSQL должен иметь healthcheck

Backend не должен пытаться подключиться к базе данных до того, как PostgreSQL будет готов принимать подключения.

Настройте `healthcheck` для PostgreSQL.

Затем настройте зависимость Backend от состояния базы данных.

[Документация Docker Compose healthcheck](https://docs.docker.com/reference/compose-file/services/#healthcheck)

---

## 3. Не используйте localhost между контейнерами

Внутри Backend:

```text
localhost
```

означает сам контейнер Backend.

Поэтому для PostgreSQL необходимо использовать имя Docker Compose сервиса:

```text
postgres
```

То же относится и к другим контейнерам.

---

## 4. Не используйте Vite dev server в production

Неправильно:

```bash
npm run dev
```

Правильно:

```text
npm run build
        |
        v
      dist/
        |
        v
      Nginx
```

---

## 5. Nginx должен проксировать Backend

Frontend не должен напрямую обращаться к:

```text
http://localhost:8000
```

или:

```text
http://backend:8000
```

в браузере.

Вместо этого:

```env
VITE_API_URL=/api
```

и:

```text
/api/messages
```

должен проксироваться через Nginx в Backend.

---

## 6. Настройте SPA fallback

При открытии маршрутов Frontend Nginx не должен возвращать `404`, если файл физически отсутствует.

Для React-приложения необходимо использовать fallback на:

```text
/index.html
```

---

## 7. Не храните пароли в docker-compose.yml

Используйте `.env`.

Пример:

```env
POSTGRES_DB=messagevault
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change_me
```

---

# Проверка результата

После выполнения задания проект должен запускаться:

```bash
docker compose up -d --build
```

Проверить контейнеры:

```bash
docker compose ps
```

Должны работать три сервиса:

```text
frontend
backend
postgres
```

После открытия приложения в браузере пользователь должен иметь возможность:

1. Ввести сообщение.
2. Нажать кнопку сохранения.
3. Увидеть сохраненное сообщение в списке.
4. Обновить страницу и увидеть сообщение снова.
5. Перезапустить Docker Compose и убедиться, что данные сохранились.

---

# Остановка приложения

Остановить контейнеры:

```bash
docker compose down
```

Повторно запустить:

```bash
docker compose up -d
```

Сохраненные сообщения после повторного запуска должны остаться в PostgreSQL.

---

# Итоговое задание

Вам необходимо самостоятельно написать:

```text
backend/Dockerfile
frontend/Dockerfile
frontend/nginx.conf
docker-compose.yml
```

Также необходимо правильно настроить:

```text
.env
VITE_API
PostgreSQL volume
PostgreSQL healthcheck
Nginx reverse proxy
Docker networking
```

В результате весь MessageVault должен запускаться одной командой:

```bash
docker compose up -d --build
```
