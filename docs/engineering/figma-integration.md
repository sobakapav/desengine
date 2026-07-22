# Интеграция Figma и desktop-приложения

## Целевая пользовательская модель

Пользователь работает в Figma Desktop App, выбирает компонент и запускает plugin-команду:

```text
Выбранный компонент -> Open in desengine -> desktop player
```

Figma web не является обязательной целью первого этапа. Если web-версия Figma требует дополнительных разрешений или хуже работает с локальным endpoint, это принимается как ограничение MVP.

## Transport

Используются два канала:

1. `desengine://`
   - запускает desktop app;
   - поднимает приложение на передний план;
   - передаёт nonce/session id для pairing;
   - не используется как основной канал для больших данных.

2. Local endpoint
   - принимает JSON snapshot от Figma plugin;
   - работает на `127.0.0.1`;
   - валидирует protocol version, session token и payload;
   - возвращает понятный статус plugin-у.

## Почему не только `desengine://`

Deep link удобен для запуска приложения, но неудобен для больших payload: URL ограничен размером, плохо подходит для ассетов и сложного JSON, сложнее диагностируется.

Поэтому deep link считается входной дверью, а local endpoint - грузовым каналом.

## Безопасность local endpoint

Local endpoint не должен быть открытым API без handshake.

Минимальные правила:

- endpoint слушает только `127.0.0.1`;
- plugin передаёт одноразовый nonce/session token;
- desktop app принимает данные только после pairing;
- payload проходит schema validation;
- protocol version обязателен;
- неизвестные поля не дают скрытых privileged-действий;
- endpoint ограничивает размер request;
- CORS настраивается только для нужного plugin flow.

## Figma network access

Figma plugin должен явно декларировать сетевые домены в `manifest.json`.

Для разработки можно использовать `devAllowedDomains`, например локальный адрес.

Для опубликованного plugin потребуется осознанный `allowedDomains` и reasoning. Если plugin обращается только к локальному приложению, это должно быть прямо объяснено пользователю в описании и security disclosure.

## Payload

Первый snapshot должен быть JSON, а не кодом.

Текущий dev smoke пока не отправляет snapshot. Он отправляет только selection ping:

- protocolVersion;
- фиксированный dev sessionToken;
- selectionCount;
- selectedNodeNames;
- sentAt.

Этот ping нужен только для проверки живой связи Figma plugin -> local endpoint -> desktop renderer. В development manifest используется `http://localhost:37645`, потому что Figma валидирует local dev domains в формате `localhost`.

Пример состава:

- protocolVersion;
- source file metadata;
- selected node ids;
- component/variant metadata;
- layer tree;
- visual properties;
- component properties;
- variables/tokens references, если доступны;
- asset references или встроенные asset descriptors;
- plugin/app version metadata.

## Fallback

Если desktop app не запущен:

1. plugin открывает `desengine://connect?...`;
2. показывает ожидание подключения;
3. повторяет отправку на local endpoint;
4. если pairing не произошёл, показывает понятное действие: установить или открыть desktop app.
