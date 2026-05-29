## Миссия

- Что должен изменить этот change: устранить рассинхрон между runtime-контрактом onboarding prompt-слоя и install/smoke tooling, из-за которого `npm run smoke` и `tools/repair-onboarding.mjs` считают корректный onboarding-layout “сломанный”.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-bugfix
- strategy_root: focus-quality
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: defect уже воспроизведён через внешний `npm run smoke`: production build проходит, но onboarding-check падает, потому что smoke/repair ищут `onboarding/prompts/default.md`, тогда как runtime и фактический контент используют `onboarding/prompts/default.njk`. Внешний release-notes документ для `release-2026-05-24-night` тоже фиксирует продолжающийся ручной симптом вокруг install/smoke tooling, то есть проблема видна не только по локальному исходнику, но и в пользовательской приёмке.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию bugfix-потока держит `dispatcher-bugfix`; этот fix отвечает за узкий tooling/runtime contract вокруг onboarding preflight.

## Обязательные источники

- openspec/changes/dispatcher-bugfix/proposal.md
- openspec/specs/external-local-onboarding/spec.md
- openspec/specs/llm/spec.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-onboarding-njk-smoke-contract: `lib/onboarding/server.ts`, `tools/smoke-local-install/onboarding.mjs`, `tools/repair-onboarding.mjs`, `test/unit/onboarding-prompt-templates.test.ts`, `test/README.md`.

## Границы исполнения

- Что входит в этот change: сделать так, чтобы smoke/repair и runtime опирались на один и тот же onboarding layout contract и одинаково понимали канонический prompt template (`default.njk`), не выдавая ложный “Onboarding не готов”.
- Что сознательно не входит в этот change: redesign onboarding content, смена формата prompt templates обратно на `.md`, изменение сетевой части `git clone`.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: onboarding prompt-layer уже переведён на `.njk` с legacy fallback только там, где runtime его явно поддерживает; fix не должен откатывать этот курс.

## Проверка результата

- verification_level: integration
- verification_command: npm run smoke
- Что именно должен доказать результат проверки: smoke и repair больше не падают на валидном onboarding-layout только из-за ожидания `default.md`; preflight либо подтверждает корректный onboarding, либо сообщает реальную проблему layout/source.

## Открытые вопросы

- Нужно ли вынести layout validation в общий helper, чтобы runtime и CLI больше не дрейфовали независимо.
- Нужно ли дополнять unit coverage отдельным test для smoke-validator, чтобы регресс не вернулся.
