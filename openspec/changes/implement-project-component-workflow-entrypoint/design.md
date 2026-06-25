## Контекст

- Родительский change управляет приоритетом и порядком реализации.
- В проектной линии уже есть user-facing registry проектов и сущность `ProjectComponent`.
- В workflow-линии уже есть `image-to-component-workflow`, coordinator step `Работаем над workflow` и point-driven generation control.
- Но между ними пока нет production bridge: пользователь видит компонент проекта, но не может начать реальную работу над ним из project surface.

## Решение

1. Сделать `ProjectComponent` рабочей точкой входа в существующий workflow runtime.
   Для текущей волны компонент получает `backing task` из уже существующего task catalog. Это позволяет не переписывать task engine и не блокировать пользовательский слой ожиданием нового orchestrator.

2. Хранить `backing taskId` прямо в `ProjectComponent`.
   Тогда пользователь может:
   - один раз создать компонент;
   - назначить ему task/runtime-контейнер;
   - возвращаться к той же workflow-сессии повторно.

3. Добавить project-facing действие `Работать над компонентом`.
   Действие:
   - выбирает или переиспользует `backing taskId`;
   - фиксирует active project;
   - запускает `startTaskLevel` в project context;
   - переводит пользователя в Lab/Workbench того же task runtime.

4. Не вводить пока отдельный `component-scoped workflow engine`.
   Этот change закрывает реальную пользовательскую точку входа и bridge к существующему runtime. Новая server-side model execution для компонентов может появиться позже отдельной волной.

## Компромиссы

- `ProjectComponent` пока использует существующий task catalog как backing runtime pool.
  Это не идеальная финальная модель, но это практичный мостик: пользователь уже может работать над несколькими компонентами, а система не зависает на полном перепроектировании task storage.
- Пока один `ProjectComponent` соответствует одному backing task runtime.
  Этого достаточно для текущего пути `создать проект -> создать несколько компонентов -> зайти в работу над конкретным компонентом`.
