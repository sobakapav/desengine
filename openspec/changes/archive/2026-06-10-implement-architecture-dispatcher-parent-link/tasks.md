## Tasks

- [x] 1. Уточнить постановку и границы реализации
- [x] 2. Внести кодовые изменения
- [ ] 3. Выполнить проверку по verification_command из metadata

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios
- [x] Выбрать уровень проверки
- [x] Зафиксировать, что отдельные unit/component тесты не требуются для metadata-only lineage-правки
- [x] Зафиксировать команду проверки
- [x] Описать mock/fixture-данные и live credentials, если нужны

Затронутые OpenSpec capability/scenarios:
- `architecture-roadmap`: tactical dispatcher теперь структурно подчинён producer-линии архитектурной трансформации.
- `openspec-tooling`: lineage между `parent_change`, `strategy_root`, `roadmap_ref`, `roadmap_refs` и `producer_ref` становится явным и проверяемым.
- `testing-layer`: verification для metadata-only change зафиксирован как static/contract вместо неуместного unit-level.

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
- Не требуются: change меняет только OpenSpec metadata и governance-артефакты lineage/ownership.
