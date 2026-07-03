## Контекст

Техническая основа уже появилась в `implement-workflow-image-component-foundation`:
- runtime projection публикует coordinator step `Работаем над workflow`;
- runtime держит catalog of workflow points;
- Workbench и project readout умеют читать новый workflow step.

Но текущий Workbench UI по-прежнему опирается на level-language:
- `Шаг workflow: уровень N`;
- `Сбросить уровень`;
- `Контекст рабочей поверхности` с описанием уровня;
- `Полное пояснение уровня`.

Из-за этого пользователь не получает реальную замену модели исполнения.

## Решение

### 1. Workbench трактуется как workflow-session surface

Верхний уровень Workbench должен показывать, что пользователь работает не над уровнем, а над workflow целиком.

Главные элементы новой поверхности:
- headline `Работаем над workflow`;
- краткое объяснение outcome этой сессии;
- панель с coordinator context (`project`, `component line`, `workflow`, `workbench`);
- каталог workflow-пунктов;
- preview как главный рендер-центр результата.

### 2. Workflow points становятся видимой частью UI

Workbench получает явный список пунктов workflow. Для каждого пункта показываются:
- заголовок;
- статус;
- число связанных артефактов/файлов, если оно есть;
- признак того, что это активный центр текущей работы.

На этом этапе points остаются explainability-слоем и не вводят отдельную навигацию/мутации.

### 3. Preview становится рендер-центром workflow

Preview-блок должен быть подан как главный результирующий рендер, а не как один из фрагментов экрана уровня.

Это значит:
- текст и подписи описывают preview как центральный выход workflow;
- контекст справа объясняет, какие пункты workflow сейчас влияют на рендер;
- файлы, промпты и project settings читаются как supporting tools, а не как сущность экрана сами по себе.

### 4. Legacy compatibility не ломается

Изменение сознательно не трогает:
- storage progress по уровням;
- route/action contract (`start`, `iterate`, `check`, `reset current level`);
- legacy hint/runtime data model.

Мы меняем только surface language и surface composition.

## Границы

Входит:
- новый UI surface model для workflow-session;
- обновление Workbench header/content/summary;
- source-contract/unit тесты;
- OpenSpec delta.

Не входит:
- отдельная навигация по workflow-point;
- point-specific actions;
- новый storage format;
- переименование всех внутренних level-терминов в runtime и server layer.
