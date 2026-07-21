## Контекст

- Родительский change управляет приоритетом и порядком реализации.

## Решение

- Компонент хранит ссылку на типовой workflow template, а не на уникальный runtime slot.
- Для запуска и продолжения работы компонент получает внутренний scoped project id вида `projectId::component::componentId`.
- Runtime может хранить несколько project scopes для одного workflow template, поэтому один template обслуживает несколько компонентов.
- Project-facing surfaces декодируют scoped id обратно в обычный `projectId`, чтобы пользователь продолжал видеть проект как единую сущность.
