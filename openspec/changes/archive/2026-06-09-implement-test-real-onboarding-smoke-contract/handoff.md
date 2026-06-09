## Миссия

- Что должен изменить этот change: вернуть отдельную runnable-проверку совместимости с реальным onboarding checkout и явно отделить её от deterministic unit-фикстур.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-test-system
- strategy_root: focus-quality
- release_ref: release-2026-06-02-quality
- producer_ref: (не задан)
- Что из родительского change уже решено: `dispatcher-test-system` уже закрепил, что тестовый слой обязан различать обязательный deterministic runnable-набор и отдельные проверки интеграционных поверхностей; `test:full` не должен случайно становиться сетезависимым.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию тестового слоя держит `dispatcher-test-system`, итоговую приёмку делает внешний проверяющий.

## Обязательные источники

- `openspec/changes/dispatcher-test-system/proposal.md`
- `openspec/changes/release-2026-06-02-quality/proposal.md`
- `openspec/specs/testing-layer/spec.md`
- `openspec/specs/external-local-onboarding/spec.md`
- `tools/smoke-local-install.mjs`
- `tools/smoke-local-install/onboarding.mjs`
- `tools/repair-onboarding.mjs`
- `lib/onboarding/server.ts`
- `docs/testing-layer.md`
- `test/unit/onboarding-prompt-templates.test.ts`

## Границы исполнения

- Что входит в этот change: отдельный smoke/integration-контракт реального onboarding checkout, явная документация его условий запуска, OpenSpec-фиксация distinction между unit-фикстурами и real checkout.
- Что сознательно не входит в этот change: возврат прямой зависимости `test:full` от `onboarding`, redesign onboarding content, install-critical изменения стека.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: deterministic обязательный слой остаётся без внешних credentials и без сетевой зависимости; реальная checkout-проверка живёт отдельно.

## Проверка результата

- verification_level: integration
- verification_command: `npm run smoke`
- Дополнительная обязательная проверка: `npm run test:unit -- test/unit/onboarding-prompt-templates.test.ts`
- Что именно должен доказать результат проверки: smoke либо подтверждает готовность реального onboarding checkout, либо честно диагностирует проблему источника/layout/sync state; при этом unit-слой остаётся deterministic и не читает реальный `onboarding` из рабочего дерева по умолчанию.

## Открытые вопросы

- Нужно ли в следующей волне выделить отдельный `test:onboarding:real` entry point, если одного `npm run smoke` окажется недостаточно для ясной операторской модели.
