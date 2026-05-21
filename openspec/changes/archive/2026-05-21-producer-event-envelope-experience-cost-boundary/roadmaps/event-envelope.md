# Roadmap: Event Envelope

## Владелец

`producer-event-envelope-experience-cost-boundary` владеет этим roadmap и предоставляет его `dispatcher-event-envelope`.

## Что считается прогрессом

- определены payload-профили и privacy-first границы;
- отделены обязательные invariants от open questions;
- понятно, какие части переходят в implement changes, а какие остаются исследовательскими.

## Когда нужен downstream change

- появляется отдельный operational контур вокруг event-contract или adapters;
- конкретный consumer требует кодовой реализации payload/storage/export/delete поведения;
- нужно закрепить тестовый контракт для уже принятых решений.
