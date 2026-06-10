// @openSpec capability: workbench
// @openSpec scenarios:
// @openSpec  - "Lab workbench регистрируется как definition"
// @openSpec  - "WorkbenchInstance связан с project/task/workflow step"
// @openSpec  - "Runtime surface показывает definition и рабочую связку"
// @openSpec  - "Workbench state сериализуется"
// @openSpec capability: component-sourcing
// @openSpec scenarios:
// @openSpec  - "Команда добавляет новый Workbench tool"
// @openSpec  - "Готовая библиотека не должна протекать в домен"
// @openSpec capability: workbench-tools
// @openSpec scenarios:
// @openSpec  - "Добавляется новый локальный tool"
// @openSpec  - "Workbench tool фиксирует sourcing decision"
// @openSpec  - "Tool state сериализуется отдельно от component runtime"
// @openSpec capability: level-labs
// @openSpec scenarios:
// @openSpec  - "Lab workbench использует platform registry"
// @openSpec capability: workflow
// @openSpec scenarios:
// @openSpec  - "Workflow step хранит project-aware runtime bindings без жёсткого 1:1 с Workbench"
// @openSpec  - "Runtime surface может показать текущий workflow step через Workbench"

import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import type { Artifact } from "../../lib/task/model"
import {
  LAB_WORKBENCH_DEFINITION_ID,
  LAB_WORKBENCH_PROFILE_ID,
  createLabWorkbenchInstance,
  createWorkbenchRegistry,
  deserializeWorkbenchInstance,
  labWorkbenchDefinition,
  labWorkbenchRegistry,
  labWorkbenchTools,
  serializeWorkbenchInstance,
  stringifyWorkbenchInstance,
} from "../../lib/workbench"

function readProjectFile(...segments: string[]) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8")
}

const artifacts: Artifact[] = [
  {
    id: "artifact:intro:file:component",
    projectId: "project-42",
    taskId: "intro",
    kind: "code-file",
    uri: "task-file://intro/Component.tsx",
    data: {
      fileId: "component",
      fileName: "Component.tsx",
      content: "export default function Component() { return null }",
    },
    createdAt: "2026-05-20T10:00:00.000Z",
  },
  {
    id: "artifact:intro:image:base",
    projectId: "project-42",
    taskId: "intro",
    kind: "source-image",
    uri: "/image.png",
    createdAt: "2026-05-20T10:00:00.000Z",
  },
]

