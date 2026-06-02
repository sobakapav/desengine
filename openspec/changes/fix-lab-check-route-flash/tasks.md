## 1. Реализация

- [x] Перевести `app/lab/[taskId]/page.tsx` с устаревшего `TaskRoute` на `LabScreen`, чтобы check-result показывался внутри текущего lab-flow без отдельного route-hop.
- [x] Сохранить canonical task transition routes как reloadable entry points для прямого открытия результата проверки и итогового экрана.

## 2. Тестовый слой

- [x] Обновить source-contract coverage так, чтобы корневой `/lab/<taskId>` был зафиксирован как screen-aware entry point на `LabScreen`.
- [ ] Передать change на внешнюю проверку командой `npm run test:unit -- test/unit/p1-source-contracts.test.ts`.
