## Миссия

- Что должен изменить этот change: согласовать level-3 описание, hidden check и рабочие имена style/styles файла
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-bugfix
- strategy_root: focus-public
- release_ref: release-2026-05-24-night
- producer_ref: (не задан)
- Что из родительского change уже решено: `dispatcher-doc` уже закрепил, что документационные изменения живут в отдельном контуре и должны синхронизировать наблюдаемое поведение системы с `README.md`, `docs/**` и связанными пользовательскими текстами.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию задаёт `dispatcher-doc`, тактические границы фиксирует этот fix, итоговую внешнюю проверку выполняет родительский агент или пользователь.

## Обязательные источники

- openspec/changes/dispatcher-doc/proposal.md
- openspec/changes/fix-level-3-style-file-contract/.openspec.yaml
- openspec/specs/level-labs/spec.md
- openspec/specs/component-file-set/spec.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-level-3-style-file-contract: `onboarding/levels/level-3/overview.md`, `onboarding/levels/level-3/config.json`, `onboarding/prompts/levels/level-3/check.njk`, `test/unit/onboarding-prompt-templates.test.ts`, `test/unit/p1-source-contracts.test.ts`

## Границы исполнения

- Что входит в этот change: выровнять имя style-файла для level 3 в onboarding-описании, hidden check prompt и test/source-contract слое.
- Что сознательно не входит в этот change: пересмотр структуры runtime workbench, списка editable files других уровней и Sandpack/CSS-пайплайна.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: каноническое имя рабочего файла `styles.ts` и сам документационный контур изменений уже определены действующими specs и metadata этого fix.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit
- Что именно должен доказать результат проверки: level-3 prompt и onboarding-описание больше не ссылаются на `style.ts`, а unit/source-contract тесты фиксируют канонический `styles.ts`.

## Открытые вопросы

- В metadata fix `parent_change=dispatcher-doc`, но исходный handoff раньше ссылался на `dispatcher-bugfix`. Для исполнения приоритет отдан metadata; если цепочку захотят выровнять полностью, это лучше закрывать отдельным housekeeping-изменением.
