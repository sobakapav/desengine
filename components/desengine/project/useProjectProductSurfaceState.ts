"use client"

import { useEffect, useMemo, useState, type ChangeEvent } from "react"

import { buildProjectManifestFileName, serializeProjectManifest, type ProjectManifest } from "@/lib/project/manifest"
import { importProjectManifestOnServer, saveProjectOnServer, type ProjectSurfaceSummary } from "@/lib/project/client"
import { getProjectUrl } from "@/lib/project/navigation"
import type { ProjectHistoryDiagnosticsSnapshot } from "@/lib/project/history-diagnostics"
import type { ProjectWorkspace } from "@/lib/project/runtime"
import type { ProjectWorkflowReadoutSnapshot } from "@/lib/project/workflow-readout"
import type { ProjectSession } from "@/lib/project/workspace-session"
import type { ProjectComponent } from "@/lib/project/component-runtime"

import {
  buildProjectArtifactLibraryModel,
  buildProjectManifestDocument,
  buildProjectPromptBriefModel,
  buildProjectWorkflowTemplateModel,
  parseProjectManifestDocument,
  readProjectPromptBrief,
} from "./projectProductSurface"

type ProjectProductSurfacesPanelProps = {
  components: ProjectComponent[]
  historyDiagnostics: ProjectHistoryDiagnosticsSnapshot
  onProjectSaved: (
    project: ProjectWorkspace,
    options?: {
      rootPath?: string | null
      surface?: ProjectSurfaceSummary | null
    },
  ) => void
  project: ProjectWorkspace
  session: ProjectSession | null
  workflowReadout: ProjectWorkflowReadoutSnapshot
}

type ProjectProductSurfaceState = {
  artifactLibrary: ReturnType<typeof buildProjectArtifactLibraryModel>
  briefMessage: string
  handleBriefChange: (value: string) => void
  handleExportManifest: () => void
  handleImportManifest: (event: ChangeEvent<HTMLInputElement>) => void
  handleSaveBrief: () => Promise<void>
  manifest: ProjectManifest
  manifestJson: string
  manifestMessage: string
  promptBriefDraft: string
  promptBriefModel: ReturnType<typeof buildProjectPromptBriefModel>
  workflowTemplate: ReturnType<typeof buildProjectWorkflowTemplateModel>
}

function buildProjectWithPromptBrief(project: ProjectWorkspace, promptBrief: string) {
  return {
    ...project,
    settings: {
      ...project.settings,
      promptBrief: promptBrief.trim(),
    },
  } satisfies ProjectWorkspace
}

