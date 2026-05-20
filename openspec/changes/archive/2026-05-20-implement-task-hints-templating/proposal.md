## Why

Dispatcher `dispatcher-task-hints` требует перевести подсказки задач на тот же шаблонный механизм, который уже используется для hidden prompts. Сейчас runtime читает только статичный `tip.md`, поэтому подсказка не может учитывать task/level/context и не имеет unit/traceability опоры.

## What Changes

- Добавляется шаблонный формат подсказок `tip.njk` рядом с существующим `tip.md`.
- Runtime выбирает `tip.njk`, если он есть, и рендерит его через общий Nunjucks-движок prompt templates.
- Старый `tip.md` остаётся статичным fallback-форматом без шаблонизации.
- Контекст рендера включает данные задачи и уровня; отсутствующие поля дают предсказуемый пустой вывод Nunjucks.
- Добавляются unit-тесты и traceability metadata для сценариев подсказок.

## Non-goals

- Не мигрируем все существующие подсказки на `tip.njk` в рамках этого change.
- Не вводим новый шаблонный язык.
- Не меняем пользовательский UI подсказок, только источник и runtime-рендер.

## Capabilities

### Modified Capabilities

- `task`: task-specific подсказки уровня могут быть статичными (`tip.md`) или шаблонными (`tip.njk`).
- `level-labs`: лабораторный контекст получает уже отрендеренную подсказку.

## Acceptance Criteria

- `tip.md` продолжает читаться как статичный текст.
- `tip.njk` рендерится через общий prompt-template runtime.
- Если `tip.njk` отсутствует, runtime использует `tip.md`; если оба отсутствуют, возвращает пустую строку.
- Ошибка шаблона не роняет task runtime и возвращает raw template как fallback.
- Unit-тесты покрывают render/static/fallback/error behavior.
- Traceability связывает новые OpenSpec-сценарии с тестами.
