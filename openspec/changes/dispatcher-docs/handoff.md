# Handoff: dispatcher-docs

## Краткая цель линии

- Зафиксировать `dispatcher-docs` как управляющий change для governance-документации: он удерживает OpenSpec workflow guidance, документацию process-команд, handoff и traceability-правила, но не дублирует внешний documentation contract системы.

## Родительский контекст

- parent_change: `focus-governance`
- strategy_root: `focus-governance`
- roadmap_ref: `focus-governance/roadmaps/docs.md`

## Что уже решено

- `focus-governance` владеет process/governance веткой проекта.
- `dispatcher-openspec` ведёт более широкий OpenSpec/tooling-контур.
- `dispatcher-doc` под `focus-public` уже владеет внешним и общесистемным documentation contract, поэтому `dispatcher-docs` не должен забирать этот scope.

## Обязательные источники для чтения

- `openspec/changes/focus-governance/proposal.md`
- `openspec/changes/focus-governance/roadmaps/docs.md`
- `openspec/changes/dispatcher-openspec/proposal.md`
- `openspec/changes/dispatcher-doc/proposal.md`
- `tools/README.md`
- локальные developer-инструкции, если child change меняет process-правила

## Граница линии

- Входит: governance/OpenSpec workflow guidance, документация process-команд, handoff и traceability guidance, process-часть локальных developer-инструкций.
- Не входит: user-facing docs, install-гайды продукта, runtime-документация, help-контент и общий developer-facing documentation contract системы.

## Что должен доказать downstream change

- Документация governance-line больше не расходится с фактическим workflow.
- Указаны capability/scenarios, уровень проверки, команды запуска и все assumptions по данным/credentials либо причина отсрочки покрытия.
- Если change затрагивает пограничную область с `dispatcher-doc`, граница ownership описана явно.
