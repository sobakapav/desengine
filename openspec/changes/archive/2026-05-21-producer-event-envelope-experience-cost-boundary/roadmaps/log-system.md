# Roadmap: Log System

## Владелец

`producer-event-envelope-experience-cost-boundary` владеет roadmap лог-системы и предоставляет его `dispatcher-log-system`.

## Контур roadmap

- отделение логирования от аналитики и product telemetry;
- privacy/redaction/export/delete требования;
- границы между operational logs, user-action data и cost/accounting событиями.

## Downstream-правила

- лог-система не стартует как runtime implementation без принятого event/storage контракта;
- каждый child change обязан явно показать, зачем ему логирование и как оно проверяется.
