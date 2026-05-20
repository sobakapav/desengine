## Context

Сейчас `taskServerStorage.readTaskLevelTip(taskId, levelId)` читает только `levels/<levelId>/tip.md` из каталога задачи. Hidden prompts уже используют `renderPromptTemplateFromRoot`, Nunjucks и `throwOnUndefined: false`, поэтому для подсказок не нужен отдельный шаблонизатор.

## Decision

Шаблонная подсказка хранится рядом со старой подсказкой:

- старый формат: `onboarding/tasks/<taskId>/levels/<levelId>/tip.md`;
- новый формат: `onboarding/tasks/<taskId>/levels/<levelId>/tip.njk`.

Выбор источника:

1. Если есть `tip.njk`, рендерим его как шаблон.
2. Иначе читаем `tip.md` как статичный Markdown.
3. Если нет обоих файлов, возвращаем пустую строку.

## Render Context

Минимальный контекст:

- `task.id`;
- `task.maxLevel`;
- `task.images`;
- `level.id`;
- `level.number`;
- `level.title`;
- `level.labId`;
- `level.editableFileIds`.

Context расширяемый: будущий project/user/workflow context может быть добавлен без изменения формата `tip.njk`.

## Error Handling

Для `tip.njk` используется общий `renderPromptTemplateFromRoot` с `onErrorFallbackToRaw: true`. Это сохраняет совместимость с текущей моделью prompt rendering: ошибка шаблона не ломает task runtime, а автор видит исходный текст.

## Testing

Уровни проверки:

- static/contract: OpenSpec scenarios и traceability metadata;
- unit: выбор `tip.njk`/`tip.md`, контекст, fallback при ошибке и отсутствие подсказки.

Команды:

- `npm run test:unit`;
- `npm run test:traceability`.

Mock/fixture-данные:

- временный каталог задач в unit-тесте;
- synthetic `TaskConfig` и `LevelConfig`;
- live credentials не нужны.
