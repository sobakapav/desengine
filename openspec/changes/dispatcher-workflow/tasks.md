## Tasks

## Текущий фокус реализации

- Dispatcher-workflow удерживает только process-часть основной цепочки `проект -> workflow -> проверка/чеклист -> результат`.
- Ветки вне этой цепочки не считаются текущим приоритетом.

- [ ] 1. Зафиксировать `dispatcher-workflow` как tactical owner workflow-линии.
- [ ] 2. Явно сверить dispatcher с `producer-workflow` в той же focus-линии.
- [ ] 3. Зафиксировать tactical ownership для:
  - [ ] 3.1 definition/instance model;
  - [ ] 3.2 step/fase manifestation;
  - [ ] 3.3 transitions;
  - [ ] 3.4 связи workflow с task, artifacts и Workbench.
- [ ] 4. Подготовить dispatcher к маршрутизации downstream changes:
  - [ ] 4.1 foundation workflow model;
  - [ ] 4.2 transition away from level-driven model;
  - [ ] 4.3 Отложено: vertical workflow slices после стабилизации основной цепочки.

## Тестовая часть change

- Затронутые OpenSpec capability/scenarios:
  - `workflow`: process-line получает отдельного tactical owner;
  - `workbench`: dispatcher помогает различать process changes и surface changes;
  - `level-labs`: legacy-level transition получает operational tracking.

- Уровни проверки:
  - static/contract: обязательный.
  - unit: не требуется.
  - component/browser: не требуется.
  - integration: не требуется.
  - e2e smoke: не требуется.
  - live/provider: не требуется.

- Команды запуска:
  - `npm run test:traceability`

- Mock/fixture-данные и credentials:
  - Не требуются: change описывает ownership и sequencing workflow-линии.
