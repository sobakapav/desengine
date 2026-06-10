## 1. Продуктовая рамка wiki

- [ ] 1.1 Зафиксировать двойную ценность wiki-системы для пользователей и LLM-движка разработки продукта.
- [ ] 1.2 Описать первый обязательный контур знаний, который должен войти в wiki раньше остального корпуса документов.
- [ ] 1.3 Определить границы между wiki-слоем, исходными source-of-truth документами и существующим OpenSpec/governance-контуром.

## 2. Capability-контракт

- [ ] 2.1 Добавить capability `wiki-system` как общий knowledge-layer для двух аудиторий.
- [ ] 2.2 Зафиксировать требования к двойному представлению wiki-единиц: human-readable и machine-consumable.
- [ ] 2.3 Зафиксировать traceability-требования к происхождению знаний и к выборке контекста для LLM.

## 3. Декомпозиция и проверка

- [ ] 3.1 Подготовить вопросы и направления для будущих producer/dispatcher changes по storage, UX, retrieval и правкам.
- [ ] 3.2 Зафиксировать тестовую стратегию для downstream behavior-change changes с уровнями `unit/contract`, `component/browser` и `integration/e2e smoke`.
- [ ] 3.3 Сохранить статический quality-gate текущего idea-change через `npm run test:traceability`.

## Тестовая часть change

- Затронутые OpenSpec capability/scenarios:
  - capability: `wiki-system`
  - scenario: idea-change задаёт wiki как общий knowledge-layer для человека и LLM-движка.
- Уровень проверки: `static / traceability`.
- Команда запуска: `npm run test:traceability`.
- Mock/fixture-данные: не требуются.
- Live credentials: не требуются.
