## Миссия

- После принятого решения показывать пользователю, какие именно изменения оказались существенными.

## Унаследованный контекст

- parent_change: dispatcher-ux
- strategy_root: focus-quality
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: `dispatcher-ux` уже зафиксировал этот контур как downstream UX-improvement и перевёл его на уровень прямой реализации.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию держит `focus-quality`, тактику и приёмку этого UX-среза держит `dispatcher-ux`.

## Обязательные источники

- openspec/changes/dispatcher-ux/design.md
- openspec/changes/focus-quality/roadmaps/ux-quality.md
- openspec/specs/task/spec.md
- Какие ещё файлы и спецификации обязательны к чтению для implement-ux-highlight-correct-solution-diff: текущие check-result и task completion flows.

## Границы исполнения

- Что входит в этот change: прямое UX-изменение после успеха, объясняющий diff/summary-слой, traceability и UI-проверка.
- Что сознательно не входит в этот change: полный просмотр reference solution, серверная аналитика или общий пересмотр checking pipeline.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: границы UX-контура и сам факт реализации уже приняты `dispatcher-ux`; change не должен возвращаться к вопросу, implement это или нет.

## Проверка результата

- verification_level: component/browser
- verification_command: npm run test:traceability
- Что именно должен доказать результат проверки: change корректно включён в traceability, а реализация получает явную browser/e2e проверку UX-обратной связи.

## Открытые вопросы

- Где проходит граница между полезным объяснением и преждевременным раскрытием решения.
