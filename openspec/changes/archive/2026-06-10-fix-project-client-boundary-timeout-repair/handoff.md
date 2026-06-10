## Миссия

- Что должен изменить этот change: Устранить timeout в unit-тесте task-project-client-boundary, чтобы полный test:full снова проходил после project-aware wave.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-project
- strategy_root: focus-domain
- release_ref: release-2026-06-10-architecture
- producer_ref: (не задан)
- Что из родительского change уже решено: project-линия уже зафиксировала active project как canonical верхний контекст для task/workflow/workbench; downstream fixes не должны возвращать task-local fallback или размывать project-aware boundary.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию project-линии держит `producer-project`, тактический parent этого fix — `dispatcher-project`, приёмку результата и внешний verification выполняет родительский агент.

## Обязательные источники

- openspec/changes/dispatcher-project/proposal.md
- openspec/changes/dispatcher-project/design.md
- openspec/changes/dispatcher-project/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-project-client-boundary-timeout-repair:
  - test/unit/task-project-client-boundary.test.ts
  - components/desengine/lab/LabScreen/LabScreen.tsx
  - components/desengine/lab/TaskRoute/TaskRoute.tsx
  - components/desengine/lab/Workbench/useWorkbenchPersistence.ts
  - components/desengine/lab/Workbench/useWorkbenchTaskActions.ts
  - openspec/changes/release-2026-06-10-architecture/release-notes.md

## Границы исполнения

- Что входит в этот change:
  - локализовать и устранить timeout в unit-тесте `task-project-client-boundary`;
  - сохранить project-aware client boundary для open/start/save/reset/iterate surfaces;
  - при необходимости скорректировать только минимальный test harness или import surface, который вызывает зависание.
- Что сознательно не входит в этот change:
  - пересмотр project-aware контрактов как таковых;
  - переработка крупных client-компонентов вне связи с timeout;
  - массовая правка соседних unit/integration наборов.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться:
  - active project остаётся источником истины для client boundary;
  - open/start helpers обязаны нести project context в query/body;
  - bugfix должен быть локальным и не превращаться в откат project-wave semantics.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit -- test/unit/task-project-client-boundary.test.ts
- Что именно должен доказать результат проверки: узкий unit-набор больше не зависает на кейсе open/start helpers и продолжает подтверждать, что client boundary несёт active project в query/body без регрессии соседних project-aware assertions. Локальная sanity уже прошла: `1 passed`, `5 passed`, duration `2.00s`.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы:
  - root cause timeout находится в product-коде или в способе unit-импорта client-модулей;
    Решение: timeout создавал способ unit-импорта. Тест тянул `LabScreen` и `TaskRoute` целиком, а вместе с ними — тяжёлый `Workbench`/preview graph.
  - можно ли закрыть проблему чисто тестовой декомпозицией/import seam без изменения наблюдаемого поведения;
    Решение: да. `buildTaskOpenUrl` и `postTaskStart` вынесены в отдельный helper-модуль без React/UI-зависимостей, а экраны переподключены к нему без изменения runtime-семантики.
  - нужны ли дополнительные точечные проверки помимо текущего unit-файла.
    Решение: не нужны; текущий узкий unit-файл уже покрывает open/start/save/reset/iterate client boundary и source-контракт import seam.

## Что изменено

- Создан helper `components/desengine/lab/task-client-boundary.ts` с функциями `buildTaskOpenUrl` и `postTaskStart` без тяжёлых UI-импортов.
- `components/desengine/lab/LabScreen/LabScreen.tsx` и `components/desengine/lab/TaskRoute/TaskRoute.tsx` теперь используют этот helper вместо локальных реализаций open/start helpers.
- `test/unit/task-project-client-boundary.test.ts` переведён на импорт helper-модуля и обновлён source-контракт на проверку нового seam.
