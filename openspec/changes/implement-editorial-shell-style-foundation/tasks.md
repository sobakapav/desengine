## Tasks

- [x] 1. Зафиксировать proposal/design/handoff change для editorial visual language и привязать его к `release-2026-06-10-architecture`.
- [ ] 2. Обновить OpenSpec delta для `ui-foundation` и `navigation` под editorial shell contract.
- [ ] 3. Ввести общие shell primitives и базовый visual layer для:
  - [ ] 3.1 page/section/card/callout surfaces;
  - [ ] 3.2 navigation/tab/button treatments;
  - [ ] 3.3 typography roles `eyebrow -> title -> body -> action`.
- [ ] 4. Перевести на новый contract ключевые user-facing surfaces релиза:
  - [ ] 4.1 `/projects` и `/projects/[projectId]`;
  - [ ] 4.2 workflow/workbench chrome;
  - [ ] 4.3 shell-страницы `/help`, `/system`, `/tasks`, `/levels`.
- [ ] 5. Подготовить change к внешней проверке:
  - [ ] 5.1 зафиксировать static/contract evidence;
  - [ ] 5.2 добавить component/browser evidence для navigation и одного project/workflow screen;
  - [ ] 5.3 при переносе browser-покрытия на следующую волну внести запись в `test/traceability/coverage-plan.json`.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `ui-foundation`: единый editorial visual contract product-shell интерфейса.
- `navigation`: editorial navigation surface и inversion-based active-state.
- `projects`: project pages должны выглядеть как часть общего shell, а не отдельный локальный UI.
- `workflow`: workflow/workbench shell должен визуально продолжать project path.

Уровни проверки:
- static/contract: обязателен.
- unit: обязателен, если появятся экспортируемые style helpers/primitives.
- component/browser: обязателен.
- integration: не обязателен, если change ограничится shell-layer.
- e2e smoke: по необходимости для ключевого пути `project -> workflow -> работа`.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`
- `npm run test:unit -- <editorial-shell-unit-tests>`
- `DESENGINE_E2E_FIXTURE_ACCESS=1 npm run test:e2e -- <editorial-shell-browser-specs>`

Mock/fixture-данные и credentials:
- fixtures должны покрывать хотя бы один project page и один workflow/workbench surface;
- live credentials не нужны.

Примечание по верификации:
- Финальную проверку и формулировку результата выполняет внешний проверяющий агент или пользователь.
