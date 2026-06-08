# Proposal: fix-lab-check-route-flash

## Проблема

После нажатия на кнопку проверки в корневом lab-route `/lab/<taskId>` пользователь ненадолго видит промежуточный экран до показа результата проверки. Это происходит из-за того, что route использует устаревший `TaskRoute` и уводит браузер на отдельный check-route вместо локального переключения screen-state.

## Что меняется

- корневой `/lab/<taskId>` переводится на тот же `LabScreen`, который уже используется в screen-aware lab-routes;
- результат проверки открывается без лишнего route-hop и без краткого показа посторонней страницы;
- canonical task transition routes `/tasks/<taskId>/check` и `/tasks/<taskId>/done` сохраняются как reloadable entry points и direct-link targets.

## Тестирование

- Capability: `level-labs`
- Scenario: пользователь запускает проверку из canonical рабочего lab-route и сразу видит экран результата проверки
- Уровень: `static/contract`
- Команда: `npm run test:unit -- test/unit/p1-source-contracts.test.ts`
