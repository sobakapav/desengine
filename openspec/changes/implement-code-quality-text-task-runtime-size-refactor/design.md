## Решение

Декомпозиция task runtime должна быть поведенчески нейтральной:

- route/API result shape не меняется;
- storage paths не меняются;
- mutation boundary сохраняется;
- helpers остаются внутри `lib/task/**`.
