## Tasks

- [x] 1. Создать active release `release-2026-06-10-architecture`.
- [x] 2. Зафиксировать архитектурный стратегический и tactical контекст релиза без включения этих changes в физический состав поставки.
- [x] 3. Добавить в релиз первую domain-wave `Project` как исполнительский состав:
  - [x] 3.1 `implement-project-workspace-mvp`;
  - [x] 3.2 `implement-project-task-onboarding-binding`;
  - [x] 3.3 `implement-project-workflow-binding`;
  - [x] 3.4 `implement-project-workbench-preview-binding`;
  - [x] 3.5 `fix-project-ui-kit-migration-invalidation`.
- [x] 4. Описать release lineage и лейтмотив волны в proposal/README/release-notes/handoff.
- [ ] 5. Выполнить внешнюю static/contract-проверку release-lineage.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `architecture-transform`: release фиксирует старт пользовательски значимой архитектурной волны.
- `architecture-roadmap`: в релиз собираются producer и первые tactical dispatchers архитектурной линии.
- `projects`: релиз фиксирует первую domain-wave вокруг новой сущности `Project`.
- `workflow`: релиз включает отдельный process-layer решения внутри project-wave.
- `testing-layer`: release сохраняет требование внешней traceability-проверки и не подменяет verification downstream changes.

Уровни проверки:
- static/contract: обязательный.
- unit: не требуется.
- component/browser: не требуется.
- integration: не требуется.
- e2e smoke: не требуется.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`

Mock/fixture-данные и credentials:
- Не нужны.

Примечание по верификации:
- Финальную проверку и формулировку результата выполняет внешний проверяющий агент или пользователь.
