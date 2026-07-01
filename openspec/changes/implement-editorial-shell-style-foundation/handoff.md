## Миссия

- Что должен изменить этот change: editorial shell style foundation
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: `dispatcher-ui-kit`
- strategy_root: `focus-domain`
- release_ref: `release-2026-06-10-architecture`
- producer_ref: `producer-ui-kit`
- Что из родительского change уже решено: product-shell уже признан отдельным пользовательским слоем, а UI-line допускает отдельный большой change на унификацию visual language вместо локальных page-level правок.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию держит `producer-ui-kit`, тактический контур держит `dispatcher-ui-kit`, этот implement change отвечает за внедрение editorial shell contract в код и подготовку к внешней проверке.

## Обязательные источники

- `openspec/specs/ui-foundation/spec.md`
- `openspec/specs/navigation/spec.md`
- `openspec/changes/release-2026-06-10-architecture/proposal.md`
- Какие ещё файлы и спецификации обязательны к чтению для implement-editorial-shell-style-foundation: `components/desengine/Navigation.tsx`, `app/layout.tsx`, `app/projects/**`, `components/desengine/project/**`, `components/desengine/lab/**`, `app/help/page.tsx`, `app/system/page.tsx`, `app/tasks/page.tsx`, `app/levels/page.tsx`.

## Границы исполнения

- Что входит в этот change: единый editorial visual contract product-shell интерфейса, общие shell primitives, migration ключевых project/workflow/workbench surfaces и navigation под этот contract.
- Что сознательно не входит в этот change: стили пользовательского preview внутри iframe, redesign пользовательских компонентов, новый внешний marketing/public brand и замена install-critical стека.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться: границы UI-line, существование product-shell как отдельного слоя и отсутствие обязательства превращать change в новый runtime UI kit.

## Проверка результата

- verification_level: `static/contract` + `component/browser`
- verification_command: `npm run test:traceability` и browser-команда для navigation/project-workflow surfaces
- Что именно должен доказать результат проверки: navigation и ключевые project/workflow surfaces реально переходят на единый editorial contract, а user preview и генерируемый контент не получают непреднамеренного style-давления.

## Открытые вопросы

- Какие surfaces должны считаться обязательным релизным минимумом, если полный rollout по всему product-shell не помещается в одну волну?
- Нужен ли отдельный typography/token layer, или достаточно общего shell contract без вынесения в новую системную тему?
- Какой browser evidence станет минимально достаточным для визуального контракта без хрупкой screenshot-зависимости?
