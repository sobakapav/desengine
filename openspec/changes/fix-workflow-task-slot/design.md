## Контекст

- Родительский change управляет приоритетом и порядком реализации.

## Решение

- `ProjectComponent.taskId` остаётся ссылкой на типовой workflow template, а не на уникальный slot.
- Для запуска и продолжения работы компонент получает внутренний scoped project id вида `projectId::component::componentId`.
- Task runtime хранит несколько project scopes для одного `taskId`, поэтому один template может обслуживать несколько компонентов.
- Project-facing surfaces декодируют scoped id обратно в обычный `projectId`, чтобы пользователь продолжал видеть проект как единую сущность.
