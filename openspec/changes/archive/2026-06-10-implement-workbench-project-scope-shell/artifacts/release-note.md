# Release Note

## Что меняется для пользователя:

- Workbench теперь явно читает project scope через отдельный shell-слой, а не держит project loading/settings/migration внутри одного монолитного view/controller.
- Project-aware create/select/migration flow сохранён, но boundary между project shell и остальным Workbench стал отдельным модулем.

## Как это влияет на пользователя:

- Поведение project-aware Workbench остаётся прежним: active project, preview и migration продолжают работать в той же последовательности.
- Команде проще развивать следующую волну `project -> task -> workflow -> workbench`, потому что project boundary больше не размазан по общему Workbench orchestration.

## Как проверить:

- Запустить `npm run test:unit -- test/unit/task-project-client-boundary.test.ts test/unit/project-ui-kit-switching.test.ts test/unit/ui-kit-switcher-visibility.test.ts test/unit/workbench-platform-registry.test.ts`.
- Убедиться, что project shell вынесен в `WorkbenchProjectShell.tsx` и `useWorkbenchProjectScope.ts`, а source/unit-контракты на create/select/migration проходят без regressions.
