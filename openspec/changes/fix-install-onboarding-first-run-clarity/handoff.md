## Миссия

- Убрать из первого прохода установки все места, где пользователь без девелоперского бэкграунда теряет контекст раньше, чем успевает дойти до продукта.

## Унаследованный контекст

- parent_change: dispatcher-doc
- strategy_root: focus-public
- release_ref: release-2026-05-21-night
- producer_ref: (не задан)
- Что из родительского change уже решено: `dispatcher-doc` владеет документационным контуром и ожидает, что docs-fix changes превращают пользовательские жалобы в конкретные правки текстов и контрактов.

## Обязательные источники

- openspec/changes/dispatcher-doc/.openspec.yaml
- openspec/changes/focus-public/roadmaps/documentation.md
- INSTALL.md
- INSTALL-USER.md
- README.md
- UPDATE.md

## Границы исполнения

- Что входит в этот change: install/onboarding copy первого прохода, явные инструкции по Node.js/npm/терминалу, снятие дублирования, предупреждения о tunnel-ограничениях, сканируемость стартовых текстов.
- Что сознательно не входит в этот change: runtime-чинка сети, LLM, allowlist или install-critical инфраструктуры.

## Проверка результата

- verification_level: traceability
- verification_command: npm run test:traceability
- Что именно должен доказать результат проверки: документационный контракт согласован и не ломает OpenSpec traceability.
