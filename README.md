# DeutschMentor — персональный AI-репетитор немецкого

SaaS на **Next.js 16** (App Router) + **shadcn/ui**, AI на **Gemini `gemini-3.5-flash-lite`**, оплата **Stripe**, БД **Postgres (Neon) + Prisma**, авторизация **Auth.js** (email/пароль + Google). Интерфейс RU / EN.

## Тарифы

| | Free | Pro |
|---|---|---|
| Время практики | 10 минут в день (сброс в **12:00 по часовому поясу пользователя**) | без ограничений |
| Темы | базовые (этап «Начальный», A1–A2) | все уровни A1–C2 |
| Уроки | 5 уроков бесплатно | без ограничений |
| Квизы, задачи, грамматика, слова с переводом | ✔ | ✔ |
| Проверка произношения, speaking, listening | — | ✔ |
| Подробный разбор ошибок | — | ✔ |

Правила тарифов собраны в [src/lib/plans.ts](src/lib/plans.ts); расчёт полуденного окна — в [src/lib/usage-window.ts](src/lib/usage-window.ts) (покрыт тестами).

## Учебная программа

3 этапа и 11 уровней ([src/content/curriculum.ts](src/content/curriculum.ts)), в каждом уровне 3 темы с грамматикой и словарём:

- **Начальный**: A1.1, A1.2, A2.1, A2.2
- **Продвинутый**: B1.1, B1.2, B2.1, B2.2
- **Эксперт**: C1.1, C1.2, C2

## Запуск

```bash
npm install
cp .env.example .env.local   # заполните ключи
npm run db:migrate           # создаёт таблицы в Neon
npm run dev
```

Нужны:

- `DATABASE_URL` / `DIRECT_URL` — строки подключения Neon (pooled и direct).
- `AUTH_SECRET` — `npx auth secret`. Google OAuth опционален (`AUTH_GOOGLE_ID/SECRET`, redirect URI `http://localhost:3000/api/auth/callback/google`).
- `GEMINI_API_KEY` — ключ из Google AI Studio. Модель задаётся `GEMINI_MODEL` (по умолчанию `gemini-3.5-flash-lite`), озвучка — `GEMINI_TTS_MODEL`.
- Stripe: создайте продукт «Pro» с ежемесячной ценой → `STRIPE_PRO_PRICE_ID`; включите Customer Portal в Dashboard.

### Stripe webhook локально

```bash
npm run stripe:listen   # stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Скопируйте выданный `whsec_…` в `STRIPE_WEBHOOK_SECRET`. Обрабатываются события `checkout.session.completed`, `customer.subscription.created|updated|deleted`, `invoice.payment_failed`. Тестовая карта: `4242 4242 4242 4242`.

### Проверка лимита

Поставьте `FREE_DAILY_SECONDS=30` в `.env.local` — через 30 секунд активной практики появится окно «Дневной лимит исчерпан».

## Архитектура

- `src/app/(marketing)` — лендинг, тарифы, вход/регистрация.
- `src/app/(app)` — личный кабинет: дашборд, уроки, практика, ошибки, настройки, онбординг.
- `src/app/api/ai/*` — AI-эндпоинты (чат со стримингом, квизы, грамматика, слова, проверка текста; Pro: произношение, speaking, listening, TTS, анализ ошибок). Все обёрнуты в `guarded()` ([src/lib/api.ts](src/lib/api.ts)) — авторизация, проверка Pro и дневного лимита на сервере.
- Время практики считается heartbeat-запросами (`POST /api/usage` каждые 15 с, только при активной вкладке) из `PracticeSession`.
- `src/proxy.ts` — оптимистичная проверка сессии для приватных маршрутов (в Next 16 `middleware` переименован в `proxy`).

## Скрипты

- `npm test` — юнит-тесты (vitest)
- `npm run lint`, `npm run build`
- `npm run db:studio` — Prisma Studio
