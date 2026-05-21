## Миссия

- Этот change передан мне, Codex, как исполнителю.
- Что должен изменить этот change: дать первый наблюдаемый runtime-эффект event-линии в одном конкретном flow `lab task screen`, чтобы потомки `Workbench` получали обновлённый event по одному общему контракту.

## Унаследованный контекст

- parent_change: dispatcher-event-envelope
- strategy_root: focus-product
- release_ref: release-2026-05-21-day
- Что из родительского change уже решено: MVP propagation ограничен цепочкой `app/lab/[taskId]/[screen]/page.tsx` → `LabScreen` → `TaskScreenSection` → `Workbench`, а наблюдаемым update path считается смена `activeScreen`.

## Обязательные источники

- `openspec/changes/dispatcher-event-envelope/proposal.md`
- `openspec/changes/implement-event-envelope-contract/proposal.md`
- `openspec/changes/implement-screen-event-envelope-propagation/proposal.md`
- `openspec/changes/implement-screen-event-envelope-propagation/design.md`
- `openspec/changes/implement-screen-event-envelope-propagation/tasks.md`
- `app/lab/[taskId]/[screen]/page.tsx`
- `components/desengine/lab/LabScreen/LabScreen.tsx`
- `components/desengine/lab/LabScreen/ScreenSections.tsx`
- `components/desengine/lab/Workbench/props.ts`

## Границы исполнения

- Что входит в этот change: один page-to-screen contract, один source of truth для screen event, минимум один child consumer внутри `Workbench`, один observable update path через смену `activeScreen`, traceability и runtime-проверка.
- Что сознательно не входит: global event bus, propagation для `check`/`done`/`transition`, storage, product event log persistence, массовый producer wiring.

## Проверка результата

- verification_level: component
- verification_command: `npm run test:traceability`
- Что именно должен доказать результат проверки: выбранный task/workbench flow реально распространяет один event contract вниз по дереву и обновляет минимум одного consumer'а при смене `activeScreen`.

## Открытые вопросы

- Выбрать, будет ли runtime contract пропсовым или screen-scoped provider, не создавая второго параллельного пути.
- Найти первого child consumer'а в `Workbench`, для которого обновление события действительно наблюдаемо и проверяемо тестом.
