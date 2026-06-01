## Why

В продукте уже накопились отдельные setup-баги, которые не относятся ни к чистой документации, ни к UX, ни к тестовой подсистеме:

- onboarding sync ломается на `EXDEV`;
- smoke-tools могут падать на устаревших импортных путях;
- локальные preflight-проверки и системная диагностика формируют отдельный класс технических проблем.

Держать такие fixes под общим `dispatcher-bugfix` неудобно: intake там нормален, но доменная ответственность размыта.

## What Changes

- Вводится `dispatcher-install` под `focus-tech`.
- Dispatcher управляет changes, которые:
  - меняют локальный setup-flow;
  - исправляют `smoke` и связанные preflight-инструменты;
  - чинят onboarding sync как часть install/runtime подготовки;
  - улучшают локальную диагностику системного состояния перед запуском.
- Dispatcher сам не меняет runtime продукта напрямую, а переводит install-проблемы в downstream `fix`/`implement` changes.

## Non-goals

- Не подменяет `dispatcher-doc`, где остаются install-инструкции и public docs.
- Не становится владельцем общего runtime или UX.
- Не меняет install-critical стек без отдельного change и явного разрешения.

## Capabilities

### Modified Capabilities

- `external-local-onboarding`: install-time onboarding sync остаётся частью локального setup-контура и должен маршрутизироваться через install-line, когда проблема лежит в tooling или preflight-подготовке.
- `testing-layer`: downstream install behavior-change обязан иметь человеко-понятную тестовую часть с уровнем проверки, командой запуска и traceability-следом.

## Acceptance Criteria

- `dispatcher-install` существует как отдельный technical dispatcher под `focus-tech`.
- Setup/tooling bugs могут передаваться сюда из `dispatcher-bugfix`.
- У dispatcher есть собственный roadmap для install и preflight-контуров.

## Impact

- Появляется отдельный тактический контур для setup/tooling проблем, не смешанный с общим bugfix-потоком.
- Install-related fixes получают явного родителя и единые guardrails по воспроизведению, проверке и traceability.
