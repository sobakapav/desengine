import { z } from "zod"

import {
  EVENT_PAYLOAD_FAMILIES,
  EVENT_PRIVACY_CLASSES,
  EVENT_REDACTION_STATES,
  type EventEnvelope,
  type EventKind,
  type EventPayload,
  type EventPayloadFamily,
  type EventScope,
  type EventScopeKind,
} from "@/lib/system/events/contract"

const EventScopeSchema = z
  .object({
    projectId: z.string().min(1).optional(),
    workflowStepId: z.string().min(1).optional(),
    workbenchInstanceId: z.string().min(1).optional(),
  })
  .strict()
  .superRefine((scope, ctx) => {
    const scopeKind = resolveEventScopeKind(scope)

    if (!scopeKind) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Scope должен быть одной из MVP-комбинаций: project, workflow-step или workbench-instance.",
      })
    }
  })

const EventPayloadSchema = z
  .object({
    family: z.enum(EVENT_PAYLOAD_FAMILIES),
  })
  .catchall(z.unknown())

const EventKindSchema = z
  .string()
  .min(1)
  .refine((value): value is EventKind => {
    const family = value.split(".", 1)[0]

    return EVENT_PAYLOAD_FAMILIES.includes(family as EventPayloadFamily) && value.includes(".")
  }, "kind должен начинаться с family-префикса experience/action/cost.")

export const EventEnvelopeSchema = z
  .object({
    eventId: z.string().min(1),
    kind: EventKindSchema,
    occurredAt: z
      .string()
      .min(1)
      .refine((value) => !Number.isNaN(Date.parse(value)), "occurredAt должен быть валидным timestamp."),
    scope: EventScopeSchema,
    privacyClass: z.enum(EVENT_PRIVACY_CLASSES),
    redactionState: z.enum(EVENT_REDACTION_STATES),
    payload: EventPayloadSchema,
  })
  .superRefine((envelope, ctx) => {
    const familyPrefix = envelope.kind.split(".", 1)[0]

    if (familyPrefix !== envelope.payload.family) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "kind и payload.family должны относиться к одной payload family.",
        path: ["payload", "family"],
      })
    }
  })

export type EventEnvelopeInput = z.input<typeof EventEnvelopeSchema>

export type EventEnvelopeValidationResult<TPayload extends EventPayload = EventPayload> =
  | {
      ok: true
      value: EventEnvelope<TPayload>
    }
  | {
      ok: false
      issues: string[]
    }

type EventScopeInput = {
  projectId?: string | undefined
  workflowStepId?: string | undefined
  workbenchInstanceId?: string | undefined
}

export function resolveEventScopeKind(scope: EventScopeInput): EventScopeKind | null {
  const hasProject = Boolean(scope.projectId)
  const hasWorkflowStep = Boolean(scope.workflowStepId)
  const hasWorkbench = Boolean(scope.workbenchInstanceId)

  if (hasProject && !hasWorkflowStep && !hasWorkbench) {
    return "project"
  }

  if (hasProject && hasWorkflowStep && !hasWorkbench) {
    return "workflow-step"
  }

  if (hasProject && !hasWorkflowStep && hasWorkbench) {
    return "workbench-instance"
  }

  return null
}

/**
 * @example
 * ```ts
 * const result = validateEventEnvelope({
 *   eventId: "event-1",
 *   kind: "experience.opened",
 *   occurredAt: new Date().toISOString(),
 *   scope: { projectId: "project-a" },
 *   privacyClass: "local",
 *   redactionState: "raw",
 *   payload: { family: "experience" },
 * })
 * ```
 */
export function validateEventEnvelope<TPayload extends EventPayload = EventPayload>(
  input: unknown,
): EventEnvelopeValidationResult<TPayload> {
  const parsed = EventEnvelopeSchema.safeParse(input)

  if (!parsed.success) {
    return {
      ok: false,
      issues: parsed.error.issues.map((issue) => issue.message),
    }
  }

  return {
    ok: true,
    value: parsed.data as EventEnvelope<TPayload>,
  }
}

/**
 * @example
 * ```ts
 * const envelope = assertEventEnvelope({
 *   eventId: "event-1",
 *   kind: "action.saved",
 *   occurredAt: new Date().toISOString(),
 *   scope: { projectId: "project-a" },
 *   privacyClass: "local",
 *   redactionState: "raw",
 *   payload: { family: "action" },
 * })
 * ```
 */
export function assertEventEnvelope<TPayload extends EventPayload = EventPayload>(
  input: unknown,
): EventEnvelope<TPayload> {
  return EventEnvelopeSchema.parse(input) as EventEnvelope<TPayload>
}

export function isEventEnvelope(input: unknown): input is EventEnvelope {
  return EventEnvelopeSchema.safeParse(input).success
}
