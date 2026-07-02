import { projectUiKitsConfig } from "@/lib/project/ui-kit-config"
import type { ProjectComponent } from "@/lib/project/component-runtime"
import type { ProjectHistoryDiagnosticsSnapshot } from "@/lib/project/history-diagnostics"
import {
  exportProjectManifest,
  parseProjectManifest,
  type ProjectManifest,
} from "@/lib/project/manifest"
import type { ProjectWorkspace } from "@/lib/project/runtime"
import type { ProjectSession } from "@/lib/project/workspace-session"
import type { ProjectWorkflowReadoutSnapshot } from "@/lib/project/workflow-readout"

const PROJECT_MANIFEST_VERSION = "1"

type ProjectWorkflowTemplateModel = {
  templateId: string
  title: string
  summary: string
  currentStageTitle: string
  lastActivityLabel: string
  steps: Array<{
    id: string
    title: string
    description: string
    statusLabel: string
  }>
}

type ProjectArtifactLibraryModel = {
  summaryLabel: string
  items: Array<{
    id: string
    kindLabel: string
    title: string
    summary: string
    statusLabel: string
  }>
}

type ProjectPromptBriefModel = {
  text: string
  sourceLabels: string[]
}

type ProjectManifestDocument = ProjectManifest

function resolveWorkflowStageStatusLabel(
  status: ProjectWorkflowReadoutSnapshot["stages"][number]["status"],
) {
  switch (status) {
    case "completed":
      return "Шаг recipe уже собран"
    case "in_progress":
      return "Шаг recipe активен сейчас"
    default:
      return "Шаг recipe ждёт своего хода"
  }
}

function buildDefaultProjectPromptBrief(args: {
  project: ProjectWorkspace
  components: ProjectComponent[]
  workflowReadout: ProjectWorkflowReadoutSnapshot
}) {
  const uiKitTitle = projectUiKitsConfig[args.project.settings.uiKitId].title
  const activeEntry = args.workflowReadout.entries.find((entry) => entry.isFocused) ?? null
  const completedComponents = args.components.filter((component) => component.status === "completed")

  return [
    `Собрать проект «${args.project.title}» как согласованную систему на ${uiKitTitle}.`,
    activeEntry
      ? `Сейчас главный фокус: компонент «${activeEntry.componentTitle}».`
      : "Сейчас нужен явный фокус проекта, чтобы workflow не распадался на разрозненные шаги.",
    `Текущий recipe-этап: ${args.workflowReadout.currentStageTitle}.`,
    completedComponents.length > 0
      ? `Уже готовы ${completedComponents.length} компонент(а/ов), их нужно удержать в общей логике проекта.`
      : "Готовых компонентов пока нет, поэтому важно быстро довести первый рабочий артефакт до целостного состояния.",
  ].join("\n")
}

function readProjectPromptBrief(
  args: {
    project: ProjectWorkspace
    components: ProjectComponent[]
    workflowReadout: ProjectWorkflowReadoutSnapshot
  },
) {
  return args.project.settings.promptBrief.trim() || buildDefaultProjectPromptBrief(args)
}

function buildProjectWorkflowTemplateModel(args: {
  workflowReadout: ProjectWorkflowReadoutSnapshot
  componentCount: number
}) {
  return {
    templateId: "project-design-workflow",
    title: "Project design workflow",
    summary: args.componentCount > 0
      ? "Этот template работает как повторяемый recipe: собрать проект, выбрать фокус, довести компонент и вернуть его в общую систему."
      : "Template уже готов, даже если проект ещё пуст: он задаёт порядок, в котором пользователь переводит идею в наблюдаемую проектную систему.",
    currentStageTitle: args.workflowReadout.currentStageTitle,
    lastActivityLabel: args.workflowReadout.lastActivityLabel,
    steps: args.workflowReadout.stages.map((stage) => ({
      id: stage.id,
      title: stage.title,
      description: stage.description,
      statusLabel: resolveWorkflowStageStatusLabel(stage.status),
    })),
  } satisfies ProjectWorkflowTemplateModel
}

