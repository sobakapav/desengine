## Контекст

- Родительский change управляет приоритетом и порядком реализации.
- `dispatcher-architecture` уже зафиксирован как tactical owner архитектурной линии, но у него ещё нет минимального живого governance-набора, по которому можно принимать downstream changes без повторного чтения producer/design/archive материалов.
- Архитектурная карта, ADR и словарь сущностей должны стать операционными документами, связанными с кодом, а не разрозненными заметками.

## Решение

- Завести каталог `docs/architecture/` как рабочий governance-контур `dispatcher-architecture`.
- Зафиксировать три обязательных источника:
  - карту архитектуры;
  - ADR-реестр с правилами обновления;
  - словарь сущностей.
- Превратить producer/dispatcher решения в конкретный baseline:
  - текущие слои системы;
  - ключевые сущности `Project / Task / Workflow / Workbench / Artifact`;
  - сквозные сущности `код / LLM / бюджет / дизайн`;
  - сознательные исключения, которые пока не выделяются в отдельные сущности или линии.
- Не открывать в этом change соседние governance-темы:
  - naming rules;
  - routing map;
  - boundary contracts.

## Результат

- downstream changes могут ссылаться на конкретные документы `docs/architecture/**`, а не только на OpenSpec design-файлы;
- у `dispatcher-architecture` появляется операционный артефакт для маршрутизации architecture-facing changes;
- handoff и metadata change синхронизируются с документарным `static/contract`-контуром проверки.
