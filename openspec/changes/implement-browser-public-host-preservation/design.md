## Контекст

- Текущий browser/dev wrapper строит managed base URL вокруг `127.0.0.1` и в части веток считает localhost каноническим transport endpoint.
- Для сценариев, где пользователь или внешний verification path заходят по публичному host/domain, это создаёт скрытый drift между исходным адресом и фактическим browser target.

## Подход

- Сохранить текущий localhost-default как fallback для локального managed режима.
- Добавить отдельный public base URL contract без изменения app-runtime redirect helpers.
- Развести:
  - bind-host: где реально слушает dev server;
  - public base URL: какой URL получает browser verification/runtime flow.
- Не менять host автоматически, если public base URL уже задан явно.

## Риски

- Нельзя сломать текущий localhost-flow по умолчанию.
- Нельзя смешать product redirect bug и test/dev tooling bug в один слой диагностики.
