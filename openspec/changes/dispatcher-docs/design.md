## Context

У проекта уже есть `dispatcher-doc`, который удерживает внешний и инженерный documentation contract системы под `focus-public`. Но governance-слой производит другой тип документации:

- правила создания и маршрутизации changes;
- документацию команд `openspec:new`, `os:*` и связанных preflight/gate;
- handoff-артефакты и traceability guidance;
- process-инструкции для команды, которые описывают способ работы, а не пользовательское поведение продукта.

Если этот слой не имеет отдельного tactical owner, он начинает дрейфовать: команда продолжает читать устаревшие правила, а workflow уже живёт иначе.

## Goals

- Дать governance-документации отдельного tactical owner под `focus-governance`.
- Зафиксировать жёсткую границу между `dispatcher-docs` и `dispatcher-doc`.
- Сделать downstream governance-docs changes нормальным путём для исправления process-documentation drift.
- Требовать человеко-понятную тестовую часть для изменений, которые обновляют workflow, traceability или test guidance.

## Non-goals

- Не брать ownership над user-facing, public или общесистемной инженерной документацией вне governance-line.
- Не подменять собой `dispatcher-openspec`, который владеет более широким OpenSpec/tooling-контуром.
- Не превращать любой текстовый governance-апдейт в повод для отдельного code change, если он не влияет на контракт workflow.

## Decisions

1. `dispatcher-docs` является no-code dispatcher под `focus-governance`.

   Базовые поля change:
   - `change_kind=dispatcher`
   - `execution_mode=no-code`
   - `parent_change=strategy_root=focus-governance`
   - `roadmap_ref=focus-governance/roadmaps/docs.md`

2. В контур `dispatcher-docs` входят только документы governance-слоя:
   - OpenSpec workflow guidance;
   - документация внутренних process-команд;
   - handoff и traceability guidance;
   - локальные developer-инструкции в той части, где они описывают governance-правила работы с change.

3. `dispatcher-docs` не дублирует `dispatcher-doc`.

   Правило разведения:
   - если документ объясняет систему, продукт, runtime, install, operator-facing или общий developer-facing контракт проекта, это линия `dispatcher-doc`;
   - если документ объясняет, как команда формулирует, запускает, передаёт, проверяет и закрывает changes внутри governance/OpenSpec-контура, это линия `dispatcher-docs`.

4. Documentation drift в governance-line делится на два класса:
   - редакторский drift без изменения workflow-контракта: может исправляться внутри связанного child change;
   - drift вокруг process-правил, test guidance, traceability, handoff или поведения governance-команд: должен оформляться как downstream `fix-*`, `implement-*` или `producer-*` change под `dispatcher-docs`.

5. Каждый downstream governance-docs change, который меняет workflow-контракт или проверочные ожидания, обязан содержать человеко-понятную тестовую часть:
   - затронутые capability/scenarios;
   - уровень проверки;
   - команду запуска;
   - mock/fixture-данные;
   - live credentials, если нужны;
   - причину и план закрытия, если покрытие откладывается.

## Risks

- Команда может продолжить воспринимать `dispatcher-docs` как дубль `dispatcher-doc`, если граница не будет повторяться в child changes и handoff.
- Governance-документация может остаться “прилипшей” к tooling-изменениям и не получить собственный backlog.
- Часть process-guidance может одновременно затрагивать и public docs, и governance docs; для таких случаев потребуется явная координация двух dispatcher-линий.

## Trade-offs

- Отдельный dispatcher добавляет ещё один слой координации, но убирает двусмысленность ownership вокруг process-документации.
- Жёсткое разведение с `dispatcher-doc` увеличивает число пограничных решений, но предотвращает прямой функциональный дубль.

## Open Questions

- Нужен ли позже отдельный producer для инвентаризации всей governance-документации, если поток child changes станет большим и разнотипным.
