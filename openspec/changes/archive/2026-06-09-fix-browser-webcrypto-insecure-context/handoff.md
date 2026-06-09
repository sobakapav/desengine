## Миссия

- Устранить browser crash на insecure `http`-origin, где клиентский runtime сейчас падает на `crypto.subtle.digest` и запускает вторичные ошибки Monaco.

## Унаследованный контекст

- parent_change: dispatcher-bugfix
- strategy_root: focus-quality
- release_ref: release-2026-06-02-quality
- producer_ref: (не задан)
- Что из родительского change уже решено: downstream `fix-*` должен иметь явный воспроизводимый симптом, локальную границу исправления и runnable-проверку.
- Кто отвечает за стратегию, тактику и приёмку результата: `dispatcher-bugfix` маршрутизирует дефект, внешний проверяющий принимает код и проверку результата.

## Обязательные источники

- `openspec/changes/dispatcher-bugfix/proposal.md`
- `lib/auth/control.ts`
- `lib/auth/server.ts`
- `app/api/auth/prepare/route.ts`
- `app/api/auth/verify/route.ts`
- `components/desengine/auth/AuthScreen.tsx`
- связанные browser/unit тесты вокруг auth/runtime boundary

## Границы исполнения

- Что входит в этот change: локализация и устранение Web Crypto crash-path в browser runtime, regression guard и при необходимости явная диагностика ограничения insecure context.
- Что сознательно не входит в этот change: redesign auth flow, обязательный `https` для всех локальных сценариев, замена Monaco.

## Проверка результата

- verification_level: unit
- verification_command: `npm run test:unit -- test/unit/browser-webcrypto-runtime-boundary.test.ts`
- Что именно должен доказать результат проверки: клиентский путь больше не зависит от insecure `crypto.subtle` и не втягивает crash-path в browser runtime.

## Открытые вопросы

- Нужен ли после этого отдельный browser smoke именно по IP-origin, если unit guard подтвердит исправление boundary.
