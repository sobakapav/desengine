## Миссия

- Что должен изменить этот change: заинтегрировать Monaco Editor внутрь Sandpack-ориентированного lab/workbench UX так, чтобы редактирование и preview ощущались как единая рабочая поверхность.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-ux
- strategy_root: focus-quality
- release_ref: release-2026-06-09-ui
- producer_ref: (не задан)
- Что из родительского change уже решено: `dispatcher-ux` уже закрепил этот контур как прямой UX-change и требует, чтобы улучшение было оформлено как downstream implement с явной тестовой частью.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию держит `focus-quality`, тактику UX-линии держит `dispatcher-ux`, итоговую приёмку делает внешний проверяющий, а не сам исполнитель change.

## Обязательные источники

- `openspec/changes/dispatcher-ux/proposal.md`
- `openspec/changes/dispatcher-ux/design.md`
- `openspec/specs/level-labs/spec.md`
- `openspec/specs/workbench-tools/spec.md`
- Какие ещё файлы и спецификации обязательны к чтению для implement-integrate-monaco-editor-into-sandpack: `components/desengine/lab/Code/MonacoCodeEditor.tsx`, `components/desengine/lab/Workbench/Workbench.tsx`, `components/desengine/lab/Workbench/WorkbenchView.tsx`, `lib/lab/sandpack-preview.ts`, `app/api/tasks/[taskId]/sandpack/route.ts`, `lib/workbench/lab-profile.ts`

## Границы исполнения

- Что входит в этот change: UX- и runtime-интеграция Monaco и Sandpack в рамках существующего lab/workbench контура, включая явный пользовательский сценарий, boundary state и fallback.
- Что сознательно не входит в этот change: смена preview-движка, глобальный replatforming Workbench, install-critical изменения стека и произвольная архитектурная перестройка вне нужд этой интеграции.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: сам UX-контур и необходимость downstream implement уже приняты `dispatcher-ux`; change не должен спорить с ownership или пытаться вынести Monaco/Sandpack в отдельный стратегический контур.

## Проверка результата

- verification_level: component/browser
- verification_command: `npm run test:traceability`
- Что именно должен доказать результат проверки: интеграция описана в traceability и получает явный browser/component способ проверки; финальный запуск и verdict делает внешний проверяющий.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: где держать source of truth для editor content; какой UI-срез считать канонической точкой проверки интеграции; нужен ли отдельный fallback/placeholder, если один из двух инструментов временно недоступен.
