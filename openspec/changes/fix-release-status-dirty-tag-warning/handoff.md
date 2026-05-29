## Миссия

- Перестать говорить пользователю «нерелизная версия», когда он реально стоит на релизном теге, но имеет локальные изменения.

## Унаследованный контекст

- parent_change: dispatcher-bugfix
- strategy_root: focus-quality
- release_ref: release-2026-05-21-night

## Обязательные источники

- lib/system/release.ts
- lib/system/resources/content.json
- openspec/specs/resource-status/spec.md

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit && npm run test:traceability
- Что именно должен доказать результат проверки: tagged-dirty состояние диагностируется отдельно от truly-unreleased.
