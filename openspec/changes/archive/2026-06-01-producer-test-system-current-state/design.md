## Context

В проекте уже есть единый capability `testing-layer`, несколько канонических test-команд и требования к traceability, но baseline текущего состояния подсистемы тестирования пока не собран в одном месте. Из-за этого `focus-quality` и `dispatcher-test-system` сложно принимать решения о приоритетах: неочевидно, какие уровни проверки реально работают, где есть дублирование и какие сценарии остаются только документированными.

`producer-test-system-current-state` остаётся no-code change и не меняет runtime. Его задача — зафиксировать исходное состояние и подготовить материал для downstream dispatcher/implement/fix изменений.

## Goals

- Собрать понятную карту текущих test entry points и их назначения.
- Сопоставить фактические проверки с capability/scenarios OpenSpec и traceability-обязательствами.
- Выделить gaps, дублирование, хрупкие зависимости от fixture/mock/live-практик.
- Подготовить приоритетный baseline для дальнейших changes под `focus-quality`.

## Non-goals

- Не менять тестовые команды, harness и runtime этого репозитория.
- Не добавлять новые автоматические проверки в рамках текущего change.
- Не вводить новые governance-правила test-system вместо `dispatcher-test-system`.

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

## Decisions

1. Baseline собирается через существующие артефакты репозитория:
   - `package.json` и test/tooling scripts;
   - OpenSpec specs и active changes;
   - test directories, fixtures и вспомогательные скрипты.
2. Классификация строится по слоям проверки, уже принятым в репозитории:
   - static/contract;
   - unit;
   - component/browser;
   - integration;
   - e2e smoke;
   - live/provider.
3. Анализ должен фиксировать не только наличие команд, но и зоны риска:
   - дублирующиеся команды;
   - неполные сценарии;
   - хрупкие live/provider зависимости;
   - неявные fixture/mocking соглашения.
4. Результат обязан заканчиваться рекомендациями для дальнейшей roadmap-постановки, а не только перечислением текущих файлов и команд.

## Risks / Trade-offs

- [Риск] Исследование быстро устареет на фоне активных изменений.
  → Mitigation: оформлять вывод как baseline для последующих changes, а не как вечную истину.

- [Риск] Исследование уйдёт в перечисление файлов без управленческих выводов.
  → Mitigation: требовать у результата список приоритетных follow-up actions.

## Open Questions

- Нужен ли после baseline отдельный producer change для постоянного сопровождения coverage-gap матрицы, если объём test-system контекста вырастет.
- Какие части текущего test-system логичнее развивать общим dispatcher'ом, а какие стоит отделять в более узкие downstream контуры.
