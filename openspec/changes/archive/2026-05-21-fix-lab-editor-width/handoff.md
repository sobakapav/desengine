## Миссия

- Что должен изменить этот change: устранить раздувание ширины редактора на странице лаборатории и вернуть editor-pane в пределы доступного рабочего полотна

## Унаследованный контекст

- parent_change: dispatcher-ux
- strategy_root: focus-quality
- release_ref: (не задан)
- Что из родительского change уже решено: UX-требования к коду рождаются через downstream changes; этот fix относится к quality-контракту лаборатории и не меняет продуктовую стратегию напрямую

## Обязательные источники

- `openspec/changes/dispatcher-ux/proposal.md`
- `openspec/changes/focus-quality/roadmaps/ux-quality.md`
- `openspec/specs/level-labs/spec.md`
- Какие ещё файлы и спецификации обязательны к чтению для fix-lab-editor-width: `components/desengine/lab/Code/Code.tsx`, `components/desengine/lab/Code/styles.ts`, связанные source-contract тесты `test/unit/*`

## Границы исполнения

- Что входит в этот change: локальный layout-fix редактора лаборатории, delta в OpenSpec, автоматическая source-contract проверка
- Что сознательно не входит в этот change: полная переработка Workbench layout, смена Monaco/Tabs, новый resizable UI

## Проверка результата

- verification_level: unit
- verification_command: `npm run test:unit && npm run test:traceability`
- Что именно должен доказать результат проверки: editor-pane имеет явные layout-ограничения и контракт `level-labs`/traceability не расходится с реализацией

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: достаточно ли локального `min-w-0`/sidebar-width фикса или нужно править контейнер выше по дереву
