## Context

`buildSandpackPreviewPayload(...)` уже умеет:
- переключать preview в compatibility fallback;
- уходить в budget-based degradation;
- публиковать structured diagnostics для downstream тестов и host-диагностики.

Значит, поддержка guardrail против Server Actions должна встраиваться в тот же surface, а не создавать отдельный side-channel диагностики.

## Goals

- Рано распознавать неподдерживаемые Server Action маркеры в preview source files.
- Деградировать в уже существующий safe fallback path.
- Вернуть отдельную machine-readable причину в diagnostics.

## Non-goals

- Не исполнять и не эмулировать Next.js Server Actions в Sandpack.
- Не расширять этот fix до всех возможных Next-only API.

## Decisions

1. Guardrail срабатывает до сборки финального preview payload.
2. Для пользователя это выглядит как обычный controlled fallback, а не как hard crash iframe.
3. Для downstream tooling причина фиксируется как `unsupported_preview_api`, чтобы её можно было отделить от `project_compatibility_fallback` и `preview_budget_exceeded`.

## Risks / Trade-offs

- Регулярные выражения guardrail могут поймать не все экзотические формы Server Actions.
  -> Mitigation: покрыть минимальный честный набор маркеров (`"use server"`, `action={...}`, `formAction={...}`, `useActionState`/`useFormState`) и оставить path расширяемым.

- Слишком широкий guardrail может зацепить код, который технически не является Server Action.
  -> Mitigation: ограничить его preview-specific JSX/hook-маркерами и отдавать явную диагностику вместо молчаливой модификации кода.
