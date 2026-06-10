## Миссия

- Что должен изменить этот change: Довести WorkbenchView до прохода quality:text после выделения project-scope shell: убрать остаточные file-length/function-length нарушения или вернуть адресный waiver только если безопасная декомпозиция не укладывается в локальный scope.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-workbench
- strategy_root: focus-domain
- release_ref: release-2026-06-10-architecture
- producer_ref: (не задан)
- Что из родительского change уже решено: Workbench уже признан отдельной сущностью и целевой рабочей поверхностью; project-scoped shell уже вынесен из общего controller/view, но `WorkbenchView.tsx` всё ещё остаётся слишком крупным для quality gate.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию задаёт `producer-workbench`, tactical owner этого fix — `dispatcher-workbench`, внешний verification и приёмку выполняет родительский агент.

## Обязательные источники

- openspec/changes/dispatcher-workbench/proposal.md
- openspec/changes/dispatcher-workbench/design.md
- openspec/changes/dispatcher-workbench/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-workbench-view-quality-gate-repair:
  - openspec/specs/workbench/spec.md
  - components/desengine/lab/Workbench/WorkbenchView.tsx
  - components/desengine/lab/Workbench/WorkbenchProjectShell.tsx
  - components/desengine/lab/Workbench/useWorkbenchController.ts
  - tools/quality-text/waivers.json
  - openspec/changes/archive/2026-06-10-implement-workbench-project-scope-shell/handoff.md
  - openspec/changes/release-2026-06-10-architecture/release-notes.md

## Границы исполнения

- Что входит в этот change:
  - локально уменьшить `WorkbenchView.tsx` до прохода `quality:text`;
  - убрать остаточные `file-length` и `function-length` нарушения в view-слое через безопасное выделение presentation-блоков;
  - при необходимости вернуть адресный waiver только если дальнейшая декомпозиция потребует уже более рискованного redesign.
- Что сознательно не входит в этот change:
  - повторный пересмотр project shell, `ProjectWorkspace` или workbench controller semantics;
  - новые workflow/navigation контракты;
  - общий UI redesign Workbench.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться:
  - project scope остаётся входным контрактом Workbench;
  - WorkbenchView должен оставаться presentation-слоем, а не забирать назад project/runtime orchestration;
  - если для снятия нарушения нужен более крупный redesign, это отдельный downstream change, а не расширение этого fix.

## Проверка результата

- verification_level: unit
- verification_command: npm run quality:text
- Что именно должен доказать результат проверки: после локальной декомпозиции `WorkbenchView.tsx` больше не создаёт активных quality-text нарушений, а поведение workbench-line не маскируется новым необоснованным waiver.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы:
  - какие presentation-блоки безопаснее всего вынести из `WorkbenchView.tsx`, чтобы не трогать runtime semantics;
  - нужен ли дополнительный source/unit-контракт для нового view seam;
  - можно ли обойтись без возврата waiver для `WorkbenchView.tsx`.

## Что реализовано

- `WorkbenchView.tsx` сокращён до тонкой компоновки:
  - orchestration не возвращалась в view;
  - сам view теперь только собирает `WorkbenchHeader`, `WorkbenchOverview`, `WorkbenchWorkArea`, `WorkbenchFooter` и notices.
- В новый модуль `components/desengine/lab/Workbench/WorkbenchHeader.tsx` вынесены:
  - `WorkbenchHeader`
  - `WorkbenchHeaderActions`
  - оба reset-dialog presentation seams
- В новый модуль `components/desengine/lab/Workbench/WorkbenchContent.tsx` вынесены:
  - `WorkbenchOverview`
  - `WorkbenchWorkArea`
  - `WorkbenchFooter`
  - контекстный блок `TaskTip`

## Результат для quality gate

- `WorkbenchView.tsx` больше не требует waiver fallback.
- Активные нарушения `file-length` и `function-length` сняты реальной декомпозицией.
- После изменений `npm run quality:text` проходит со статусом:
  - `Violations: 22`
  - `Waived violations: 22`
  - `Нарушений не найдено.`

## Что важно проверить внешне

- `WorkbenchView` остался presentation-layer и не забрал назад project/runtime orchestration.
- Reset-actions по-прежнему ведут себя как раньше, только переехали в отдельный header module.
- Source-контракты обновлены под новый seam:
  - `test/unit/project-ui-kit-switching.test.ts`
  - `test/unit/lab-screen-event-propagation.test.ts`
  - `test/unit/p1-source-contracts.test.ts`

## Локальная проверка исполнителя

- Прогнан `npm run quality:text`:
  - passed
- Дополнительно прогнан точечный unit/source-набор:
  - `npm run test:unit -- test/unit/project-ui-kit-switching.test.ts test/unit/lab-screen-event-propagation.test.ts test/unit/p1-source-contracts.test.ts`
  - `3` test files passed
  - `29` tests passed
