## 1. Контракт producer ownership

- [x] 1.1 Обновить системный OpenSpec-контракт `admin-tools` под producer как полного owner линии.
- [x] 1.2 Зафиксировать, что downstream changes могут подчиняться producer напрямую.
- [x] 1.3 Зафиксировать, что формализованные requirements/scenarios для producer не обязательны на старте.
- [x] 1.4 Зафиксировать, что dispatcher остаётся child `focus`, а не producer.

## 2. Tooling и инструкции

- [x] 2.1 Обновить AGENTS и user-facing тексты tooling, чтобы новые чаты не дробили producer ownership автоматически.
- [x] 2.2 Обновить `traceability` и `os:*`, чтобы producer принимался как допустимый `parent_change`.
- [x] 2.3 Обновить обзоры и handoff-контекст под общий `parent change`, а не только `parent dispatcher`.
- [x] 2.4 Убрать из active текстов модель `dispatcher -> producer` и заменить её на focus-parent + producer pressure.

## 3. Покрытие

- [x] 3.1 Обновить unit-тесты для producer parent relationships и producer-guidance сообщений.
- [ ] 3.2 Сохранить traceability-контракт через `npm run test:traceability`.
- [ ] 3.3 Сохранить unit-контракт tooling через `npm run test:unit`.

Примечание:
- topology `dispatcher -> focus` и связанный active capability-level контракт дополнительно закрыты follow-up change `fix-dispatcher-focus-topology-contract`.

## Тестовая часть change

- Затронутые OpenSpec capability/scenarios:
  - capability: `admin-tools`
  - scenario: producer напрямую управляет исполнительским change
  - scenario: producer работает рядом с dispatcher без иерархического подчинения
  - scenario: dispatcher подчиняется focus напрямую
  - scenario: producer появляется раньше формализованных требований и сценариев
- Уровень проверки: `static / contract` + `unit`.
- Команды запуска:
  - `npm run test:traceability`
  - `npm run test:unit`
- Mock/fixture-данные:
  - тестовые metadata для producer/direct-parent, dispatcher под focus и producer roadmap в той же focus-орбите.
- Live credentials: не требуются.
