# Roadmap: Test System

## Владелец

`focus-quality` владеет roadmap тестовой подсистемы и предоставляет его `dispatcher-test-system`.

## Контур решения

- единый слой команд `test:unit`, `test:traceability`, `test:integration`, `test:e2e`, `test:live`;
- правила выбора test level для change;
- traceability между capability/scenarios и тестами;
- политика mock/fixture/live credentials.

## Когда эскалировать в child change

- нужен новый слой проверки или новый входной сценарий запуска;
- тестовый контур перестаёт покрывать реальный контракт capability;
- появляются системные правила для fixtures, credentials или coverage-plan.

## Ожидаемый downstream-след

- `producer-*` для анализа gaps, ведения roadmap и постановки ожиданий к downstream dispatcher;
- `implement-*` для новых проверок, harness и tooling;
- `fix-*` для разрывов между контрактом и фактическими командами.

## Критерий полезности

Roadmap рабочий, если по нему ясно, какой слой проверки нужен change, какой командой он запускается и когда отсутствие покрытия должно идти в `coverage-plan`, а не оставаться устной договорённостью.
