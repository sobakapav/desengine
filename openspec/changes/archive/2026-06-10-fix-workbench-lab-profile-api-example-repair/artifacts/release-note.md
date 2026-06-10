# Release Note

## Что меняется для пользователя:

- В `lib/workbench/lab-profile.ts` экспортируемый API `createLabWorkbenchInstance` теперь содержит явный `@example`.
- Change не меняет поведение Workbench runtime и закрывает только operational quality blocker.

## Как это влияет на пользователя:

- `quality:text` снова может проходить без ложного стопа на нетривиальном API без примера.
- Команда получает рядом с API короткий образец того, как собирается project-aware `WorkbenchInstance` для текущей задачи и шага workflow.

## Как проверить:

- Запустить `npm run quality:text`.
- Убедиться, что активное нарушение `[api-example] lib/workbench/lab-profile.ts` больше не появляется.
