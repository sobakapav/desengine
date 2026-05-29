## Tasks

- [ ] 1. Найти все level-3 артефакты, которые называют style-файл по-разному.
- [ ] 2. Выбрать и закрепить каноническое имя в соответствии с реальным workbench/file-set контрактом.
- [ ] 3. Исправить onboarding overview, hidden checking prompt и связанные тексты.
- [ ] 4. Обновить traceability-след.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `level-labs`: пользователь должен видеть и редактировать корректный набор файлов уровня.
- `component-file-set`: имя style-файла должно быть согласовано во всех контрактах уровня.

Уровни проверки:
- static/contract: обязательный.
- unit: не требуется, если правка останется на уровне onboarding/prompts/spec.
- component/browser: не требуется.
- integration: не требуется.
- e2e smoke: не требуется.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`

Mock/fixture-данные и credentials:
- Не требуются.