describe("workbench platform registry", () => {
  it("регистрирует текущий lab workbench как definition/profile с tool registry", () => {
    expect(labWorkbenchDefinition).toMatchObject({
      id: LAB_WORKBENCH_DEFINITION_ID,
      title: "Рабочая поверхность компонента",
      profileId: LAB_WORKBENCH_PROFILE_ID,
      supportedTaskTypes: ["level-lab"],
      supportedWorkflowStepKinds: ["level-lab"],
      stateVersion: "1",
    })
    expect(labWorkbenchDefinition.toolIds).toEqual(labWorkbenchTools.map((tool) => tool.id))
    expect(labWorkbenchRegistry.definitions).toHaveLength(1)
    expect(labWorkbenchRegistry.tools.map((tool) => tool.id)).toEqual([
      "monaco-code-editor",
      "sandpack-preview",
      "lab-prompt-composer",
      "lab-command-controls",
    ])
  })

  it("валидирует registry: уникальные ids, ссылки definition на tools и applicability", () => {
    expect(() => createWorkbenchRegistry({
      definitions: [labWorkbenchDefinition],
      tools: [labWorkbenchTools[0], labWorkbenchTools[0]],
    })).toThrow("повторяющийся id")

    expect(() => createWorkbenchRegistry({
      definitions: [{ ...labWorkbenchDefinition, toolIds: ["unknown-tool"] }],
      tools: labWorkbenchTools,
    })).toThrow("неизвестный tool")

    expect(() => createWorkbenchRegistry({
      definitions: [labWorkbenchDefinition],
      tools: [{ ...labWorkbenchTools[0], appliesTo: ["other-task"] }, ...labWorkbenchTools.slice(1)],
    })).toThrow("не применим")

    expect(() => createWorkbenchRegistry({
      definitions: [labWorkbenchDefinition],
      tools: [{
        ...labWorkbenchTools[0],
        sourcing: {
          ...labWorkbenchTools[0].sourcing,
          adapterPolicy: "",
        },
      }, ...labWorkbenchTools.slice(1)],
    })).toThrow("sourcing decision неполный")

    expect(() => createWorkbenchRegistry({
      definitions: [labWorkbenchDefinition],
      tools: [{
        ...labWorkbenchTools[0],
        sourcing: {
          ...labWorkbenchTools[0].sourcing,
          fallbackStrategy: "",
        },
      }, ...labWorkbenchTools.slice(1)],
    })).toThrow("sourcing decision неполный")

    expect(() => createWorkbenchRegistry({
      definitions: [labWorkbenchDefinition],
      tools: [{
        ...labWorkbenchTools[0],
        sourcing: {
          ...labWorkbenchTools[0].sourcing,
          testLevel: "browser" as never,
        },
      }, ...labWorkbenchTools.slice(1)],
    })).toThrow("неизвестный testLevel")
  })

  it("фиксирует sourcing decisions для Sandpack/Monaco через adapt и lab controls без новой dependency", () => {
    const toolById = new Map(labWorkbenchTools.map((tool) => [tool.id, tool] as const))

    expect(toolById.get("sandpack-preview")?.sourcing).toMatchObject({
      strategy: "adapt",
      primitive: "@codesandbox/sandpack-react",
    })
    expect(toolById.get("monaco-code-editor")?.sourcing).toMatchObject({
      strategy: "adapt",
      primitive: "@monaco-editor/react + monaco-editor",
    })
    expect(toolById.get("sandpack-preview")?.sourcing.fallbackStrategy).toContain("безопасный fallback")
    expect(toolById.get("monaco-code-editor")?.sourcing.fallbackStrategy).toContain("fallback boundary")
    expect(toolById.get("lab-prompt-composer")?.sourcing.primitive).toContain("без новой dependency")
    expect(toolById.get("lab-command-controls")?.sourcing.primitive).toContain("без новой dependency")
  })

  it("создаёт WorkbenchInstance с project/task/workflow/artifact bindings", () => {
    const instance = createLabWorkbenchInstance({
      projectId: "project-42",
      taskId: "intro",
      workflowStepId: "workflow-step:intro:level-lab:1",
      artifacts,
      activeFileId: "component",
    })

    expect(instance).toMatchObject({
      id: "workbench:intro",
      definitionId: LAB_WORKBENCH_DEFINITION_ID,
      projectId: "project-42",
      taskId: "intro",
      workflowStepId: "workflow-step:intro:level-lab:1",
      artifactBindings: {
        "code:component": "artifact:intro:file:component",
        "source-image:artifact:intro:image:base": "artifact:intro:image:base",
      },
      state: {
        version: "1",
        value: {
          profileId: LAB_WORKBENCH_PROFILE_ID,
          activeFileId: "component",
        },
      },
    })
    expect(Object.keys(instance.toolStates)).toEqual(labWorkbenchTools.map((tool) => tool.id))
  })

  it("сериализует WorkbenchInstance и отклоняет несериализуемый state", () => {
    const instance = createLabWorkbenchInstance({
      projectId: "project-42",
      taskId: "intro",
      workflowStepId: "workflow-step:intro:level-lab:1",
      artifacts,
    })
    const serialized = stringifyWorkbenchInstance(instance)

    expect(deserializeWorkbenchInstance(serialized)).toEqual(instance)
    expect(() => serializeWorkbenchInstance({
      ...instance,
      state: {
        version: "1",
        value: {
          broken: () => null,
        } as never,
      },
    })).toThrow("сериализуемым JSON-значением")
  })

  it("source-contract держит lab Workbench за registry boundary и отдаёт instance в PromptContext", () => {
    const workbenchIndex = readProjectFile("lib", "workbench", "index.ts")
    const labProfile = readProjectFile("lib", "workbench", "lab-profile.ts")
    const promptRuntime = readProjectFile("lib", "task", "prompt-context.ts")
    const workbenchSurface = readProjectFile("components", "desengine", "lab", "Workbench", "workbenchSurface.ts")
    const workbenchSurfaceSummary = readProjectFile("components", "desengine", "lab", "Workbench", "WorkbenchSurfaceSummary.tsx")

    expect(workbenchIndex).toContain("labWorkbenchRegistry")
    expect(labProfile).toContain("LAB_WORKBENCH_DEFINITION_ID")
    expect(labProfile).toContain('title: "Рабочая поверхность компонента"')
    expect(labProfile).toContain("sandpack-preview")
    expect(labProfile).toContain("monaco-code-editor")
    expect(labProfile).not.toContain("PromptContext")
    expect(promptRuntime).toContain("WorkbenchInstance")
    expect(promptRuntime).toContain("workbenchInstances.find")
    expect(workbenchSurface).toContain("buildTaskWorkflowArtifactProjection")
    expect(workbenchSurface).toContain("getWorkbenchDefinition")
    expect(workbenchSurface).toContain("labWorkbenchRegistry")
    expect(workbenchSurfaceSummary).toContain("project -&gt; task -&gt; workflow step -&gt; workbench")
    expect(workbenchSurfaceSummary).toContain("Workbench")
  })
})
