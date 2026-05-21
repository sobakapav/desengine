// @openSpec capability: testing-layer
// @openSpec scenarios:
// @openSpec  - "Тестовый файл покрывает OpenSpec-сценарий"
// @openSpec  - "Добавляется новый behavior-change"
// @openSpec  - "Foundation event-линия использует общий reusable harness"
// @openSpec  - "Runtime-boundary событий проверяется без storage через foundation harness"
// @openSpec capability: event-envelope
// @openSpec scenarios:
// @openSpec  - "Experience payload использует общий envelope"
// @openSpec  - "Action payload использует общий envelope"
// @openSpec  - "Cost payload использует общий envelope"
// @openSpec capability: projects
// @openSpec scenarios:
// @openSpec  - "Runtime записывает product event через единую project boundary"

import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

function readProjectFile(...segments: string[]) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8")
}

describe("event envelope foundation harness", () => {
  it("держит один reusable surface для builders и contract helpers", () => {
    const source = readProjectFile("lib", "system", "events", "index.ts")

    expect(source).toContain("buildExperienceEventEnvelope")
    expect(source).toContain("buildActionEventEnvelope")
    expect(source).toContain("buildCostEventEnvelope")
    expect(source).toContain("assertEventEnvelope")
    expect(source).toContain("validateEventEnvelope")
    expect(source).toContain("createProjectEventScope")
    expect(source).toContain("createTaskEventScope")
    expect(source).toContain("createWorkflowStepEventScope")
    expect(source).toContain("createWorkbenchInstanceEventScope")
  })

  it("требует использовать foundation contract вместо локальных ad-hoc event shape", () => {
    const runtimeBoundaryTest = readProjectFile("test", "unit", "project-event-log-runtime-boundary.test.ts")
    const propagationTest = readProjectFile("test", "unit", "lab-screen-event-propagation.test.ts")
    const screenEventSource = readProjectFile(
      "components",
      "desengine",
      "lab",
      "LabScreen",
      "screen-event.ts",
    )

    expect(runtimeBoundaryTest).toContain('from "@/lib/system/events"')
    expect(runtimeBoundaryTest).not.toContain('from "@/lib/system/events/envelope"')

    expect(propagationTest).toContain('from "../../components/desengine/lab/LabScreen/screen-event"')
    expect(screenEventSource).toContain('type EventEnvelope')
    expect(screenEventSource).toContain("createWorkflowStepEventScope")
    expect(screenEventSource).toContain('family: "experience"')
    expect(screenEventSource).not.toContain('kind: "workflow-step"')
  })

  it("оставляет service-level log boundary проверяемой без storage и producer wiring", () => {
    const runtimeBoundaryTest = readProjectFile("test", "unit", "project-event-log-runtime-boundary.test.ts")
    const runtimeBoundarySource = readProjectFile("lib", "project", "event-log.ts")

    expect(runtimeBoundaryTest).toContain("default no-op sink")
    expect(runtimeBoundaryTest).toContain("recordEvent(envelope)")
    expect(runtimeBoundarySource).toContain("noopProjectEventLogSink")
    expect(runtimeBoundarySource).not.toContain("appendEvent")
  })
})
