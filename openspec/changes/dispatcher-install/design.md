## Context

Setup- и preflight-проблемы живут на стыке локального runtime, конфигурации и tooling. Это отдельная техническая линия, потому что пользователю они видны как «продукт не запускается», но корень у них не в основном приложении, а в install-flow.

## Goals

- Выделить install/setup/tooling bugs в отдельный dispatcher.
- Дать явного владельца fixes по smoke, onboarding sync и local-config слою.
- Отделить documentation issues от технических install issues.

## Non-goals

- Не брать на себя все публичные onboarding-тексты.
- Не заменять runtime и test-system dispatcher'ы.

## Decisions

1. Документация первого прохода остаётся под `dispatcher-doc`.
2. Setup/tooling fixes переходят под `dispatcher-install`.
3. Dispatcher удерживает и локальный smoke-flow, и onboarding sync как части одной install-линии.

## Risks

- Слишком широкий install-contour может начать втягивать unrelated runtime bugs.

## Open Questions

- Нужен ли позднее отдельный producer для baseline install pain points.
