## MODIFIED Requirements

### Requirement: Обязательные тесты воспроизводимы без внешних секретов

#### Scenario: Wrapper browser verification не оставляет живой managed target server

- **WHEN** разработчик запускает browser verification через `node tools/testing/run-browser-verification-runtime.mjs ...`
- **THEN** wrapper поднимает managed `next dev` через контролируемый child process без shell shim
- **AND** после завершения или ошибки дожидается остановки этого процесса
- **AND** следующий wrapper-run не получает ложный конфликт `Another next dev server is already running`, если внешний target server не был запущен отдельно