function downloadManifest(manifest: ProjectManifest) {
  const blob = new Blob([serializeProjectManifest(manifest)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = buildProjectManifestFileName(manifest.project)
  link.click()
  URL.revokeObjectURL(url)
}

async function persistPromptBrief(args: {
  onProjectSaved: (
    project: ProjectWorkspace,
    options?: {
      rootPath?: string | null
      surface?: ProjectSurfaceSummary | null
    },
  ) => void
  project: ProjectWorkspace
  promptBriefDraft: string
}) {
  const nextProject = buildProjectWithPromptBrief(args.project, args.promptBriefDraft)
  const response = await saveProjectOnServer({ project: nextProject })
  args.onProjectSaved(response.project, {
    rootPath: response.rootPath,
    surface: response.surface,
  })
}

async function importManifestFile(args: {
  event: ChangeEvent<HTMLInputElement>
  setManifestMessage: (value: string) => void
}) {
  const file = args.event.target.files?.[0]
  if (!file) {
    return
  }

  const parsedManifest = parseProjectManifestDocument(await file.text())
  if (!parsedManifest.ok) {
    args.setManifestMessage(parsedManifest.message)
    args.event.target.value = ""
    return
  }

  const imported = await importProjectManifestOnServer(parsedManifest.manifest)
  args.setManifestMessage(
    "Manifest импортирован в disk-backed registry проекта. Открываю проект через новый canonical contract.",
  )
  args.event.target.value = ""
  window.location.assign(getProjectUrl(imported.project.id))
}

function buildProjectProductSurfaceModels(args: ProjectProductSurfacesPanelProps, promptBriefDraft: string) {
  const workflowTemplate = buildProjectWorkflowTemplateModel({
    workflowReadout: args.workflowReadout,
    componentCount: args.components.length,
  })
  const artifactLibrary = buildProjectArtifactLibraryModel({
    components: args.components,
    historyDiagnostics: args.historyDiagnostics,
    promptBrief: promptBriefDraft,
    project: args.project,
    workflowReadout: args.workflowReadout,
  })
  const promptBriefModel = buildProjectPromptBriefModel({
    components: args.components,
    project: args.project,
    promptBrief: promptBriefDraft,
    workflowReadout: args.workflowReadout,
  })
  const manifest = buildProjectManifestDocument({
    components: args.components,
    historyDiagnostics: args.historyDiagnostics,
    project: args.project,
    promptBrief: promptBriefDraft,
    session: args.session,
    workflowReadout: args.workflowReadout,
  })

  return {
    artifactLibrary,
    manifest,
    manifestJson: serializeProjectManifest(manifest),
    promptBriefModel,
    workflowTemplate,
  }
}

function useProjectProductSurfaceState(args: ProjectProductSurfacesPanelProps): ProjectProductSurfaceState {
  const [promptBriefDraft, setPromptBriefDraft] = useState("")
  const [briefMessage, setBriefMessage] = useState("")
  const [manifestMessage, setManifestMessage] = useState("")
  const [hasUserEditedBrief, setHasUserEditedBrief] = useState(false)

  useEffect(() => {
    setPromptBriefDraft(readProjectPromptBrief({
      project: args.project,
      components: args.components,
      workflowReadout: args.workflowReadout,
    }))
    setBriefMessage("")
    setManifestMessage("")
    setHasUserEditedBrief(false)
  }, [args.components, args.project, args.workflowReadout])

  const models = useMemo(() => buildProjectProductSurfaceModels(args, promptBriefDraft), [args, promptBriefDraft])

  function handleBriefChange(value: string) {
    setPromptBriefDraft(value)
    setBriefMessage("")
    setHasUserEditedBrief(true)
  }

  function handleExportManifest() {
    downloadManifest(models.manifest)
    setManifestMessage("Manifest выгружен как project-owned контракт.")
  }

  async function handleSaveBrief() {
    await persistPromptBrief({
      onProjectSaved: args.onProjectSaved,
      project: args.project,
      promptBriefDraft,
    })
    setBriefMessage("Prompt brief сохранён в canonical project settings и войдёт в manifest.")
    setHasUserEditedBrief(false)
  }

  function handleImportManifest(event: ChangeEvent<HTMLInputElement>) {
    void importManifestFile({ event, setManifestMessage })
  }

  useEffect(() => {
    if (!hasUserEditedBrief) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      void handleSaveBrief().catch((error) => {
        setBriefMessage(error instanceof Error ? error.message : "Не удалось автоматически сохранить prompt brief.")
      })
    }, 500)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [args.onProjectSaved, args.project, hasUserEditedBrief, promptBriefDraft])

  return {
    artifactLibrary: models.artifactLibrary,
    briefMessage,
    handleBriefChange,
    handleExportManifest,
    handleImportManifest,
    handleSaveBrief,
    manifest: models.manifest,
    manifestJson: models.manifestJson,
    manifestMessage,
    promptBriefDraft,
    promptBriefModel: models.promptBriefModel,
    workflowTemplate: models.workflowTemplate,
  }
}

export {
  useProjectProductSurfaceState,
  type ProjectProductSurfaceState,
  type ProjectProductSurfacesPanelProps,
}
