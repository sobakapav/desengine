## MODIFIED Requirements

### Requirement: Child change получает отдельный handoff-артефакт для передачи исполнения

Система SHALL при создании change для последующего исполнения создавать `handoff.md` с обязательными секциями, чтобы создатель зафиксировал миссию, унаследованный контекст, источники, границы, проверку и открытые вопросы.

#### Scenario: Разработчик создаёт child change для другого исполнителя
- **WHEN** разработчик создаёт новый implement/fix change через `openspec:new`, `os:dispatch` или `os:begin --spawn-implement`
- **THEN** в каталоге change создаётся `handoff.md`
- **AND** файл уже содержит секции `Миссия`, `Унаследованный контекст`, `Обязательные источники`, `Границы исполнения`, `Проверка результата`, `Открытые вопросы`

### Requirement: Preflight не пускает implement/fix в исполнение без содержательного handoff

Система SHALL блокировать `npm run os:begin -- <implement-or-fix-change>`, если handoff-артефакт не заполнен по существу.

#### Scenario: Разработчик пытается начать implement/fix без заполненного handoff
- **WHEN** `handoff.md` отсутствует или содержит плейсхолдеры
- **THEN** `npm run os:begin -- <implement-or-fix-change>` завершается отказом
- **AND** сообщение явно указывает путь к `handoff.md`
- **AND** перечисляет причины, по которым handoff ещё не считается готовым
