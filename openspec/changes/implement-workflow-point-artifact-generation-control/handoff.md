## Миссия

- Что должен изменить этот change: Сделать workflow-пункт реальным механизмом управления генерацией артефактов: selected point должен ограничивать primary file set и менять start/iterate поведение так, чтобы пользователь мог целенаправленно догенерировать component, styles, mock, props или storybook.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-workflow
- strategy_root: focus-domain
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено:
  - workflow уже заменяет level-driven language как основную user-facing модель;
  - image-to-component workflow уже разложен на coordinator step и пункты;
  - selected workflow-point уже влияет на screen focus, hint и prompt context.
- Кто отвечает за стратегию, тактику и приёмку результата:
  - стратегия и product pressure принадлежат workflow-линии;
  - этот implement change отвечает только за генерационный control layer;
  - финальная приёмка идёт через внешний verification agent или пользователя.

## Обязательные источники

- openspec/changes/dispatcher-workflow/proposal.md
- openspec/changes/dispatcher-workflow/design.md
- openspec/changes/dispatcher-workflow/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для implement-workflow-point-artifact-generation-control:
  - openspec/specs/workflow/spec.md
  - openspec/specs/task/spec.md
  - openspec/changes/implement-workflow-point-guidance-and-prompt-focus/specs/workflow/spec.md
  - lib/task/actions/start-stage.ts
  - lib/task/actions/iterate.ts
  - lib/task/actions/start-llm.ts
  - lib/task/actions/iterate-llm.ts
  - lib/task/actions/shared.ts

## Границы исполнения

- Что входит в этот change:
  - selected workflow-point ограничивает primary file set генерации;
  - `start` и `iterate` работают по target files выбранного пункта;
  - supporting files остаются контекстом, но не обязательным write-set.
- Что сознательно не входит в этот change:
  - отдельное управление check по пунктам workflow;
  - новая graph-модель зависимостей между артефактами;
  - redesign истории prompt/run на project page.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться:
  - workflow остаётся основной моделью исполнения;
  - результирующий render остаётся главным центром рабочей поверхности;
  - selected point может влиять на соседние файлы через контекст, но не должен снова растворяться в ad-hoc task-level логике.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit
- Что именно должен доказать результат проверки:
  - selected workflow-point реально меняет structured-output contract для `start` и `iterate`;
  - unit boundary фиксирует target file set;
  - старое поведение без explicit point не ломается.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы:
  - что считается fallback behavior без selected point;
  - как оставить supporting context без возврата к генерации «всего подряд»;
  - какие unit-тесты достаточно явно доказывают новый control layer.
