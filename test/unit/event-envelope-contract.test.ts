// @openSpec capability: event-envelope
// @openSpec scenarios:
// @openSpec  - "Runtime создаёт project-scoped событие"
// @openSpec  - "Runtime создаёт task-scoped событие"
// @openSpec  - "Runtime создаёт workflow-step-scoped событие"
// @openSpec  - "Runtime создаёт workbench-instance-scoped событие"
// @openSpec  - "Envelope без обязательного поля отклоняется"
// @openSpec  - "Смешанный scope отклоняется"
// @openSpec  - "Privacy и redaction значения валидируются"
// @openSpec  - "Experience payload использует общий envelope"
// @openSpec  - "Action payload использует общий envelope"
// @openSpec  - "Cost payload использует общий envelope"

import { describe, expect, it } from "vitest"

import {
  assertEventEnvelope,
  buildActionEventEnvelope,
  buildCostEventEnvelope,
  buildExperienceEventEnvelope,
  createProjectEventScope,
  createTaskEventScope,
  createWorkbenchInstanceEventScope,
  createWorkflowStepEventScope,
  resolveEventScopeKind,
  validateEventEnvelope,
} from "@/lib/system/events"

describe("EventEnvelope foundation contract", () => {
  it("принимает все четыре MVP scope-комбинации", () => {
    const envelopes = [
      buildExperienceEventEnvelope({
        scope: createProjectEventScope("project-a"),
      }),
      buildActionEventEnvelope({
        scope: createTaskEventScope("project-a", "task-a"),
      }),
      buildExperienceEventEnvelope({
        scope: createWorkflowStepEventScope("project-a", "task-a", "step-a"),
      }),
      buildCostEventEnvelope({
        scope: createWorkbenchInstanceEventScope("project-a", "workbench-a"),
      }),
    ]

    const scopeKinds = envelopes.map((envelope) => resolveEventScopeKind(envelope.scope))

    expect(scopeKinds).toEqual(["project", "task", "workflow-step", "workbench-instance"])

    for (const envelope of envelopes) {
      const result = validateEventEnvelope(envelope)

      expect(result.ok).toBe(true)
    }
  })

  it("отклоняет envelope без обязательных полей", () => {
    const envelope: Record<string, unknown> = buildExperienceEventEnvelope()
    delete envelope.eventId
    delete envelope.occurredAt

    const result = validateEventEnvelope(envelope)

    expect(result.ok).toBe(false)

    if (!result.ok) {
      expect(result.issues.length).toBeGreaterThanOrEqual(2)
    }
  })

  it("отклоняет неполные и смешанные scope-комбинации MVP", () => {
    const invalidScopes = [
      {
        projectId: "project-a",
        taskId: "task-a",
        workbenchInstanceId: "workbench-a",
      },
      {
        projectId: "project-a",
        workflowStepId: "step-a",
      },
      {
        taskId: "task-a",
      },
      {},
    ]

    for (const scope of invalidScopes) {
      const result = validateEventEnvelope({
        ...buildActionEventEnvelope(),
        scope,
      })

      expect(result.ok).toBe(false)
    }
  })

  it("валидирует допустимые privacy/redaction значения и family-kind соответствие", () => {
    expect(
      assertEventEnvelope(
        buildCostEventEnvelope({
          privacyClass: "secret-adjacent",
          redactionState: "redacted",
        }),
      ),
    ).toMatchObject({
      privacyClass: "secret-adjacent",
      redactionState: "redacted",
    })

    const invalidPrivacy = validateEventEnvelope({
      ...buildCostEventEnvelope(),
      privacyClass: "public",
    })
    const invalidRedaction = validateEventEnvelope({
      ...buildCostEventEnvelope(),
      redactionState: "full",
    })
    const invalidFamilyBinding = validateEventEnvelope(
      buildExperienceEventEnvelope({
        kind: "action.hotkey-used",
      }),
    )

    expect(invalidPrivacy.ok).toBe(false)
    expect(invalidRedaction.ok).toBe(false)
    expect(invalidFamilyBinding.ok).toBe(false)
  })

  it("даёт reusable builders для experience, action и cost payload families", () => {
    const experience = buildExperienceEventEnvelope()
    const action = buildActionEventEnvelope()
    const cost = buildCostEventEnvelope()

    expect(experience.payload.family).toBe("experience")
    expect(action.payload.family).toBe("action")
    expect(cost.payload.family).toBe("cost")

    expect(validateEventEnvelope(experience).ok).toBe(true)
    expect(validateEventEnvelope(action).ok).toBe(true)
    expect(validateEventEnvelope(cost).ok).toBe(true)
  })
})
