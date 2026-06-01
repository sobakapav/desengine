## Tasks

- [x] 1. Уточнить профильную документацию DeepSeek.
  - [x] 1.1 Удалить обещание text-only fallback для image-bearing lab-flow.
  - [x] 1.2 Зафиксировать fail-fast contract и рекомендуемый recovery path для оператора.
- [x] 2. Проверить связанные provider-docs и ссылки из root-документов на предмет явного противоречия новому contract.
- [x] 3. Добавить static/source-contract guard против возврата старой формулировки.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `llm`: система использует внешний провайдер в согласии с документированным операторским контрактом.
- `deepseek`: оператор выбирает DeepSeek и должен понимать реальные ограничения image-bearing flow.
- `external-local-onboarding`: читателю нужны подробности по частной теме.

Уровни проверки:
- static/contract: обязательный.
- unit: допустим, если guard будет жить в `test/unit/p2-source-contracts.test.ts`.

Команды запуска:
- `npm run test:unit -- test/unit/p2-source-contracts.test.ts`
- `npm run test:traceability`

Mock/fixture-данные и credentials:
- не нужны;
- change касается документационного контракта и source-level anti-regression.

Если покрытие откладывается:
- не допускается: documentation drift уже воспроизводим и должен получить автоматический guard в этом change.
