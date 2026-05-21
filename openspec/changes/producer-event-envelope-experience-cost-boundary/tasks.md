## Tasks

- [ ] 1. Переоформить change как продюсерский (`producer-*`) и зафиксировать его границы.
- [ ] 2. Определить ядро `EventEnvelope`: обязательные поля, опциональные поля, список открытых вопросов.
- [ ] 3. Построить матрицу scope-инвариантов для `project` / `task` / `workflow step` / `workbench`.
- [ ] 4. Определить MVP payload-профили для `experience` / `action` / `cost` и границу metadata vs content.
- [ ] 5. Зафиксировать privacy/redaction/export/delete policy для MVP и список запрещённых данных.
- [ ] 6. Определить adapter boundary и lifecycle envelope без реализации storage/runtime.
- [ ] 7. Сформировать roadmap на последующие behavior-change changes и их тестовый след.

## Тестовая часть change

Этот change продюсерский. В его рамках обязательно зафиксировать:

- затронутые capability/scenarios для последующей реализации:
  - `event-envelope`: событие имеет scope, privacy class и redaction state;
  - `experience`: experience events используют общий envelope;
  - `cost-accounting`: cost events используют общий envelope и metadata-only policy.
- уровни проверки для downstream implementation:
  - static/contract: обязательный;
  - unit: обязательный;
  - integration/e2e: не требуется для contract MVP, но нужен при появлении пользовательского flow.
- команды проверки для последующих этапов:
  - `npm run test:unit`
  - `npm run test:traceability`

Mock/fixture-данные для будущих тестов:
- fixture prompt event;
- fixture action event;
- fixture cost event;
- live credentials не нужны.
