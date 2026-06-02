## Миссия

- Что должен изменить этот change: убрать краткий показ посторонней страницы между нажатием `Проверить результат` и экраном check-result в корневом lab-route `/lab/<taskId>`.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: `dispatcher-bugfix`
- strategy_root: `(не задан)`
- release_ref: `release-2026-06-01-grooming`
- producer_ref: (не задан)
- Что из родительского change уже решено: canonical task transition routes `/tasks/<taskId>/check` и `/tasks/<taskId>/done` уже существуют и должны остаться reloadable entry points.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегия у `dispatcher-bugfix`, локальная реализация у этого fix, финальная приёмка у внешнего проверяющего.

## Обязательные источники

- `app/lab/[taskId]/page.tsx`
- `app/lab/[taskId]/[screen]/page.tsx`
- `components/desengine/lab/LabScreen/LabScreen.tsx`
- Какие ещё файлы и спецификации обязательны к чтению для fix-lab-check-route-flash: `openspec/specs/level-labs/spec.md`, `test/unit/p1-source-contracts.test.ts`, `app/tasks/[taskId]/check/page.tsx`.

## Границы исполнения

- Что входит в этот change: выровнять корневой lab-route с screen-aware `LabScreen`, убрать лишний route-hop перед показом check-result, сохранить действующие direct-link routes на task transition screens.
- Что сознательно не входит в этот change: redesign check-result UI, изменение canonical `/tasks/<taskId>/check` маршрута, переработка `TaskRoute` вне этого симптома.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: модель canonical route map, существование отдельного check-route для reload/direct-link сценариев, общая lab/workbench topology.

## Проверка результата

- verification_level: `unit`
- verification_command: `npm run test:unit -- test/unit/p1-source-contracts.test.ts`
- Что именно должен доказать результат проверки: корневой `/lab/<taskId>` теперь собирается на `LabScreen` с screen-aware `initScreen`, а canonical check-route остаётся отдельным reloadable entry point.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: достаточно ли перевести только корневой lab-route, не ломая direct-link поведение `/tasks/<taskId>/check`.
