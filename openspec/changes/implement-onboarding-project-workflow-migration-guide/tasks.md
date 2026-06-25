## 1. Собрать фактическую структуру текущего onboarding

- [ ] 1.1 Инвентаризировать, как сегодня устроены onboarding-задачи, уровни, prompts и task metadata.
- [ ] 1.2 Отдельно выписать поля и сущности, которые завязаны на старую level-центричную схему.

## 2. Описать целевую project/workflow схему для контент-менеджера

- [ ] 2.1 Зафиксировать целевой пользовательский путь onboarding: `проект -> workflow -> проверка/чеклист -> результат`.
- [ ] 2.2 Сопоставить старые task/level элементы с новыми project/workflow сущностями в виде mapping-таблицы.
- [ ] 2.3 Явно перечислить, какие metadata-поля должны жить в проектном контексте, какие в workflow-описании, а какие в блоке проверки/результата.

## 3. Подготовить практическую инструкцию по migration

- [ ] 3.1 Написать пошаговую инструкцию, как контент-менеджеру переработать одну onboarding-задачу под новый режим.
- [ ] 3.2 Добавить минимальные примеры заполнения metadata для project/workflow/check/result частей.
- [ ] 3.3 Добавить checklist готовности, по которому можно проверить, что onboarding-задача уже совместима с новым режимом.

## 4. Подготовить change к внешней проверке

- [ ] 4.1 Зафиксировать затронутые capability/scenario на уровне planning-артефактов.
- [ ] 4.2 Зафиксировать verification как `npm run test:traceability` для no-code implement change.

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios
- [x] Выбрать уровень проверки
- [x] Зафиксировать команду проверки
- [x] Описать mock/fixture-данные и live credentials, если нужны

Затронутые OpenSpec capability/scenarios:
- `task`: onboarding-задачи готовятся к новой структуре metadata и пользовательского пути.
- `workflow`: onboarding получает инструкцию по разложению задач на workflow-этапы.
- `projects`: onboarding получает инструкцию по входу через project-aware контекст.

Уровни проверки:
- static/contract: обязательный.
- unit: не требуется.
- component/browser: не требуется.
- integration: не требуется.
- e2e smoke: не требуется.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`

Mock/fixture-данные и credentials:
- Не требуются: change готовит инструкцию и planning artifacts, а не runtime behavior.
