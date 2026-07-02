// @openSpec capability: projects
// @openSpec scenarios:
// @openSpec  - "Пользователь открывает рабочую среду в активном проекте"
// @openSpec  - "Runtime записывает product event через единую project boundary"
// @openSpec capability: testing-layer
// @openSpec scenarios:
// @openSpec  - "Добавляется новый behavior-change"

import fs from "node:fs"
import path from "node:path"

import { describe, expect, it, vi } from "vitest"

import { recordEvent } from "@/lib/project/event-log"
import {
  buildExperienceEventEnvelope,
  createWorkflowStepEventScope,
  type EventEnvelope,
} from "@/lib/system/events"

function buildEventEnvelope(overrides: Partial<EventEnvelope> = {}): EventEnvelope {
  return buildExperienceEventEnvelope({
    eventId: "event-1",
    kind: "experience.prompt-used",
    occurredAt: "2026-05-21T10:00:00.000Z",
    scope: createWorkflowStepEventScope("project-1", "workflow-step-1"),
    privacyClass: "local",
    redactionState: "redacted",
    payload: {
      family: "experience",
      action: "prompt-used",
      summary: "Пользователь запустил prompt",
      promptId: "prompt-1",
    },
    ...overrides,
  })
}

function readProjectFile(...segments: string[]) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8")
}

describe("project event log runtime boundary", () => {
  it("передаёт валидный EventEnvelope в один sink adapter", async () => {
    const envelope = buildEventEnvelope()
    const sink = {
      recordEvent: vi.fn().mockResolvedValue(undefined),
    }

    await expect(recordEvent(envelope, { sink })).resolves.toBeUndefined()
    expect(sink.recordEvent).toHaveBeenCalledTimes(1)
    expect(sink.recordEvent).toHaveBeenCalledWith(envelope)
  })

  it("отклоняет невалидный envelope без fallback entrypoint", async () => {
    const envelope = buildEventEnvelope({
      scope: {
        workflowStepId: "workflow-step-1",
      } as EventEnvelope["scope"],
    })

    await expect(recordEvent(envelope)).rejects.toThrow("recordEvent принимает только валидный EventEnvelope.")
  })

  it("использует default no-op sink без storage и внешних зависимостей", async () => {
    await expect(recordEvent(buildEventEnvelope())).resolves.toBeUndefined()
  })

  it("source-contract оставляет ровно один публичный entrypoint записи события", () => {
    const source = readProjectFile("lib", "project", "event-log.ts")

    expect(source).toContain("export async function recordEvent")
    expect(source).toContain("noopProjectEventLogSink")
    expect(source).not.toContain("export function createProjectEvent")
    expect(source).not.toContain("export async function appendEvent")
  })
})
