## Миссия

- Сделать onboarding sync устойчивым к `EXDEV` и не допускать полусломанного `/onboarding`.

## Унаследованный контекст

- parent_change: dispatcher-bugfix
- strategy_root: focus-quality
- release_ref: release-2026-05-21-night

## Обязательные источники

- tools/repair-onboarding.mjs
- tools/smoke-local-install/onboarding.mjs
- openspec/specs/onboarding-repo/spec.md
- openspec/specs/external-local-onboarding/spec.md

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit && npm run test:traceability
- Что именно должен доказать результат проверки: sync переживает cross-device перенос и не оставляет ложный marker.
