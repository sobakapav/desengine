// @openSpec capability: level-labs
// @openSpec scenarios:
// @openSpec  - "Пользователь открывает рабочий файл задачи"
// @openSpec  - "Пользователь редактирует один файл и переключается на другой"
// @openSpec capability: testing-layer
// @openSpec scenarios:
// @openSpec  - "Тестовый файл покрывает OpenSpec-сценарий"
// @openSpec  - "Добавляется новый behavior-change"

import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import {
  buildLabTaskScreenEvent,
  changeLabTaskScreenEventInput,
  createLabTaskScreenEventInput,
  readLabTaskScreenEventActiveScreen,
} from "../../components/desengine/lab/LabScreen/screen-event"

function readProjectFile(...segments: string[]) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8")
}

describe("lab screen event propagation", () => {
  it("собирает screen-safe envelope для workflow-step scope", () => {
    const input = createLabTaskScreenEventInput("intro", "component")
    const event = buildLabTaskScreenEvent({
      input,
      levelNumber: 3,
      occurredAt: "2026-05-21T08:00:00.000Z",
    })

    expect(event).toEqual({
      eventId: "event:workflow-step:intro:level-lab:3:screen:component",
      kind: "experience.lab-task-screen.active-screen.changed",
      occurredAt: "2026-05-21T08:00:00.000Z",
      scope: {
        projectId: "task-intro",
        taskId: "intro",
        workflowStepId: "workflow-step:intro:level-lab:3",
      },
      privacyClass: "local",
      redactionState: "metadata-only",
      payload: {
        family: "experience",
        action: "lab-task-screen-active-screen-changed",
        activeScreen: "component",
      },
    })
  })

  it("обновляет activeScreen без второго ad-hoc shape", () => {
    const current = createLabTaskScreenEventInput("intro", "component")
    const nextInput = changeLabTaskScreenEventInput(current, "styles")
    const nextEvent = buildLabTaskScreenEvent({
      input: nextInput,
      levelNumber: 3,
      occurredAt: "2026-05-21T08:01:00.000Z",
    })

    expect(nextInput).toEqual({
      taskId: "intro",
      activeScreen: "styles",
    })
    expect(readLabTaskScreenEventActiveScreen(nextEvent)).toBe("styles")
    expect(nextEvent.scope).toEqual({
      projectId: "task-intro",
      taskId: "intro",
      workflowStepId: "workflow-step:intro:level-lab:3",
    })
    expect(nextEvent.eventId).toBe("event:workflow-step:intro:level-lab:3:screen:styles")
  })

  it("держит один и тот же contract по всей task-workbench цепочке", () => {
    const pageSource = readProjectFile("app", "lab", "[taskId]", "[screen]", "page.tsx")
    const labScreenSource = readProjectFile("components", "desengine", "lab", "LabScreen", "LabScreen.tsx")
    const screenSectionsSource = readProjectFile("components", "desengine", "lab", "LabScreen", "ScreenSections.tsx")
    const workbenchPropsSource = readProjectFile("components", "desengine", "lab", "Workbench", "props.ts")
    const workbenchContentSource = readProjectFile("components", "desengine", "lab", "Workbench", "WorkbenchContent.tsx")
    const codeSource = readProjectFile("components", "desengine", "lab", "Code", "Code.tsx")

    expect(pageSource).toContain("initTaskScreenEventInput={createLabTaskScreenEventInput(taskId, screen)}")
    expect(labScreenSource).toContain("buildLabTaskScreenEvent")
    expect(labScreenSource).toContain("screenEvent={taskScreenEvent}")
    expect(screenSectionsSource).toContain("screenEvent={screenEvent}")
    expect(workbenchPropsSource).toContain("screenEvent: LabTaskScreenEvent;")
    expect(workbenchPropsSource).toContain("onScreenEventChange: (next: LabTaskScreenEventInput) => void;")
    expect(workbenchContentSource).toContain("screenEvent={props.screenEvent}")
    expect(codeSource).toContain("readLabTaskScreenEventActiveScreen(screenEvent)")
    expect(codeSource).toContain("data-screen-event-id={screenEvent.eventId}")
  })
})
