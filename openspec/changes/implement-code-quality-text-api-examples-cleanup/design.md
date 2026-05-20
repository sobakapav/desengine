## Решение

Добавляем минимальные JSDoc-блоки непосредственно перед экспортируемыми function declarations и exported const-функциями, которые уже считаются нетривиальными правилом `api-example`.

Для React-компонентов пример показывает JSX usage. Для route handlers пример показывает HTTP request shape. Для server helpers пример показывает вызов функции с типичным параметром.
