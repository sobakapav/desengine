## Миссия

- Закрыть расхождение между Tailwind-кодом пользователя и тем, как его показывает preview-runtime.

## Унаследованный контекст

- parent_change: dispatcher-bugfix
- strategy_root: focus-quality
- release_ref: release-2026-05-21-night

## Обязательные источники

- openspec/changes/dispatcher-bugfix/design.md
- openspec/specs/level-labs/spec.md
- openspec/specs/ui-foundation/spec.md
- lib/lab/sandpack-preview.ts

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit && npm run test:traceability
- Что именно должен доказать результат проверки: preview либо поддерживает arbitrary values, либо формализованно и явно ограничивает их без скрытого бага.