function buildProjectArtifactLibraryModel(args: {
  components: ProjectComponent[]
  historyDiagnostics: ProjectHistoryDiagnosticsSnapshot
  promptBrief: string
  project: ProjectWorkspace
  workflowReadout: ProjectWorkflowReadoutSnapshot
}) {
  const items: ProjectArtifactLibraryModel["items"] = [
    {
      id: `${args.project.id}:brief`,
      kindLabel: "Prompt brief",
      title: "Рабочий бриф проекта",
      summary: args.promptBrief.split("\n")[0] ?? "Бриф ещё не сформулирован.",
      statusLabel: args.promptBrief.trim().length > 0 ? "Готов к включению в manifest" : "Нужна формулировка",
    },
    {
      id: `${args.project.id}:workflow-template`,
      kindLabel: "Workflow recipe",
      title: "Project design workflow",
      summary: args.workflowReadout.currentStageTitle,
      statusLabel: `Шагов в recipe: ${args.workflowReadout.stages.length}`,
    },
    {
      id: `${args.project.id}:history-trace`,
      kindLabel: "History trace",
      title: "След проектной работы",
      summary: args.historyDiagnostics.summary.lastActivityAt
        ? `Последняя активность: ${args.workflowReadout.lastActivityLabel}`
        : "История ещё не проявлена.",
      statusLabel: `Событий: ${args.historyDiagnostics.summary.eventCount}`,
    },
  ]

  for (const component of args.components) {
    items.push({
      id: component.id,
      kindLabel: "Component artifact",
      title: component.title,
      summary: component.status === "completed"
        ? "Компонент уже собран и может служить повторно используемым материалом проекта."
        : "Компонент остаётся рабочим материалом текущей проектной волны.",
      statusLabel: component.status === "completed" ? "Готовый артефакт" : "Артефакт в работе",
    })
  }

  return {
    summaryLabel: `Всего наблюдаемых материалов: ${items.length}`,
    items,
  } satisfies ProjectArtifactLibraryModel
}

function buildProjectPromptBriefModel(args: {
  components: ProjectComponent[]
  project: ProjectWorkspace
  promptBrief: string
  workflowReadout: ProjectWorkflowReadoutSnapshot
}) {
  const activeEntry = args.workflowReadout.entries.find((entry) => entry.isFocused) ?? null

  return {
    text: args.promptBrief,
    sourceLabels: [
      `Проект: ${args.project.title}`,
      `UI kit: ${projectUiKitsConfig[args.project.settings.uiKitId].title}`,
      activeEntry ? `Текущий фокус: ${activeEntry.componentTitle}` : "Фокус проекта ещё не выбран",
      `Компонентов в проекте: ${args.components.length}`,
    ],
  } satisfies ProjectPromptBriefModel
}

function buildManifestActivities(args: {
  historyDiagnostics: ProjectHistoryDiagnosticsSnapshot
  projectId: string
}) {
  return args.historyDiagnostics.events.map((event) => ({
    id: event.id,
    projectId: args.projectId,
    kind: event.kind,
    createdAt: event.createdAt,
    componentId: null,
    componentTitle: event.componentTitle,
    message: event.message,
  }))
}

function buildProjectManifestDocument(args: {
  components: ProjectComponent[]
  historyDiagnostics: ProjectHistoryDiagnosticsSnapshot
  project: ProjectWorkspace
  promptBrief: string
  session: ProjectSession | null
  workflowReadout: ProjectWorkflowReadoutSnapshot
}) {
  return exportProjectManifest({
    activities: buildManifestActivities({
      historyDiagnostics: args.historyDiagnostics,
      projectId: args.project.id,
    }),
    components: args.components,
    project: {
      ...args.project,
      settings: {
        ...args.project.settings,
        promptBrief: args.promptBrief,
      },
    },
    session: args.session,
  })
}

function parseProjectManifestDocument(rawManifest: string) {
  try {
    const manifest = parseProjectManifest(rawManifest)
    if (!manifest.project?.id || !manifest.project?.title || !manifest.project.settings.uiKitId) {
      return { ok: false, message: "Manifest не содержит обязательный блок project." } as const
    }

    return {
      ok: true,
      manifest,
    } as const
  } catch {
    return { ok: false, message: "Не удалось прочитать manifest JSON." } as const
  }
}

export {
  PROJECT_MANIFEST_VERSION,
  buildDefaultProjectPromptBrief,
  buildProjectArtifactLibraryModel,
  buildProjectManifestDocument,
  buildProjectPromptBriefModel,
  buildProjectWorkflowTemplateModel,
  parseProjectManifestDocument,
  readProjectPromptBrief,
}

export type {
  ProjectArtifactLibraryModel,
  ProjectManifestDocument,
  ProjectPromptBriefModel,
  ProjectWorkflowTemplateModel,
}
