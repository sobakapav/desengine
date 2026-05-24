## Миссия

- Что должен изменить этот change: отдельная реализация не требуется; change закрывается как дубликат.
- Этот change не должен заново менять код, потому что нужная правка уже выполнена в другом fix.

## Унаследованный контекст

- parent_change: dispatcher-prompts
- strategy_root: focus-onboarding
- release_ref: release-2026-05-24-night
- producer_ref: (не задан)
- Что из родительского change уже решено: hidden check level 3 уже приведён к каноническому имени `styles.ts` в рамках `fix-level-3-style-file-contract`.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию задаёт `focus-onboarding`, тактику и приёмку формулирует `dispatcher-prompts`, но повторная реализация не нужна.

## Обязательные источники

- openspec/changes/dispatcher-prompts/proposal.md
- openspec/changes/dispatcher-prompts/design.md
- openspec/changes/dispatcher-prompts/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-level-3-hidden-check-style-file: `openspec/changes/archive/2026-05-24-fix-level-3-style-file-contract/**`, `onboarding/prompts/levels/level-3/check.njk`, `onboarding/levels/level-3/overview.md`, `test/unit/onboarding-prompt-templates.test.ts`, `test/unit/p1-source-contracts.test.ts`

## Границы исполнения

- Что входит в этот change: зафиксировать, что этот fix дублирует уже выполненную работу, и убрать его из активного релизного состава через архивирование.
- Что сознательно не входит в этот change: любые новые правки в `onboarding`, prompts, tests или runtime.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: каноническое имя `styles.ts` и само исправление hidden check уже закрыты другим fix.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit
- Что именно должен доказать результат проверки: активный change не требует отдельной реализации, потому что дублируемое поведение уже исправлено и покрыто тестами.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: подтвердить отсутствие уникального scope относительно `fix-level-3-style-file-contract`.
