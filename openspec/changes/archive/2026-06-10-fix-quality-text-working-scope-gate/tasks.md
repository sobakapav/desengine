## Tasks

- [x] 1. Уточнить постановку и границы реализации
- [x] 2. Внести кодовые изменения
- [x] 3. Подготовить release note и handoff для внешней приёмки
- [x] 4. Выполнить локальную проверку по verification_command из metadata

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios
- [x] Выбрать уровень проверки
- [x] Зафиксировать команду проверки
- [x] Описать mock/fixture-данные и live credentials, если нужны
- [x] Зафиксировать, почему отдельные refactor-работы вынесены в waiver вместо немедленной декомпозиции

## Фактическое выполнение

- Затронутый capability/scenario: quality-text working scope gate для правил `api-example`, `file-length` и `function-length`.
- Уровень проверки: deterministic quality gate (`unit` в metadata change).
- Команда проверки: `npm run quality:text`.
- Mock/fixture/live credentials: не нужны; проверка читает текущий working scope и `tools/quality-text/waivers.json`.
- Почему часть работы вынесена в waiver: крупные UI/runtime/test-модули уже являются legacy-orchestration слоями; их безопасная декомпозиция требует отдельных refactor changes с собственным evidence, чтобы не смешивать восстановление quality gate с redesign.
