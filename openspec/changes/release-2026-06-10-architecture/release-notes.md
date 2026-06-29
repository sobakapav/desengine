# Release Notes

Этот файл веду по мере готовности и закрытия changes из релиза.

Для каждого сделанного change сюда добавляется простое описание:

- что меняется для пользователя;
- как это влияет на пользователя;
- как вручную или через понятную команду убедиться, что change действительно доехал.

## Состав релиза

- `implement-project-workspace-mvp`
- `implement-project-task-onboarding-binding`
- `implement-project-workflow-binding`
- `implement-project-workbench-preview-binding`
- `fix-project-ui-kit-migration-invalidation`
- `implement-project-user-surface-foundation`
- `implement-project-task-assignment-surface`
- `implement-project-config-and-ui-kit-contract`
- `implement-project-history-diagnostics-surface`
- `implement-project-workflow-readout-surface`

## Смысл волны

Это архитектурный релиз с лейтмотивом «Начинаем трансформацию архитектуры продукта»:

- архитектура оформляется как пользовательски значимая линия продукта;
- у линии появляется явный стратегический owner;
- у первых архитектурных направлений появляется tactical ownership;
- foundation-изменения начинают жить в отдельной архитектурной delivery-волне, а не растворяются среди соседних tech changes;
- `Project` начинает оформляться как новый верхний контекст продукта, а не как локальная настройка preview;
- workflow внутри project-wave фиксируется как самостоятельный процесс решения;
- domain-wave вокруг `Project` идёт в том же релизном срезе, что и общая архитектурная трансформация.

Дополнительно внутри этой же волны подготовлен supporting-артефакт для onboarding migration:

- появился guide для контент-менеджера, который объясняет, как переводить onboarding-задачи со старой level-центричной схемы на путь `проект -> workflow -> проверка/чеклист -> результат`;
- guide нужен не как отдельная пользовательская поставка, а как опорный материал для следующих onboarding UI-waves внутри той же архитектурной трансформации.

## Готовые changes

### `implement-onboarding-project-workflow-migration-guide`

- Что меняется для команды: у onboarding-линии появился канонический migration guide, который объясняет, как перестраивать структуру задач и metadata под новый режим `project/workflow/check/result`.
- Как это влияет на пользователя: напрямую интерфейс не меняется, но следующая UI-волна onboarding больше не должна угадывать, как раскладывать старые `level`-данные по проектному входу, workflow-шагам, проверке и результату.
- Как проверить: открыть [migration-guide.md](/home/op/dev/sobakapav/desengine/openspec/changes/archive/2026-06-25-implement-onboarding-project-workflow-migration-guide/migration-guide.md) и убедиться, что там есть инвентаризация текущей схемы, mapping `level -> project/workflow/check/result`, правила раскладки metadata, пошаговая инструкция и checklist готовности.

### `implement-project-user-surface-foundation`

- Что меняется для пользователя: в верхнем меню появляется отдельная вкладка `Проекты`, а в продукте открываются страницы `/projects` и `/projects/<projectId>` с базовым обзором project workspace.
- Как это влияет на пользователя: проект впервые существует как самостоятельный пользовательский раздел, а не только как скрытый runtime-контекст внутри Workbench конкретной задачи.
- Как проверить: открыть раздел `Проекты`, убедиться, что список читает локальный project registry и отдельно помечает active project; затем открыть карточку конкретного проекта и проверить, что она показывает canonical metadata, `UI kit`, migration status и переходы назад к общему реестру и задачам. Для точечной автоматической проверки доступна команда `npm run test:unit -- test/unit/project-user-surface-foundation.test.ts`.

### `implement-project-config-and-ui-kit-contract`

