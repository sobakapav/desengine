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

Текущий dev smoke отправляет два payload:

1. selection ping:

- protocolVersion;
- фиксированный dev sessionToken;
- selectionCount;
- selectedNodeNames;
- sentAt.

2. visual snapshot:

- protocolVersion;
- фиксированный dev sessionToken;
- nodeId;
- nodeName;
- nodeType;
- width;
- height;
- PNG `dataUrl`;
- export scale;
- exportedAt.

Visual snapshot нужен только для проверки живой визуальной связи Figma plugin -> local endpoint -> desktop renderer. Это не semantic model компонента. В development manifest используется `http://localhost:37645`, потому что Figma валидирует local dev domains в формате `localhost`.

PNG visual snapshot оформлен как повторно используемый handoff-слой:

- `@desengine/protocol` хранит route-константы, URL helper, формат PNG, export scale, Zod-схему и TypeScript-тип `FigmaVisualSnapshot`;
- Figma plugin использует `exportNodeAsPngVisualSnapshot(node)` для экспорта любого переданного `SceneNode` в PNG snapshot;
- desktop endpoint и renderer используют общие route-константы вместо ручного дублирования URL.

Первая осмысленная функция поверх этого handoff - взрыв-схема auto-layout frame. Пользователь выбирает один Frame с auto-layout и нажимает `Создать взрыв-схему`. Plugin отправляет `POST /figma/exploded-frame`:

- snapshot самого frame как reference;
- до 100 leaf-элементов как отдельные прозрачные PNG;
- рекурсивный обход auto-layout Frame до глубины 4;
- остановку на instance, не-auto-layout frame, не-frame node или принудительном max depth;
- относительные координаты и размеры каждого leaf-элемента внутри root frame;
- depth, parent node id, path и stop reason каждого leaf-элемента;
- layout mode frame.

MVP не мутирует Figma-документ и не пытается извлекать semantic layout beyond recursive auto-layout structure.

## Следующие архитектурные вопросы

### Source binding

desengine должен уметь связывать собственный объект с Figma-источником, чтобы повторный Figma snapshot обновлял дизайн-данные, но не стирал локальные свойства desengine: положение на холсте, стиль отображения, пометки, grouping и overrides.

Минимальная связь для MVP: `fileKey + nodeId`. Дальше нужен fallback matching для случаев, когда Figma node был удалён и создан заново.

### Обратный запрос Figma -> desengine

Figma plugin может запрашивать у desengine JSON-данные для выбранного объекта. Например, plugin отправляет selected frame и получает набор вариантов текстового заполнения.

desengine не должен напрямую изменять Figma-документ. Он возвращает typed JSON instructions, а Figma plugin применяет их через Figma API.

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
