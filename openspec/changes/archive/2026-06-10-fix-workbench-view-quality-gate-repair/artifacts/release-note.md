# Release Note

## Что меняется для пользователя:

- View-слой Workbench локально декомпозирован: header/actions, контекстный блок, work area и footer больше не живут в одном длинном `WorkbenchView.tsx`.
- Repair снимает активный `quality:text` блокер для Workbench view без возврата временного waiver.

## Как это влияет на пользователя:

- Наблюдаемое поведение Workbench не меняется: проверка, reset, preview, сохранение и prompt composer работают как раньше.
- Команда снова может проходить quality gate для этой части workbench-линии без маскировки долга новым исключением.

## Как проверить:

- Запустить `npm run quality:text`.
- При необходимости дополнительно запустить `npm run test:unit -- test/unit/project-ui-kit-switching.test.ts test/unit/lab-screen-event-propagation.test.ts test/unit/p1-source-contracts.test.ts`.