- Что меняется для пользователя: на странице проекта появляется рабочий config surface, где можно читать и править `ProjectWorkspace.settings` через JSON, переключать `uiKitId` из canonical списка и видеть selected/effective `UI kit` вместе со статусом migration.
- Как это влияет на пользователя: проект перестаёт быть только контейнером навигации и задач, а начинает управляться как самостоятельная сущность с явным контрактом `project settings -> prompt templates -> preview runtime`.
- Как проверить: открыть страницу проекта и убедиться, что там есть JSON-конфиг project settings, selector `UI kit`, блок с effective kit и migration status, а также пояснение, как эти настройки влияют на prompt/preview. Для точечной автоматической проверки доступна команда `npm run test:unit -- test/unit/project-config-and-ui-kit-contract.test.ts`.

### `implement-project-workspace-mvp`

- Что меняется для пользователя: в лаборатории появляется canonical `ProjectWorkspace` с project registry, active project и минимальным create/select flow вместо единственного ad-hoc project state.
- Как это влияет на пользователя: пользователь может создать отдельный проект по имени, переключить active project и получить rehydrate задачи под выбранный project scope без смешивания файлов, dirty state и preview-настроек между проектами.
- Как проверить: внешний проверяющий может открыть lab, создать второй проект, переключиться между проектами и убедиться, что active project меняется в UI, а task data перезагружается под новый scope; для точечной автоматической проверки можно использовать `npm run test:unit -- test/unit/project-ui-kit-switching.test.ts test/unit/ui-kit-switcher-visibility.test.ts`.

### `implement-project-task-onboarding-binding`

- Что меняется для пользователя: task/opening flow теперь привязан к active project и перестаёт молча жить как безымянный global runtime задачи.
- Как это влияет на пользователя: `open`, `start`, `iterate`, `check`, `save files`, `reset task` и `reset current level` сохраняют единый project context и не должны смешивать runtime-данные соседних проектов одной задачи.
- Как проверить: внешний проверяющий может использовать `npm run test:integration -- test/integration/task-routes.test.ts` для route boundary и `npm run test:unit -- test/unit/task-project-client-boundary.test.ts` для client project-binding surface.

### `implement-project-workflow-binding`

- Что меняется для пользователя: workflow runtime и prompt context теперь строятся как project-aware слой, а шаг workflow явно несёт `projectId`.
- Как это влияет на пользователя: процесс решения перестаёт быть безымянным глобальным runtime-контекстом и сохраняет гибкость для дальнейшей workbench-привязки без требования `один шаг = один верстак`.
- Как проверить: внешний проверяющий может начать с `npm run test:unit` для task/workflow projection и затем `npm run test:traceability` для OpenSpec-контракта change.

### `implement-project-workbench-preview-binding`

- Что меняется для пользователя: Workbench и Sandpack preview теперь работают как часть project contract и читают `ProjectWorkspace.settings` вместо локального preview-state.
- Как это влияет на пользователя: active project начинает управлять `uiKitId`/`uiMode` в рабочем контуре целиком, а preview и workbench остаются привязаны к одному project-scoped runtime.
- Как проверить: внешний проверяющий может запустить `DESENGINE_E2E_FIXTURE_ACCESS=1 node tools/testing/run-browser-verification-runtime.mjs test/e2e/project-ui-kit-switching.spec.ts test/e2e/sandpack-preview-style-runtime.spec.ts` или вручную открыть лабораторию, сменить `UI kit` проекта и убедиться, что preview пересобирается в рамках того же active project.

### `fix-project-ui-kit-migration-invalidation`

- Что меняется для пользователя: смена project `UI kit` в Workbench больше не выглядит как тихий toggle и запускает явную migration-операцию с подтверждением.
- Как это влияет на пользователя: текущий уровень переинициализируется под новый project contract, а Workbench и preview показывают явный migration status вместо молчаливой подмены настроек.
- Как проверить: внешний проверяющий может использовать `npm run test:traceability` для контракта change и точечно `npm run test:unit -- project-ui-kit-switching` для runtime/storage/migration surface.

### `fix-browser-verification-multi-spec-runtime`

