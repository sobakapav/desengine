## Tasks

- [ ] 1. Зафиксировать пользовательские сценарии работы с roadmap, ADR и другими системными рамочными документами.
- [ ] 2. Описать, какие типы документов входят в первый контур `cross-docs`.
- [ ] 3. Описать ценность единой оболочки для чтения, фокусировки и навигации по governance-документам.
- [ ] 4. Зафиксировать editable-flow как обязательную часть идеи.
- [ ] 5. Описать связь `cross-docs` с текущими OpenSpec, roadmap и ADR-практиками репозитория.
- [ ] 6. Подготовить план декомпозиции в будущие producer/dispatcher changes.
- [ ] 7. Подготовить тестовую стратегию и traceability-план для будущих behavior-change changes.

## Тестовая часть change

- Затронутые OpenSpec capability/scenarios:
  - capability: `admin-tools`
  - capability: `workflow`
  - scenario: idea-change фиксирует единую оболочку для governance-документов как будущий пользовательский инструмент.
- Уровень проверки: `static / traceability`.
- Команда запуска: `npm run test:traceability`.
- Mock/fixture-данные: не требуются.
- Live credentials: не требуются.
