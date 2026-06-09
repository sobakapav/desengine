## Tasks

- [x] 1. Зафиксировать в active spec, что `release_ref` разрешён только у `implement` и `fix`.
- [x] 2. Добавить в OpenSpec metadata validation явную ошибку для non-executable changes с `release_ref`.
- [x] 3. Убедиться, что release list и связанные docs не легитимизируют `dispatcher`/`producer` как валидных release members.
- [x] 4. Добавить unit-покрытие на негативный кейс с non-executable change в составе релиза.

## Тестовая часть change

- Затронутые OpenSpec capability/scenarios:
  - `admin-tools`
  - scenario: release показывает только исполнительский состав поставки
  - scenario: non-executable change не может входить в release через `release_ref`
- Уровень проверки:
  - static/contract: обязательный
  - unit: обязательный
- Команда запуска:
  - `npm run test:traceability`
  - `npm run test:unit -- openspec-roadmap-inheritance openspec-release-list`
- Mock/fixture-данные и credentials:
  - используются локальные временные fixture-каталоги unit-тестов
  - live credentials не требуются
