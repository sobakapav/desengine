## Why

Сейчас release-линия в проекте уже трактуется как delivery-матрица, а не как альтернативная иерархия ownership. Но в активных changes регулярно появляются попытки привязать к релизу неисполнительские роли:

- `dispatcher`;
- `producer`;
- иногда даже другие верхнеуровневые governance changes.

Это ломает смысл релиза. Release должен собирать только фактический исполнительский состав поставки, а не тактические и стратегические контейнеры решений.

## What Changes

- Вводится жёсткое правило OpenSpec: `release_ref` разрешён только для `implement` и `fix`.
- Привязка к release для `focus`, `idea`, `producer`, `dispatcher` и `release` становится явной ошибкой traceability metadata.
- Контракт фиксируется в active spec `admin-tools`.
- Инструментальная проверка OpenSpec metadata начинает падать на любом non-executable change, который пытается войти в релизный состав.

## Non-goals

- Не менять тактическое родительство `parent_change`.
- Не пересматривать существующую release-матрицу `dispatcher -> implement/fix`.
- Не вводить новый тип release members или промежуточную роль между dispatcher и implement/fix.

## Capabilities

### Modified Capabilities

- `admin-tools`: release composition получает жёсткое ограничение по `change_kind`.

## Acceptance Criteria

- Active spec явно говорит, что `release_ref` разрешён только у `implement` и `fix`.
- `npm run test:traceability` падает, если `dispatcher`, `producer`, `focus`, `idea` или `release` содержит `release_ref`.
- Unit-покрытие фиксирует хотя бы один негативный кейс с non-executable change в составе релиза.

## Тестовая часть change

- Затронутые OpenSpec capability/scenarios:
  - `admin-tools`
  - scenario: release показывает только исполнительский состав поставки
  - scenario: non-executable change не может входить в release через `release_ref`
- Уровень проверки: `static/contract` + `unit`.
- Команда запуска: `npm run test:traceability && npm run test:unit -- openspec-roadmap-inheritance openspec-release-list`.
- Mock/fixture-данные: локальные fixture-каталоги unit-тестов.
- Live credentials: не требуются.
