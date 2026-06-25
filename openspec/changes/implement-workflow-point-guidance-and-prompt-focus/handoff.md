## Миссия

- Что должен изменить этот change: Сделать выбранный workflow-пункт частью production guidance и prompt context: point должен влиять на task hint, prompt-building и догенерацию нужного артефакта, а не только переключать файл.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-workflow
- strategy_root: focus-domain
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено:
  - workflow заменяет level-driven language как основную user-facing модель исполнения;
  - image-to-component workflow уже разложен на coordinator-step и workflow-пункты;
  - Workbench уже умеет выбирать workflow-пункт через активный файл и показывать его как фокус сессии.
- Кто отвечает за стратегию, тактику и приёмку результата:
  - стратегия и содержательное направление принадлежат producer/dispatcher workflow-линии;
  - этот implement change отвечает только за кодовую материализацию prompt/hint focus;
  - приёмка результата идёт через внешний verification agent или пользователя.

## Обязательные источники

- openspec/changes/dispatcher-workflow/proposal.md
- openspec/changes/dispatcher-workflow/design.md
- openspec/changes/dispatcher-workflow/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для implement-workflow-point-guidance-and-prompt-focus:
  - openspec/specs/workflow/spec.md
  - openspec/specs/task/spec.md
  - openspec/changes/implement-workflow-image-component-foundation/specs/workflow/spec.md
  - openspec/changes/implement-workbench-workflow-session-surface/specs/workbench/spec.md
  - openspec/changes/implement-workflow-point-session-control/specs/workbench/spec.md
  - lib/task/projection.ts
  - lib/task/prompt-context.ts
  - app/api/tasks/[taskId]/hint/route.ts
  - lib/task/actions/start-stage.ts
  - lib/task/actions/iterate.ts

## Границы исполнения

- Что входит в этот change:
  - сделать selected workflow point частью hint templating;
  - сделать selected workflow point частью PromptContext и production prompts `start`/`iterate`;
  - прокинуть `activeScreen` через client/API boundary туда, где это влияет на generation.
- Что сознательно не входит в этот change:
  - полная orchestration-модель параллельных workflow-пунктов;
  - новая модель step dependencies;
  - redesign результата hidden check.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться:
  - workflow остаётся основной моделью исполнения вместо уровней;
  - image-to-component workflow уже имеет фиксированный каркас пунктов;
  - результирующий render остаётся главным user-facing центром рабочей поверхности.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit
- Что именно должен доказать результат проверки:
  - hint route и template context видят workflow focus;
  - start/iterate boundaries передают `activeScreen`;
  - PromptContext и prompt-building получают workflow-point focus и не теряют project-aware contract.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы:
  - какой fallback point использовать без явного `activeScreen`;
  - как дать generation сильный фокус на артефакт без запрета на сопутствующие изменения в соседних файлах;
  - какой минимальный набор тестов доказывает новый contract без лишнего e2e-слоя.
