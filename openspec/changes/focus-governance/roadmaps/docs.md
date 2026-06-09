# Roadmap: Governance Docs

## Владелец

`focus-governance` владеет этим roadmap и поддерживает его для `dispatcher-docs` и всех downstream changes governance-документационного контура.

## Что направляет roadmap

- документация самого governance-слоя проекта: OpenSpec workflow, правила handoff, preflight, release-матрицы и traceability;
- канонические инструкции по использованию внутренних governance-команд и их ограничений;
- согласованность между OpenSpec-артефактами, `tools/README.md`, локальными developer-инструкциями и человеко-понятным test guidance для governance changes.

## Когда порождать downstream changes

- `producer-*`: когда документационный контур governance вырастает в отдельную системную программу инвентаризации, унификации или миграции;
- `dispatcher-*`: когда внутри governance-документации появляется отдельная долгоживущая тактическая линия;
- `implement-*` или `fix-*`: когда правила уже определены и нужно обновить tooling, проверки или документацию workflow без пересмотра всей линии.

## Жёсткие инварианты

- этот контур описывает документацию governance/OpenSpec-слоя, а не внешний продуктовый documentation contract;
- внешний и инженерный documentation contract системы вне governance-line остаётся в `dispatcher-doc` под `focus-public`;
- любой behavior-change в governance-документации обязан фиксировать capability/scenarios, уровень проверки, команду запуска и данные запуска или причину отсрочки;
- workflow change не считается завершённым, если документация команд и traceability-слой расходятся с фактическим процессом.

## Ближайшие направления

- унифицировать документацию внутренних команд `openspec:new`, `os:*` и связанных quality-gate;
- сделать границу между governance-docs и public docs явной в active changes и handoff;
- удерживать один канонический путь чтения process-инструкций для команды.
