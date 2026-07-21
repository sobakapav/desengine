# Release Notes

Этот файл описывает только тот состав, который действительно относится к текущему пользовательскому релизу архитектурной волны. Process-only repairs, generic quality fixes и чужие supporting changes сюда сознательно не включаются.

## Состав релиза

### Базовая project-wave

- `implement-project-workspace-mvp`
- `implement-project-entry-surface`
- `implement-project-workflow-binding`
- `implement-project-workbench-preview-binding`
- `fix-project-ui-kit-migration-invalidation`
- `implement-project-user-surface-foundation`
- `implement-project-component-assignment-surface`
- `implement-project-config-and-ui-kit-contract`
- `implement-project-history-diagnostics-surface`
- `implement-project-workflow-readout-surface`

### Расширение текущего user path

- `fix-project-ui-mode-removal`
- `implement-project-component-registry-and-create-flow`
- `implement-project-component-workflow-entrypoint`
- `implement-project-workflow-run-observability`
- `implement-workbench-workflow-session-surface`
- `implement-workflow-component-aware-surface-labels`
- `implement-workflow-image-component-foundation`
- `implement-workflow-point-session-control`
- `implement-workflow-point-guidance-and-prompt-focus`
- `implement-workflow-point-artifact-generation-control`
- `implement-editorial-shell-style-foundation`

## Смысл волны

Этот релиз больше не стоит на стадии “в продукте появился только Project”.

Теперь его пользовательский маршрут читается так:

`project -> component -> workflow -> workbench -> preview`

Именно этот путь составляет практический смысл архитектурной трансформации в текущем релизе:

- `Project` стал отдельным верхним контекстом продукта;
- внутри проекта появился компонент как рабочая сущность, а не только запись в runtime;
- workflow стал наблюдаемым и управляемым пользовательским процессом;
- Workbench начал мыслить workflow-сессией, а не одним уровнем;
- visual layer релиза должен сделать этот маршрут читаемым как единый продуктовый flow.

## Пользовательский эффект по слоям

### 1. Project как самостоятельный раздел

- Пользователь может открыть `/projects`, видеть список проектов, активный проект и страницу конкретного проекта.
- Проект хранит собственный contract (`settings`, `uiKitId`, migration status) и перестаёт быть скрытым preview-state.

Проверка:
- вручную открыть `/projects` и `/projects/<projectId>`;
- убедиться, что project page показывает canonical metadata и project-aware настройки;
- при наличии внешнего проверяющего можно точечно использовать unit-наборы project surface.

### 2. Component как рабочая сущность проекта

- Пользователь может создавать компоненты из project-side surface и видеть их список в проекте.
- Компонент становится реальной точкой входа в workflow: его можно включить в активную линию проекта и открыть в работу.

Проверка:
- вручную создать компонент из страницы проекта;
- убедиться, что он появляется в registry проекта;
- открыть действие перехода к workflow и проверить, что работа стартует из контекста выбранного компонента.

### 3. Workflow как наблюдаемый и управляемый процесс

- Workflow больше не остаётся скрытым runtime-слоем: пользователь видит его readout, runs, пункты и связанные артефакты.
- Выбранный workflow-пункт начинает управлять рабочим фокусом, связанными файлами и prompt/generation surface.

Проверка:
- на странице проекта убедиться, что видны workflow readout и observability surface;
- в Workbench выбрать разные workflow-пункты и проверить, что меняются связанный файл и фокус рабочей сессии;
- внешняя проверка должна опираться на `traceability`, unit и browser evidence конкретных workflow/workbench changes.

### 4. Workbench и preview как продолжение того же пути

- Workbench показывает workflow-сессию и component-aware контекст вместо старого языка уровней.
- Preview остаётся привязан к active project и текущему workflow/runtime contract.

Проверка:
- открыть рабочую сессию из project/component path;
- убедиться, что surface говорит на языке workflow и компонента, а не на языке старых служебных маршрутов;
- переключить рабочий фокус и проверить, что preview остаётся в том же project-scoped контуре.

### 5. Editorial visual language как релизный shell

- Product-shell интерфейс должен перейти на единый editorial contract: светлые surfaces, тонкие рамки, serif display-типографика, inversion-based active-state.
- Это не новый preview UI kit и не брендинг ради брендинга, а способ сделать маршрут `project -> component -> workflow -> работа` визуально цельным.

Проверка:
- внешняя browser/component проверка должна подтвердить новый shell contract хотя бы на `Navigation` и одном project/workflow surface;
- если это покрытие не закрыто в релизе, оно должно остаться явным хвостом в `coverage-plan`, а не в скрытом виде.

## Что сознательно не входит в release notes

- `producer-*`, `dispatcher-*`, `focus-*` и другие governance changes как физический состав поставки;
- generic quality-text repairs, test-wrapper repairs и process fixes, которые помогают доставке, но не являются пользовательским составом релиза;
- onboarding migration guide как самостоятельная пользовательская поставка: он может сопровождать волну, но не заменяет собой user-facing delivery.
