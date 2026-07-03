import {
  normalizeProjectComponent,
  type ProjectComponent,
} from "@/lib/project/component-runtime"
import {
  normalizeProjectSession,
  normalizeProjectWorkspaceActivity,
  type ProjectSession,
  type ProjectWorkspaceActivity,
} from "@/lib/project/workspace-session"
import {
  normalizeProject,
  serializeProjectWorkspace,
  type ProjectWorkspace,
  type RawProject,
} from "@/lib/project/runtime"

type ProjectManifestVersion = "1"
type ProjectManifestKind = "desengine-project-manifest"

type ProjectManifestWorkflowTemplate = {
  id: string
  title: string
  summary: string
}

type ProjectManifestWorkflow = {
  templateId: string
  promptBrief: string
}

type ProjectManifestArtifactSummary = {
  componentCount: number
  completedComponentCount: number
  eventCount: number
  activityCount: number
  lastActivityAt: string | null
}

type ProjectManifest = {
  kind: ProjectManifestKind
  version: ProjectManifestVersion
  exportedAt: string
  project: ProjectWorkspace
  components: ProjectComponent[]
  workflow: ProjectManifestWorkflow
  workflowTemplate: ProjectManifestWorkflowTemplate
  artifactSummary: ProjectManifestArtifactSummary
  artifactsSummary: ProjectManifestArtifactSummary
  promptBrief: string
}

type RawProjectManifest = {
  kind?: string | null
  version?: string | null
  exportedAt?: string | null
  project?: RawProject | null
  components?: ProjectComponent[] | null
  workflow?: Partial<ProjectManifestWorkflow> | null
  workflowTemplate?: Partial<ProjectManifestWorkflowTemplate> | null
  artifactsSummary?: Partial<ProjectManifestArtifactSummary> | null
  artifactSummary?: Partial<ProjectManifestArtifactSummary> | null
  promptBrief?: string | null
} | null | undefined

function normalizeManifestTimestamp(value: string | null | undefined, fallback = new Date().toISOString()) {
  if (typeof value !== "string" || !value.trim()) {
    return fallback
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return fallback
  }

  return date.toISOString()
}

function normalizePromptBrief(value: string | null | undefined) {
  return typeof value === "string" ? value.trim() : ""
}

function resolveProjectWorkflowTemplate(project: ProjectWorkspace): ProjectManifestWorkflowTemplate {
  return {
    id: project.settings.workflowTemplateId,
    title: "Project design workflow",
    summary: "Проект проходит через сбор состава, запуск линий работы по компонентам и согласование результата.",
  }
}

function normalizeProjectManifestWorkflowTemplate(
  rawTemplate: Partial<ProjectManifestWorkflowTemplate> | null | undefined,
  project: ProjectWorkspace,
) {
  const fallback = resolveProjectWorkflowTemplate(project)

  return {
    id: typeof rawTemplate?.id === "string" && rawTemplate.id.trim() ? rawTemplate.id.trim() : fallback.id,
    title: typeof rawTemplate?.title === "string" && rawTemplate.title.trim() ? rawTemplate.title.trim() : fallback.title,
    summary: typeof rawTemplate?.summary === "string" && rawTemplate.summary.trim()
      ? rawTemplate.summary.trim()
      : fallback.summary,
  } satisfies ProjectManifestWorkflowTemplate
}

function buildProjectArtifactSummary(args: {
  activities: ProjectWorkspaceActivity[]
  components: ProjectComponent[]
  session: ProjectSession | null
}): ProjectManifestArtifactSummary {
  const lastActivityAt = [
    args.session?.lastActivityAt ?? null,
    ...args.activities.map((activity) => activity.createdAt),
    ...args.components.map((component) => component.updatedAt),
  ]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .sort((left, right) => right.localeCompare(left))[0] ?? null

  return {
    componentCount: args.components.length,
    completedComponentCount: args.components.filter((component) => component.status === "completed").length,
    eventCount: args.activities.length,
    activityCount: args.activities.length,
    lastActivityAt,
  }
}

