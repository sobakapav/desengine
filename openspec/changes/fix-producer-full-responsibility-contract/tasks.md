## 1. Контракт producer ownership

- [ ] 1.1 Обновить системный OpenSpec-контракт `admin-tools` под producer как полного owner линии.
- [ ] 1.2 Зафиксировать, что downstream changes могут подчиняться producer напрямую.
- [ ] 1.3 Зафиксировать, что формализованные requirements/scenarios для producer не обязательны на старте.

## 2. Tooling и инструкции

- [ ] 2.1 Обновить AGENTS и user-facing тексты tooling, чтобы новые чаты не дробили producer ownership автоматически.
- [ ] 2.2 Обновить `traceability` и `os:*`, чтобы producer принимался как допустимый `parent_change`.
- [ ] 2.3 Обновить обзоры и handoff-контекст под общий `parent change`, а не только `parent dispatcher`.

## 3. Покрытие

- [ ] 3.1 Обновить unit-тесты для producer parent relationships и producer-guidance сообщений.
- [ ] 3.2 Сохранить traceability-контракт через `npm run test:traceability`.
- [ ] 3.3 Сохранить unit-контракт tooling через `npm run test:unit`.

## Тестовая часть change

- Затронутые OpenSpec capability/scenarios:
  - capability: `admin-tools`
  - scenario: producer напрямую управляет исполнительским change
  - scenario: producer создаёт вспомогательный dispatcher без потери ownership
  - scenario: producer появляется раньше формализованных требований и сценариев
- Уровень проверки: `static / contract` + `unit`.
- Команды запуска:
  - `npm run test:traceability`
  - `npm run test:unit`
- Mock/fixture-данные:
  - тестовые metadata для producer/direct-parent и producer->dispatcher.
- Live credentials: не требуются.
