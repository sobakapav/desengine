## Tasks

- [x] 1. Зафиксировать в active spec, что release inclusion обязана синхронно обновлять `.openspec.yaml` и `handoff.md`.
- [x] 2. Добавить в tooling единый sync-path для release_ref при `os:dispatch`.
- [x] 3. Добавить post-check, который валит команду при расхождении metadata и handoff.
- [x] 4. Обновить unit-тесты release-dispatch path на полный sync обоих артефактов.

## Тестовая часть change

- Затронутые OpenSpec capability/scenarios:
  - `admin-tools`
  - scenario: release-диспетчеризация новой хотелки
  - scenario: release inclusion синхронно обновляет metadata и handoff
- Уровень проверки:
  - static/contract: обязательный
  - unit: обязательный
- Команда запуска:
  - `npm run test:traceability`
  - `npm run test:unit -- openspec-handoff`
- Mock/fixture-данные и credentials:
  - используются локальные временные fixture-каталоги
  - live credentials не требуются