- Что меняется для пользователя: browser verification wrapper больше не теряет дополнительные `.spec.ts` аргументы и действительно запускает все переданные preview/project browser specs.
- Как это влияет на пользователя: release checklist больше не может показать ложный зелёный verdict из-за того, что wrapper фактически проверил только первый spec-файл из команды.
- Как проверить: внешний проверяющий может запустить `node tools/testing/run-browser-verification-runtime.mjs test/e2e/project-ui-kit-switching.spec.ts test/e2e/sandpack-preview-style-runtime.spec.ts` и убедиться, что в Playwright уходит оба spec-файла.

### `fix-project-workbench-updated-at-hydration`

- Что меняется для пользователя: project summary в Workbench теперь сначала рендерится из одного и того же fallback workspace и только после hydration подтягивает active project из storage; строка `Обновлён` при этом остаётся в стабильном UTC-формате.
- Как это влияет на пользователя: сервер и первый client render больше не должны расходиться по `project.id` и `project.updatedAt`, поэтому первый экран лаборатории не должен получать ложный hydration mismatch и лишнюю пересборку сразу после загрузки.
- Как проверить: внешний проверяющий может открыть лабораторию с уже сохранённым active project в localStorage и убедиться, что на первом render не появляется hydration mismatch в консоли/overlay; для точечной автоматической проверки доступна команда `npm run test:unit -- test/unit/ui-kit-switcher-visibility.test.ts test/unit/project-ui-kit-switching.test.ts`.

### `fix-admin-tools-traceability-coverage-plan`

- Что меняется для команды: capability `admin-tools` больше не держит релиз на process-хвосте `32/35`, потому что producer ownership scenarios теперь закрыты явным unit-evidence.
- Как это влияет на пользователя: напрямую никак, но release/close-процесс перестаёт давать ложный блокер на формальном traceability-слое и точнее отражает реальную готовность волны.
- Как проверить: достаточно запустить `npm run test:traceability` и убедиться, что `admin-tools` показывает `35/35 scenarios (ready)`.

### `fix-architecture-roadmap-traceability-contract`

## Что меняется для пользователя:

В архитектурной линии появляется активный OpenSpec-контракт `architecture-roadmap`, поэтому routing-playbook и его traceability больше не ссылаются на архивный или отсутствующий capability.

## Как это влияет на пользователя:

Менеджеру проекта и владельцам change-линий проще доверять архитектурным evidence: unit-доказательства routing-playbook теперь опираются на реальный active capability с понятными scenarios, а не на несуществующую запись в `openspec/specs/**`.

## Как проверить:

Открыть `openspec/specs/architecture-roadmap/spec.md` и убедиться, что там есть сценарии про routing через `dispatcher-architecture`, сохранение ownership у предметного dispatcher и обязательный evidence-пакет для boundary change. Затем внешней проверкой запустить `npm run test:unit -- test/unit/architecture-routing-playbook-docs.test.ts`.

### `implement-architecture-dispatcher-parent-link`

## Что меняется для пользователя:

Архитектурная линия в OpenSpec теперь явно показывает, что `dispatcher-architecture` работает не сам по себе, а под управлением `producer-architecture-transform`.

## Как это влияет на пользователя:

Менеджеру проекта проще понять, кто отвечает за стратегию архитектурных изменений, кто ведёт тактическую работу и откуда берётся план следующих шагов. Это снижает риск путаницы при постановке задач и разборе статуса линии.

## Как проверить:

Открыть change `dispatcher-architecture` и убедиться, что он явно связан с `producer-architecture-transform`, а implementation plan producer-линии указан как источник дальнейших архитектурных изменений.

### `implement-architecture-governance-docs`

# Release Note

## Что меняется для пользователя:

- В проекте появляются понятные опорные документы по устройству системы: карта ключевых частей, реестр принятых решений и словарь основных сущностей.
- Эти материалы собраны как живой набор, на который команда может опираться при следующих изменениях, а не как разовые заметки.

