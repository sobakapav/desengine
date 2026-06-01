## Миссия

- Что должен изменить этот change: создать рендер-шаблон для пятого уровня с прямым перебором mock-массива
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-workbench
- strategy_root: focus-features
- release_ref: release-2026-06-01-grooming
- producer_ref: (не задан)
- Что из родительского change уже решено: `dispatcher-workbench` уже зафиксировал workbench как общий продуктовый контур, а level-specific render template mechanism уже существует и не должен переоткрываться.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию держит `focus-features`, тактику и постановку этого runtime-среза держит `dispatcher-workbench`, приёмка результата идёт через внешний проверочный прогон unit + traceability.

## Обязательные источники

- openspec/changes/dispatcher-workbench/proposal.md
- openspec/changes/dispatcher-workbench/design.md
- openspec/changes/dispatcher-workbench/tasks.md
- openspec/specs/level-labs/spec.md
- openspec/specs/component-file-set/spec.md
- lib/lab/sandpack-template.ts
- lib/lab/sandpack-preview.ts
- test/unit/sandpack-template.test.ts
- test/unit/sandpack-preview.test.ts
- onboarding/levels/level-1/sandpack/App.tsx
- onboarding/levels/level-2/sandpack/App.tsx
- Какие ещё файлы и спецификации обязательны к чтению для implement-level-5-render-template-mock-array: `onboarding/levels/level-5/config.json`, `app/api/tasks/[taskId]/sandpack/route.ts`, `lib/task/actions/shared.ts`.

## Границы исполнения

- Что входит в этот change: level-owned `App.tsx` для `level-5`, прямой рендер всех элементов `mock`-массива, unit-покрытие template/payload.
- Что сознательно не входит в этот change: новый общий preview runtime, новая модель mock-данных, сложные эвристики layout/normalization, изменение других уровней.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: механизм выбора template по уровню уже принят; на каждом уровне может быть свой render-template; change должен использовать этот путь, а не создавать parallel runtime.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit -- test/unit/sandpack-template.test.ts test/unit/sandpack-preview.test.ts
- Что именно должен доказать результат проверки: `level-5` получает собственный template, preview payload использует его, а рендер применяет правило "на каждый элемент mock-массива — отдельный Component".

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: какой exact export shape ожидается от `mock.ts`; как безопасно повести себя при пустом массиве; нужно ли оборачивать варианты в минимальный layout-контейнер без искажения "тупого перебора".
