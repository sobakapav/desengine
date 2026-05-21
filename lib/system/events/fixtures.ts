import {
  createProjectEventScope,
  type EventEnvelope,
  type EventKind,
  type EventPayload,
  type EventPrivacyClass,
  type EventRedactionState,
  type EventScope,
} from "@/lib/system/events/contract"

export type ExperienceEventPayload = {
  family: "experience"
  action: "prompt-used" | "patch-applied"
  summary: string
  promptId?: string
  patchId?: string
} & Record<string, unknown>

export type ActionEventPayload = {
  family: "action"
  action: "hotkey-used" | "tool-opened"
  target: string
  value?: string
} & Record<string, unknown>

export type CostEventPayload = {
  family: "cost"
  action: "llm-usage" | "manual-time"
  amount: number
  unit: "tokens" | "seconds" | "cents"
  provider?: string
} & Record<string, unknown>

type BaseEnvelopeOptions<TPayload extends EventPayload> = {
  eventId?: string
  kind: EventKind
  occurredAt?: string
  scope?: EventScope
  privacyClass?: EventPrivacyClass
  redactionState?: EventRedactionState
  payload: TPayload
}

export function createEventEnvelope<TPayload extends EventPayload>({
  eventId = "event-1",
  kind,
  occurredAt = "2026-05-21T10:00:00.000Z",
  scope = createProjectEventScope(),
  privacyClass = "local",
  redactionState = "raw",
  payload,
}: BaseEnvelopeOptions<TPayload>): EventEnvelope<TPayload> {
  return {
    eventId,
    kind,
    occurredAt,
    scope,
    privacyClass,
    redactionState,
    payload,
  }
}

export function buildExperienceEventEnvelope(
  overrides: Partial<EventEnvelope<ExperienceEventPayload>> = {},
): EventEnvelope<ExperienceEventPayload> {
  return createEventEnvelope({
    kind: "experience.prompt-used",
    payload: {
      family: "experience",
      action: "prompt-used",
      summary: "Пользователь запустил prompt",
    },
    ...overrides,
  })
}

export function buildActionEventEnvelope(
  overrides: Partial<EventEnvelope<ActionEventPayload>> = {},
): EventEnvelope<ActionEventPayload> {
  return createEventEnvelope({
    kind: "action.hotkey-used",
    payload: {
      family: "action",
      action: "hotkey-used",
      target: "prompt-composer",
      value: "Mod+Enter",
    },
    ...overrides,
  })
}

export function buildCostEventEnvelope(
  overrides: Partial<EventEnvelope<CostEventPayload>> = {},
): EventEnvelope<CostEventPayload> {
  return createEventEnvelope({
    kind: "cost.llm-usage",
    payload: {
      family: "cost",
      action: "llm-usage",
      amount: 512,
      unit: "tokens",
      provider: "mock-llm",
    },
    privacyClass: "sensitive",
    redactionState: "metadata-only",
    ...overrides,
  })
}