## Как это влияет на пользователя:

- Команде проще быстрее согласовывать следующие изменения без повторного разбора системы с нуля.
- Снижается риск, что новые задачи будут сделаны вразнобой и начнут ломать друг другу логику.
- Для менеджера и владельцев change-линий становится понятнее, почему следующий шаг выбран именно таким и где проходят границы ответственности.

## Как проверить:

- Открыть документы в `docs/architecture/` и убедиться, что там есть карта системы, словарь сущностей и реестр решений.
- Проверить, что эти документы согласованы с change `implement-architecture-governance-docs` и описывают единый рабочий набор, а не отдельные несвязанные заметки.

### `implement-architecture-routing-playbook`

## Что меняется для пользователя:

Появляется практический playbook маршрутизации архитектурных changes, который помогает отличать ownership `dispatcher-architecture` от ownership предметных dispatcher-линий.

## Как это влияет на пользователя:

Менеджеру проекта проще быстро понять, какой change нужно создавать: architectural или предметный. Это снижает риск спутать ownership, отправить работу не тому parent owner и породить лишний или неправильный downstream change.

## Как проверить:

Проверить, что в change `implement-architecture-routing-playbook` есть документы с routing-, naming- и boundary-guidance, а release note объясняет для менеджера проекта, как избежать путаницы ownership и неверной диспетчеризации новых changes.

### `fix-project-runtime-unit-contract-repair`

# Release Note

## Что меняется для пользователя:

- Unit-контракты project-aware task runtime снова согласованы с текущими server и helper-сигнатурами.
- Repair закрывает локальные падения в task runtime test layer после project-aware архитектурной волны.

## Как это влияет на пользователя:

- Команда может снова проверять repair-срез project-aware task runtime отдельным unit-набором без ложных падений из-за устаревших моков и ожиданий.
- Ошибки no-op iterate, task screen data и reset helper contracts больше не маскируют реальное состояние runtime-логики.

## Как проверить:

- Запустить `npm run test:unit -- test/unit/task-iterate-noop-feedback.test.ts test/unit/task-project-client-boundary.test.ts test/unit/task-screen-data.test.ts test/unit/task-server-runtime-mutations.test.ts`.
- Убедиться, что unit-слой проходит именно на project-aware сигнатурах и не требует отката product-логики project-wave.

### `fix-quality-text-working-scope-gate`

# Release Note

## Что меняется для пользователя:

- Рабочий quality gate `quality:text` снова проходит на текущем `working` scope.
- Нетривиальные публичные API получили явные `@example`, а legacy-исключения для длины файлов и функций оформлены прозрачным waiver-реестром.

## Как это влияет на пользователя:

- Команда снова может использовать `npm run quality:text` как рабочий стоп-кран без ложных падений на уже известный legacy-хвост.
- Архитектурный и тестовый долг не прячется: оставшиеся крупные модули помечены owner/reason/targetStage и не смешиваются с локальным fix.

## Как проверить:

- Запустить `npm run quality:text`.
- Убедиться, что отчёт показывает `Violations: 28`, `Waived violations: 28` и завершает проверку строкой `Нарушений не найдено.`.

### `fix-project-client-boundary-timeout-repair`

# Release Note

## Что меняется для пользователя:

- Узкий project-aware client boundary для open/start helpers больше не тянет тяжёлый `Workbench`/preview graph в unit-тестах.
- Поведение open/start с active project не меняется, меняется только import seam для test/runtime boundary.

## Как это влияет на пользователя:

- Команда снова может прогонять `task-project-client-boundary` без timeout в общем unit-контуре.
- Project-aware semantics не размываются: query/body по-прежнему несут active project, а fix не откатывает project-wave поведение.

## Как проверить:

