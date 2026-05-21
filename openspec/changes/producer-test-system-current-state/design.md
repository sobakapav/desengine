## Scope

Исследование покрывает текущее состояние тестовой подсистемы без изменения runtime:

- package scripts и канонические команды запуска;
- OpenSpec traceability и тестовые требования в active changes;
- существующие mock/fixture-подходы;
- зависимости от live/provider credentials;
- связи между `test:unit`, `test:traceability`, `test:e2e`, `test:full` и quality-gate командами.

## Deliverables

- Сводка по текущим entry points тестового слоя.
- Классификация существующих проверок по уровням.
- Список разрывов между документированным и фактическим состоянием.
- Приоритетный список follow-up change'ов для dispatcher/implement линии.

## Approach

1. Просмотреть `package.json`, тестовые каталоги и tooling-скрипты.
2. Сопоставить команды с OpenSpec capability/scenarios и traceability-обязательствами.
3. Зафиксировать зоны риска:
   - дублирующиеся команды;
   - неполные сценарии;
   - хрупкие live/provider зависимости;
   - неявные fixture/mocking соглашения.
4. Сформулировать рекомендации для дальнейшей roadmap-постановки.

## Risks / Trade-offs

- [Риск] Исследование быстро устареет на фоне активных изменений.
  → Mitigation: оформлять вывод как baseline для последующих changes, а не как вечную истину.

- [Риск] Исследование уйдёт в перечисление файлов без управленческих выводов.
  → Mitigation: требовать у результата список приоритетных follow-up actions.
