## Tasks

- [ ] 1. Зафиксировать желаемое поведение release-status для exact tag + dirty worktree.
- [ ] 2. Исправить condition и/или пользовательский текст статуса, чтобы релизный тег не выглядел как «нерелизная версия».
- [ ] 3. Добавить unit-проверки на tagged-clean, tagged-dirty и branch-development сценарии.
- [ ] 4. Обновить OpenSpec/traceability-след.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `resource-status`: статус версии системы должен точно описывать Git-состояние.

Уровни проверки:
- static/contract: обязательный.
- unit: обязательный.
- component/browser: не требуется.
- integration: не требуется.
- e2e smoke: не требуется.
- live/provider: не требуется.

Команды запуска:
- `npm run test:unit && npm run test:traceability`

Mock/fixture-данные и credentials:
- Нужны локальные mock-output ответы git-команд.
