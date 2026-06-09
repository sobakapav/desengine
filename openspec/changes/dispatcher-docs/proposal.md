## Why

В проекте уже есть отдельный documentation dispatcher для внешнего и инженерного контракта системы, но у governance-слоя остаётся свой класс документов, который живёт по другим правилам:

- OpenSpec workflow и иерархия changes;
- команды `openspec:new`, `os:*` и их quality-gate;
- handoff, traceability и проверочные ожидания для governance changes;
- локальные инструкции для команды, которые описывают не продукт, а сам способ работы.

Сейчас эта документация размазана между `tools/README.md`, change-артефактами, `AGENTS.md` и устными договорённостями. Без отдельного tactical owner она легко расходится с фактическим governance-процессом.

## What Changes

- Вводится `dispatcher-docs` под `focus-governance` с лейтмотивом «Забота о документации проекта».
- Dispatcher управляет changes, которые:
  - обновляют документацию governance/OpenSpec-слоя;
  - синхронизируют workflow-инструкции с реальными командами и quality-gate;
  - фиксируют документационный drift в handoff, traceability и process-guidance.
- Dispatcher явно проводит границу с `dispatcher-doc`:
  - `dispatcher-doc` под `focus-public` отвечает за внешний и общий инженерный documentation contract системы;
  - `dispatcher-docs` под `focus-governance` отвечает только за документацию самого governance-контура.

## Non-goals

- Не заменяет `dispatcher-doc` и не становится вторым владельцем `README.md`, `docs/**` и user-facing документации по продукту в целом.
- Не реализует tooling или runtime-изменения сам по себе.
- Не пересматривает весь OpenSpec-слой без отдельных downstream changes.

## Capabilities

### Modified Capabilities

- `admin-tools`: governance-документация внутренних команд получает отдельного tactical owner.
- `testing-layer`: downstream governance-docs changes обязаны явно описывать проверку, если обновляют test guidance, traceability или workflow quality-gate.

## Acceptance Criteria

- `dispatcher-docs` отображается в дереве OpenSpec как дочерний change у `focus-governance`.
- Dispatcher ссылается на roadmap governance-документации стратегического владельца и не держит локальный roadmap как источник истины.
- В change явно зафиксировано отсутствие функционального дубля с `dispatcher-doc`.
- Downstream governance-docs changes обязаны содержать человеко-понятную тестовую часть: capability/scenarios, уровень проверки, команды запуска, fixture/live assumptions и причину отсрочки при необходимости.

## Impact

- `focus-governance` получает отдельный documentation dispatcher для process- и OpenSpec-контура.
- Документация workflow перестаёт быть побочным приложением к tooling-change и становится управляемой линией.
