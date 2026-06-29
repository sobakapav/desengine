## 1. Собрать фактическую структуру текущего onboarding

- [x] 1.1 Инвентаризировать, как сегодня устроены onboarding-задачи, уровни, prompts и task metadata.
- [x] 1.2 Отдельно выписать поля и сущности, которые завязаны на старую level-центричную схему.

## 2. Описать целевую project/workflow схему для контент-менеджера

- [x] 2.1 Зафиксировать целевой пользовательский путь onboarding: `проект -> workflow -> проверка/чеклист -> результат`.
- [x] 2.2 Сопоставить старые task/level элементы с новыми project/workflow сущностями в виде mapping-таблицы.
- [x] 2.3 Явно перечислить, какие metadata-поля должны жить в проектном контексте, какие в workflow-описании, а какие в блоке проверки/результата.

## 3. Подготовить практическую инструкцию по migration

- [x] 3.1 Написать пошаговую инструкцию, как контент-менеджеру переработать одну onboarding-задачу под новый режим.
- [x] 3.2 Добавить минимальные примеры заполнения metadata для project/workflow/check/result частей.
- [x] 3.3 Добавить checklist готовности, по которому можно проверить, что onboarding-задача уже совместима с новым режимом.

## 4. Подготовить change к внешней проверке

- [x] 4.1 Зафиксировать затронутые capability/scenario на уровне planning-артефактов.
- [x] 4.2 Зафиксировать verification как `npm run test:traceability` для no-code implement change.

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
