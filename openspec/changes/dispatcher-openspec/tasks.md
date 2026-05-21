## Tasks

Технический backlog реализации ведётся в issue:
- https://github.com/sobakapav/desengine/issues/7

Ниже остаются продуктовые и traceability-задачи change.

- [ ] 1. Зафиксировать карту OpenSpec-слоя проекта как отдельного продуктово-инструментального контура.
  - [ ] 1.1 Определить границы между контрактом, workflow changes и tooling
  - [ ] 1.2 Зафиксировать, какие workflow-инварианты уже считаются частью слоя
- [ ] 2. Продолжить развитие кастомной схемы change как отдельного направления внутри OpenSpec-слоя.
  - [ ] 2.1 Инвентаризировать текущие кастомные поля в changes (фактическое использование)
  - [ ] 2.2 Зафиксировать MVP-расширение схемы (поля, типы, правила)
  - [ ] 2.3 Поддерживать контракт `short`, `issue`, `review_sync_state`, `change_kind` и иерархические поля
- [ ] 3. Развивать workflow changes как отдельное направление OpenSpec-слоя.
  - [ ] 3.1 Dispatcher/release/implement/fix orchestration
  - [ ] 3.2 Handoff и preflight-gates
  - [ ] 3.3 Каскад закрытия change/task и правила передачи между чатами
  - [ ] 3.4 Стратегическое владение roadmap и их наследование downstream dispatcher-ами
- [ ] 4. Зафиксировать правила синхронизации OpenSpec ↔ GitHub Issues (MVP, без обязательной полной автоматики).
- [ ] 5. Определить источник truth для схемы и workflow-правил (где и как хранить/валидировать).
- [ ] 6. Обновлять внутренние инструменты под OpenSpec-слой в целом:
  - [ ] 6.1 `openspec:new` шаблоны, handoff и базовая валидация
  - [ ] 6.2 `os:*` preflight/dispatch/ctx/close/rename workflow
  - [ ] 6.3 листинги active/release changes и обзор состава поставки
  - [ ] 6.4 статическая проверка схемы и workflow-инвариантов
- [ ] 7. План миграции существующих changes (поэтапно) + правила совместимости.
- [ ] 7.1 Перенести roadmap из dispatcher в стратегических владельцев (`focus|idea|producer`)
- [ ] 7.2 Обновить active changes на ссылки вида `<strategic-change>/roadmaps/<file>.md`
- [ ] 7.3 Поддержать `roadmap_refs` для dispatcher, которым нужен более чем один roadmap
- [ ] 7.4 Поддержать `producer_ref` как отдельный контекстный ярлык только для implement/fix
- [ ] 8. Тестовый план OpenSpec-слоя:
  - [ ] 8.1 unit проверки инструментов и workflow-гейтов
  - [ ] 8.2 `npm run test:traceability` не деградирует

## Тестовая часть change

- [ ] Указать затронутые OpenSpec capability/scenarios (инструментальные): `admin-tools` / сценарии OpenSpec-tooling по схеме, handoff, preflight, rename и release-листингу
- [ ] Выбрать уровень проверки: static/contract + unit
- [ ] Добавить или обновить тесты в общем слое тестирования
- [ ] Зафиксировать команду проверки: `npm run test:traceability` и выборочные `npm run test:unit -- ...` по tooling-сценариям
- [ ] Описать mock/fixture-данные и live credentials, если они нужны (для этого change не нужны)
- [ ] Если покрытие откладывается, добавить запись в `test/traceability/coverage-plan.json` с причиной и этапом закрытия
