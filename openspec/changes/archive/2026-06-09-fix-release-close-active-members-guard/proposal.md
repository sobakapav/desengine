# Proposal: fix-release-close-active-members-guard

## Проблема

Release change можно было архивировать вручную, не проверив, что все активные implement/fix changes с `release_ref` на этот release уже закрыты. В результате active delivery-состав оставался в рабочем слое, а его `release_ref` начинал ссылаться на архивированный release.

## Что меняется

- контракт `admin-tools` явно запрещает закрывать release, пока у него есть активный состав;
- `tools/README.md` добавляет операционное правило для ручного закрытия release;
- traceability-валидация начинает выдавать явную ошибку, если active change ссылается на уже архивированный release.

## Тестирование

- Capability: `admin-tools`
- Scenario: `Разработчик пытается закрыть release с незакрытым составом`
- Уровень: `unit`, `static/contract`
- Команда: `npm run test:unit -- test/unit/openspec-release-closure.test.ts`
- Команда: `npm run test:traceability`
