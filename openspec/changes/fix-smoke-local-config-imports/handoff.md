## Миссия

- Убрать из setup-flow зависимость от несуществующего legacy-модуля `lib/local-config.cjs`.

## Унаследованный контекст

- parent_change: dispatcher-bugfix
- strategy_root: focus-quality
- release_ref: release-2026-05-21-night

## Обязательные источники

- tools/smoke-local-install.mjs
- tools/repair-onboarding.mjs
- tools/generate-allowlist-marker.mjs
- lib/system/config/local.cjs

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit && npm run test:traceability
- Что именно должен доказать результат проверки: критичные setup-tools больше не импортируют удалённый путь.
