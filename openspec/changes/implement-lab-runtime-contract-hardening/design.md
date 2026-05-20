## Архитектурный подход

Change должен укрепить текущий runtime без пользовательского потрясения. Основной принцип: сначала выделяем повторяемые контракты, затем меняем route handlers на использование этих контрактов, затем добавляем проверки.

## Рабочие допущения

- `/lab/:taskId` — основной рабочий вход в лабораторию.
- `/lab/:taskId/:screen` — deep-link на рабочий файл, если `screen` разрешён текущим уровнем.
- `/tasks/:taskId` остаётся страницей/контуром задачи и совместимости.
- Storage остаётся локальным файловым `user/`, но получает mutation boundary.
- LLM в новых проверках должен быть mockable; live credentials не нужны.

## Компоненты решения

### 1. Canonical route map

Нужно свести helper-функции из `lib/lab/navigation.ts`, `lib/task/navigation.ts`, `lib/system/navigation.ts` к явному контракту.

Минимальный результат:

- один источник истины для lab task URL и task check/done URL;
- тесты на canonical routes и legacy redirects;
- route/page слои используют helper, а не собирают строки вручную.

### 2. Empty TaskData factory

Сейчас shape пустого `TaskData` повторяется в нескольких route/page/API файлах. Нужно выделить reusable factory, например рядом с `lib/task` или `lib/lab`, без изменения публичного shape.

Фабрика должна принимать:

- `taskId`;
- `labContext`.

Фабрика должна возвращать:

- `contentByFileId: {}`;
- `promptHistory: []`;
- `llmUsageSummary` с нулевыми значениями;
- переданный `labContext`.

### 3. Application service boundary

Route handlers должны стать тоньше:

```text
route
  -> access guard
  -> params/body parse
  -> service call
  -> HTTP response mapping
```

Минимальный набор service functions:

- `saveTaskFiles`
- `startTaskLevel`
- `iterateTaskLevel`
- `checkTaskLevel`
- `resetTaskRuntime`

Если полный перенос за один change слишком рискованный, можно начать с наиболее повторяемых/тестируемых частей: empty data, save files, reset и shared response builders, а start/iterate/check переносить поэтапно.

### 4. Mutation boundary

Нужен минимальный per-task sequential boundary для локальных мутаций:

- ключ — `taskId`;
- мутации одного task выполняются последовательно;
- разные task не блокируют друг друга;
- реализация in-process достаточна для MVP;
- storage backend не меняется.

Эта boundary должна применяться минимум к file writes/progress mutations в lab action flows.

### 5. Testing

Нужны проверки без live credentials.

Минимальный набор:

- unit/contract: empty `TaskData` factory;
- unit/contract: canonical route map;
- unit/integration: mutation boundary serializes same-task writes;
- integration/service: один из lab flows на fixture storage/mock LLM;
- e2e smoke: если можно стабильно реализовать без live credentials, проверить рабочий lab entry или service-equivalent flow.

## Риски реализации

- Перенос start/iterate/check может оказаться слишком большим. В таком случае допустима поэтапная декомпозиция, но tasks должны явно фиксировать, что перенесено, а что осталось follow-up.
- Нельзя ломать текущий lab UX ради чистоты.
- Нельзя менять install-critical инфраструктуру.
- Нужно не трогать unrelated changes.

## Вопросы на ревью

1. Нужно ли считать `/lab/:taskId` окончательно главным рабочим URL?
2. Достаточна ли in-process mutation queue для MVP или нужен файловый lock?
3. Должен ли этот change снимать существующие e2e skips для `/tasks` и `/levels`, или лучше добавить отдельный lab-flow smoke?

Для старта принимаем безопасные ответы: `/lab/:taskId` главный рабочий URL, in-process queue достаточна, e2e skips не снимаем механически без отдельной стабилизации.
