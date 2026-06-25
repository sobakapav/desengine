import { appConfigSource } from "@/lib/system/config/app"
import type { Artifact } from "@/lib/task/model"

import type { WorkbenchDefinition, WorkbenchInstance, WorkbenchTool } from "./model"
import { createWorkbenchRegistry } from "./registry"
import { serializeWorkbenchInstance } from "./serialization"

export const LAB_WORKBENCH_DEFINITION_ID = "lab-component-workbench"
export const LAB_WORKBENCH_PROFILE_ID = "level-lab"

export const labWorkbenchTools: WorkbenchTool[] = [
  {
    id: "monaco-code-editor",
    title: "Редактор кода",
    appliesTo: ["level-lab"],
    stateVersion: "1",
    sourcing: {
      strategy: "adapt",
      primitive: "@monaco-editor/react + monaco-editor",
      ownerBoundary: "components/desengine/lab/Code",
      adapterPolicy: "Workbench хранит только file/artifact state, API Monaco остаётся внутри editor adapter.",
      fallbackStrategy: "Если Monaco не загружается, UI показывает локальный loading/fallback boundary без протечки editor API в task runtime.",
      testLevel: "component",
    },
  },
  {
    id: "sandpack-preview",
    title: "Preview результата",
    appliesTo: ["level-lab"],
    stateVersion: "1",
    sourcing: {
      strategy: "adapt",
      primitive: "@codesandbox/sandpack-react",
      ownerBoundary: "lib/lab/sandpack-preview и components/desengine/lab/InOut",
      adapterPolicy: "Workbench передаёт ProjectWorkspace и artifacts, Sandpack payload собирается за facade.",
      fallbackStrategy: "Если project/ui-kit несовместим или runtime ломается, preview возвращает безопасный fallback и host-диагностику.",
      testLevel: "unit",
    },
  },
  {
    id: "lab-prompt-composer",
    title: "Composer уточнений",
    appliesTo: ["level-lab"],
    stateVersion: "1",
    sourcing: {
      strategy: "build",
      primitive: "текущие lab controls без новой dependency",
      ownerBoundary: "components/desengine/lab/Workbench",
      adapterPolicy: "Prompt UI остаётся локальным control поверх task actions без стороннего runtime.",
      fallbackStrategy: "При изменении UX control остаётся локальным React-слоем и не требует fallback к внешней библиотеке.",
      testLevel: "unit",
    },
  },
  {
    id: "lab-command-controls",
    title: "Команды лаборатории",
    appliesTo: ["level-lab"],
    stateVersion: "1",
    sourcing: {
      strategy: "build",
      primitive: "текущие save/reset/check controls без новой dependency",
      ownerBoundary: "components/desengine/lab/Workbench",
      adapterPolicy: "Кнопки команд вызывают существующие task actions и не вводят отдельный tool runtime.",
      fallbackStrategy: "При деградации команды остаются обычными task actions без дополнительного vendor runtime.",
      testLevel: "unit",
    },
  },
]

export const labWorkbenchDefinition: WorkbenchDefinition = {
  id: LAB_WORKBENCH_DEFINITION_ID,
  title: "Рабочая поверхность компонента",
  profileId: LAB_WORKBENCH_PROFILE_ID,
  supportedTaskTypes: ["level-lab", "image-to-component-workflow"],
  supportedWorkflowStepKinds: ["level-lab", "image-to-component-workflow"],
  toolIds: labWorkbenchTools.map((tool) => tool.id),
  artifactSlots: [
    {
      id: "source",
      title: "Исходные изображения",
      acceptedArtifactKinds: ["source-image"],
      multiple: true,
    },
    {
      id: "code",
      title: "Рабочие файлы",
      acceptedArtifactKinds: ["code-file"],
      multiple: true,
    },
    {
      id: "prompt-history",
      title: "История уточнений",
      acceptedArtifactKinds: ["prompt-entry"],
      multiple: true,
    },
    {
      id: "check-result",
      title: "Результат проверки",
      acceptedArtifactKinds: ["check-result"],
    },
  ],
  stateVersion: "1",
}

export const labWorkbenchRegistry = createWorkbenchRegistry({
  definitions: [labWorkbenchDefinition],
  tools: labWorkbenchTools,
})

function buildArtifactBindings(artifacts: Artifact[]) {
  const bindings: Record<string, string> = {}

  for (const artifact of artifacts) {
    if (artifact.kind === "code-file") {
      const fileId = typeof artifact.data === "object" && artifact.data && "fileId" in artifact.data
        ? String(artifact.data.fileId)
        : artifact.id
      bindings[`code:${fileId}`] = artifact.id
      continue
    }

    bindings[`${artifact.kind}:${artifact.id}`] = artifact.id
  }

  return bindings
}

/**
 * Собирает сериализуемый WorkbenchInstance для текущей project-aware задачи и шага workflow.
 *
 * @example
 * ```ts
 * const instance = createLabWorkbenchInstance({
 *   projectId: "project-demo",
 *   taskId: "task-button",
 *   workflowStepId: "step-level-1",
 *   artifacts: [
 *     { id: "code-main", kind: "code-file", data: { fileId: "src/App.tsx" } },
 *     { id: "check-1", kind: "check-result", data: { status: "passed" } },
 *   ] as Artifact[],
 *   activeFileId: "src/App.tsx",
 * })
 *
 * instance.definitionId
 * //=> "lab-component-workbench"
 *
 * instance.artifactBindings["code:src/App.tsx"]
 * //=> "code-main"
 * ```
 */
export function createLabWorkbenchInstance(args: {
  projectId: string
  taskId: string
  workflowStepId: string
  artifacts: Artifact[]
  activeFileId?: string | null
}): WorkbenchInstance {
  return serializeWorkbenchInstance({
    id: `workbench:${args.taskId}`,
    definitionId: LAB_WORKBENCH_DEFINITION_ID,
    projectId: args.projectId,
    taskId: args.taskId,
    workflowStepId: args.workflowStepId,
    artifactBindings: buildArtifactBindings(args.artifacts),
    state: {
      version: labWorkbenchDefinition.stateVersion,
      value: {
        profileId: LAB_WORKBENCH_PROFILE_ID,
        activeFileId: args.activeFileId ?? null,
        configuredFileIds: appConfigSource.taskWorkbenchFiles.map((file) => file.id),
      },
    },
    toolStates: Object.fromEntries(
      labWorkbenchTools.map((tool) => [
        tool.id,
        {
          toolId: tool.id,
          version: tool.stateVersion,
          value: {},
        },
      ]),
    ),
  })
}