function exportProjectManifest(args: {
  activities?: ProjectWorkspaceActivity[] | null
  components?: ProjectComponent[] | null
  project: ProjectWorkspace
  session?: ProjectSession | null
}): ProjectManifest {
  const project = serializeProjectWorkspace(normalizeProject(args.project))
  const components = Array.isArray(args.components)
    ? args.components.map((component) => normalizeProjectComponent({
      ...component,
      projectId: project.id,
    }))
    : []
  const session = args.session
    ? normalizeProjectSession({
      ...args.session,
      projectId: project.id,
    }, project.id)
    : null
  const activities = Array.isArray(args.activities)
    ? args.activities
      .map((activity) => normalizeProjectWorkspaceActivity(activity, project.id))
      .filter((activity): activity is ProjectWorkspaceActivity => activity !== null)
    : []

  const promptBrief = normalizePromptBrief(project.settings.promptBrief)
  const artifactSummary = buildProjectArtifactSummary({
    activities,
    components,
    session,
  })

  return {
    kind: "desengine-project-manifest",
    version: "1",
    exportedAt: new Date().toISOString(),
    project,
    components,
    workflow: {
      templateId: project.settings.workflowTemplateId,
      promptBrief,
    },
    workflowTemplate: resolveProjectWorkflowTemplate(project),
    artifactSummary,
    artifactsSummary: artifactSummary,
    promptBrief,
  }
}

function importProjectManifest(rawManifest: RawProjectManifest): ProjectManifest {
  const project = serializeProjectWorkspace(normalizeProject({
    ...rawManifest?.project,
    promptBrief: rawManifest?.promptBrief ?? rawManifest?.workflow?.promptBrief,
    settings: {
      ...(rawManifest?.project?.settings ?? null),
      promptBrief: rawManifest?.promptBrief ?? rawManifest?.workflow?.promptBrief,
    },
  }))
  const components = Array.isArray(rawManifest?.components)
    ? rawManifest.components.map((component) => normalizeProjectComponent({
      ...component,
      projectId: project.id,
    }))
    : []
  const workflowTemplate = normalizeProjectManifestWorkflowTemplate({
    id: rawManifest?.workflowTemplate?.id ?? rawManifest?.workflow?.templateId,
    title: rawManifest?.workflowTemplate?.title,
    summary: rawManifest?.workflowTemplate?.summary,
  }, project)
  const promptBrief = normalizePromptBrief(
    rawManifest?.promptBrief
      ?? rawManifest?.workflow?.promptBrief
      ?? project.settings.promptBrief,
  )
  const hydratedProject = serializeProjectWorkspace({
    ...project,
    settings: {
      ...project.settings,
      promptBrief,
      workflowTemplateId: project.settings.workflowTemplateId,
    },
  })

  const artifactSummary = {
    componentCount: components.length,
    completedComponentCount: components.filter((component) => component.status === "completed").length,
    eventCount: 0,
    activityCount: 0,
    lastActivityAt: components.map((component) => component.updatedAt).sort((left, right) => right.localeCompare(left))[0] ?? null,
    ...rawManifest?.artifactSummary,
    ...rawManifest?.artifactsSummary,
  } satisfies ProjectManifestArtifactSummary

  const workflow = {
    templateId: workflowTemplate.id,
    promptBrief,
  } satisfies ProjectManifestWorkflow

  return {
    kind: rawManifest?.kind === "desengine-project-manifest" ? rawManifest.kind : "desengine-project-manifest",
    version: rawManifest?.version === "1" ? "1" : "1",
    exportedAt: normalizeManifestTimestamp(rawManifest?.exportedAt),
    project: hydratedProject,
    components,
    workflow,
    workflowTemplate,
    artifactSummary,
    artifactsSummary: artifactSummary,
    promptBrief,
  }
}

function serializeProjectManifest(manifest: RawProjectManifest) {
  return JSON.stringify(importProjectManifest(manifest), null, 2)
}

function parseProjectManifest(serializedManifest: string) {
  return importProjectManifest(JSON.parse(serializedManifest) as RawProjectManifest)
}

function buildProjectManifestFileName(project: Pick<ProjectWorkspace, "id">) {
  return `${project.id}-manifest.json`
}

export {
  buildProjectArtifactSummary,
  buildProjectManifestFileName,
  exportProjectManifest,
  importProjectManifest,
  parseProjectManifest,
  resolveProjectWorkflowTemplate,
  serializeProjectManifest,
}

export type {
  ProjectManifest,
  ProjectManifestArtifactSummary,
  ProjectManifestKind,
  ProjectManifestVersion,
  ProjectManifestWorkflow,
  ProjectManifestWorkflowTemplate,
  RawProjectManifest,
}
