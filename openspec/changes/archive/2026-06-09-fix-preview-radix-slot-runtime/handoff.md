## Миссия

- Устранить drift версий `@radix-ui/*` внутри Sandpack preview, чтобы runtime не падал на `alert-dialog` и соседних primitives из-за несовместимого dependency graph.

## Унаследованный контекст

- parent_change: dispatcher-bugfix
- strategy_root: focus-quality
- release_ref: release-2026-06-02-quality
- producer_ref: (не задан)
- Что из родительского change уже решено: preview/runtime ошибки считаются отдельным bug-class и должны исправляться на уровне реального runtime boundary, а не маскироваться в UI.
- Кто отвечает за стратегию, тактику и приёмку результата: `dispatcher-bugfix` и `focus-quality`.

## Обязательные источники

- openspec/specs/task/spec.md
- lib/lab/sandpack-preview.ts
- lib/lab/sandpack-ui-kits.config.ts
- lib/lab/sandpack-runtime-dependencies.ts
- test/unit/sandpack-preview.test.ts

## Границы исполнения

- Что входит в этот change: стабилизация version selection для Sandpack preview runtime, unit-регрессия, обновление OpenSpec-контракта.
- Что сознательно не входит в этот change: замена Sandpack, переписывание shadcn-компонентов, переход на другой preview bundler.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: сам курс на Sandpack preview и host-level runtime диагностику.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit -- test/unit/sandpack-preview.test.ts
- Что именно должен доказать результат проверки: payload builder использует exact installed версии для Radix/React runtime-пакетов и больше не отдаёт плавающие semver-диапазоны для preview dependency graph.

## Открытые вопросы

- Нужна ли после этого отдельная browser-level регрессия именно на `AlertDialog` внутри lab preview, если unit-контракт подтвердит exact version selection.
