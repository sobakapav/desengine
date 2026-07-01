## Tasks

- [x] 1. Создать active release `release-2026-06-10-architecture`.
- [x] 2. Зафиксировать архитектурный стратегический и tactical контекст релиза без включения этих changes в физический состав поставки.
- [x] 3. Добавить в релиз первую domain-wave `Project` как исполнительский состав:
  - [x] 3.1 `implement-project-workspace-mvp`;
  - [x] 3.2 `implement-project-task-onboarding-binding`;
  - [x] 3.3 `implement-project-workflow-binding`;
  - [x] 3.4 `implement-project-workbench-preview-binding`;
  - [x] 3.5 `fix-project-ui-kit-migration-invalidation`.
- [x] 3.6 `implement-project-user-surface-foundation`.
- [x] 3.7 `implement-project-task-assignment-surface`.
- [x] 3.8 `implement-project-config-and-ui-kit-contract`.
- [x] 3.9 `implement-project-history-diagnostics-surface`.
- [x] 3.10 `implement-project-workflow-readout-surface`.
- [x] 3.11 `fix-project-ui-mode-removal`.
- [x] 3.12 `implement-project-component-registry-and-create-flow`.
- [x] 3.13 `implement-project-component-workflow-entrypoint`.
- [x] 3.14 `implement-project-workflow-run-observability`.
- [x] 3.15 `implement-workbench-workflow-session-surface`.
- [x] 3.16 `implement-workflow-component-aware-surface-labels`.
- [x] 3.17 `implement-workflow-image-component-foundation`.
- [x] 3.18 `implement-workflow-point-session-control`.
- [x] 3.19 `implement-workflow-point-guidance-and-prompt-focus`.
- [x] 3.20 `implement-workflow-point-artifact-generation-control`.
- [x] 3.21 `implement-editorial-shell-style-foundation`.
- [x] 4. Описать release lineage и лейтмотив волны в proposal/README/release-notes/handoff.
- [ ] 5. Выполнить внешнюю static/contract-проверку release-lineage.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `architecture-transform`: release фиксирует старт пользовательски значимой архитектурной волны.
- `architecture-roadmap`: в релиз собираются producer и первые tactical dispatchers архитектурной линии.
- `projects`: релиз фиксирует первую domain-wave вокруг новой сущности `Project`.
- `workflow`: релиз включает отдельный process-layer решения внутри project-wave.
- `workbench`: релиз включает пользовательский переход к workflow-session модели workbench.
- `ui-foundation`: релиз допускает visual-language волну, если она усиливает читаемость user-facing project/workflow path.
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