- Запустить `npm run test:unit -- test/unit/task-project-client-boundary.test.ts`.
- Убедиться, что набор завершается зелёно и не зависает на кейсе open/start helpers.

### `implement-workbench-project-scope-shell`

# Release Note

## Что меняется для пользователя:

- Workbench теперь явно читает project scope через отдельный shell-слой, а не держит project loading/settings/migration внутри одного монолитного view/controller.
- Project-aware create/select/migration flow сохранён, но boundary между project shell и остальным Workbench стал отдельным модулем.

## Как это влияет на пользователя:

- Поведение project-aware Workbench остаётся прежним: active project, preview и migration продолжают работать в той же последовательности.
- Команде проще развивать следующую волну `project -> task -> workflow -> workbench`, потому что project boundary больше не размазан по общему Workbench orchestration.

## Как проверить:

- Запустить `npm run test:unit -- test/unit/task-project-client-boundary.test.ts test/unit/project-ui-kit-switching.test.ts test/unit/ui-kit-switcher-visibility.test.ts test/unit/workbench-platform-registry.test.ts`.
- Убедиться, что project shell вынесен в `WorkbenchProjectShell.tsx` и `useWorkbenchProjectScope.ts`, а source/unit-контракты на create/select/migration проходят без regressions.

### `fix-workbench-view-quality-gate-repair`

# Release Note

## Что меняется для пользователя:

- View-слой Workbench локально декомпозирован: header/actions, контекстный блок, work area и footer больше не живут в одном длинном `WorkbenchView.tsx`.
- Repair снимает активный `quality:text` блокер для Workbench view без возврата временного waiver.

## Как это влияет на пользователя:

- Наблюдаемое поведение Workbench не меняется: проверка, reset, preview, сохранение и prompt composer работают как раньше.
- Команда снова может проходить quality gate для этой части workbench-линии без маскировки долга новым исключением.

## Как проверить:

- Запустить `npm run quality:text`.
- При необходимости дополнительно запустить `npm run test:unit -- test/unit/project-ui-kit-switching.test.ts test/unit/lab-screen-event-propagation.test.ts test/unit/p1-source-contracts.test.ts`.

### `implement-workbench-task-workflow-surface`

# Release Note

## Что меняется для пользователя:

- Workbench теперь явно показывает себя как рабочую поверхность, связанную с `project`, `task`, `workflow step` и `workbench instance`.
- Foundation-сущности `WorkbenchDefinition/Instance` выходят в runtime surface и больше не остаются только внутренней моделью.

## Как это влияет на пользователя:

- Пользователь видит, в каком product-контуре он работает: какой проект активен, какая задача открыта, какой workflow step materialized и какая рабочая поверхность за это отвечает.
- Workbench начинает читаться как новая главная рабочая поверхность, а не только как частный lab-экран.

## Как проверить:

- Запустить `npm run test:unit -- test/unit/workbench-platform-registry.test.ts test/unit/task-workflow-artifact-projection.test.ts test/unit/project-ui-kit-switching.test.ts test/unit/p1-source-contracts.test.ts`.
- Убедиться, что header показывает новую surface-модель, а source/unit-контракты фиксируют связку `project -> task -> workflow step -> workbench`.

### `fix-workbench-lab-profile-api-example-repair`

# Release Note

## Что меняется для пользователя:

- В `lib/workbench/lab-profile.ts` экспортируемый API `createLabWorkbenchInstance` теперь содержит явный `@example`.
- Change не меняет поведение Workbench runtime и закрывает только operational quality blocker.

## Как это влияет на пользователя:

- `quality:text` снова может проходить без ложного стопа на нетривиальном API без примера.
- Команда получает рядом с API короткий образец того, как собирается project-aware `WorkbenchInstance` для текущей задачи и шага workflow.

## Как проверить:

- Запустить `npm run quality:text`.
- Убедиться, что активное нарушение `[api-example] lib/workbench/lab-profile.ts` больше не появляется.
