## 1. Контракт и инструкция

- [x] Зафиксировать в `admin-tools`, что release нельзя закрывать при наличии active changes с тем же `release_ref`.
- [x] Добавить то же правило в `tools/README.md` как часть административной процедуры закрытия release.

## 2. Guard и регрессия

- [x] Добавить явную traceability-ошибку для active changes, которые ссылаются на уже архивированный release.
- [x] Покрыть guard unit-регрессией с архивированным release и незакрытым active составом.

## 3. Внешняя проверка

- [x] Передать change на внешнюю проверку командами `npm run test:unit -- test/unit/openspec-release-closure.test.ts` и `npm run test:traceability`.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `admin-tools`: `Разработчик пытается закрыть release с незакрытым составом`

Уровни проверки:
- unit
- static/contract

Команды запуска:
- `npm run test:unit -- test/unit/openspec-release-closure.test.ts`
- `npm run test:traceability`

Mock/fixture-данные и credentials:
- unit-регрессия поднимает временное дерево `openspec/changes` с одним архивированным release и двумя active fix changes;
- live credentials не нужны.

Примечание по верификации:
- Финальную проверку и формулировку результата выполняет внешний проверяющий агент или пользователь.
