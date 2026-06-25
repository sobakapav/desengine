## Контекст

- Workflow-сессия уже умеет выбирать пункт через активный файл и переключать рабочую поверхность.
- Пока что этот выбор почти не влияет на production guidance: hint, start и iterate продолжают работать как будто весь набор файлов равноправен.

## Решение

- Ввести единый resolver фокуса workflow-пункта на базе `activeScreen -> workflow point`.
- Протянуть этот фокус через route/service boundary в task hint и PromptContext.
- Добавить в production prompt явный guidance-блок, который приоритизирует догенерацию нужного артефакта, но не запрещает синхронизировать соседние файлы ради целостного результата.

## Границы

- Входит:
  - hint route и task hint templating;
  - start/iterate prompt-building;
  - client/API boundary передачи `activeScreen`;
  - unit/integration тесты этих контрактов.
- Не входит:
  - новый planner для межартефактных зависимостей;
  - отдельная модель влияния одного workflow-пункта на другой;
  - redesign check-flow.
