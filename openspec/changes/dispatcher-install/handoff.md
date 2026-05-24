## Миссия

- Зафиксировать `dispatcher-install` как управляющий change для локального setup, smoke/preflight и install-time tooling.

## Унаследованный контекст

- parent_change: focus-tech
- strategy_root: focus-tech
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: `focus-tech` удерживает технические контуры, которым нужен отдельный dispatcher.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегия принадлежит `focus-tech`, тактика setup/tooling fixes принадлежит `dispatcher-install`.

## Обязательные источники

- openspec/changes/focus-tech/roadmaps/install.md
- openspec/changes/dispatcher-doc/proposal.md
- openspec/changes/dispatcher-test-system/proposal.md
- Какие ещё файлы и спецификации обязательны к чтению для dispatcher-install: текущие setup-related fixes и локальные smoke/onboarding tools.

## Границы исполнения

- Что входит в этот change: setup-flow, local-config, smoke/preflight, onboarding sync как install-time контур.
- Что сознательно не входит в этот change: public docs, UX продукта и install-critical перестройка стека.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: документация остаётся у `dispatcher-doc`, UX и runtime ownership остаются у профильных dispatcher'ов.

## Проверка результата

- verification_level: static/contract
- verification_command: npm run test:traceability
- Что именно должен доказать результат проверки: dispatcher оформлен полноценно и может принимать setup/tooling fixes как отдельный technical contour.

## Открытые вопросы

- Нужен ли позднее отдельный producer под массовые install pain points.
