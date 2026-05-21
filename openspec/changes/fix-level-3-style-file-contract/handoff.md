## Миссия

- Согласовать имя style-файла на level 3 между текстом уровня, hidden check и реальным файловым контрактом.

## Унаследованный контекст

- parent_change: dispatcher-bugfix
- strategy_root: focus-quality
- release_ref: release-2026-05-21-night

## Обязательные источники

- onboarding/levels/level-3/overview.md
- onboarding/prompts/levels/level-3/check.njk
- openspec/specs/level-labs/spec.md
- openspec/specs/component-file-set/spec.md

## Проверка результата

- verification_level: traceability
- verification_command: npm run test:traceability
- Что именно должен доказать результат проверки: level-3 contract не противоречит сам себе по имени style-файла.
