"use client"

import { useEffect, useMemo, useState, type ChangeEvent } from "react"

import { buildProjectManifestFileName, serializeProjectManifest, type ProjectManifest } from "@/lib/project/manifest"
import { getProjectUrl } from "@/lib/project/navigation"
import type { ProjectHistoryDiagnosticsSnapshot } from "@/lib/project/history-diagnostics"
import type { ProjectWorkspace } from "@/lib/project/runtime"
import { createBrowserProjectStorage } from "@/lib/project/storage"
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
  onProjectSaved: (project: ProjectWorkspace) => void
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
  onProjectSaved: (project: ProjectWorkspace) => void
  project: ProjectWorkspace
  promptBriefDraft: string
}) {
  const storage = createBrowserProjectStorage({ storage: window.localStorage })
  const nextProject = buildProjectWithPromptBrief(args.project, args.promptBriefDraft)
  await storage.saveProject(nextProject)
  args.onProjectSaved(nextProject)
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

  const storage = createBrowserProjectStorage({ storage: window.localStorage })
  const imported = await storage.importProjectManifest(parsedManifest.manifest)
  args.setManifestMessage(
    "Manifest импортирован в локальный реестр проекта. Открываю проект через новый canonical contract.",
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

  useEffect(() => {
    setPromptBriefDraft(readProjectPromptBrief({
      project: args.project,
      components: args.components,
      workflowReadout: args.workflowReadout,
    }))
    setBriefMessage("")
    setManifestMessage("")
  }, [args.components, args.project, args.workflowReadout])

  const models = useMemo(() => buildProjectProductSurfaceModels(args, promptBriefDraft), [args, promptBriefDraft])

  function handleBriefChange(value: string) {
    setPromptBriefDraft(value)
    setBriefMessage("")
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
  }

  function handleImportManifest(event: ChangeEvent<HTMLInputElement>) {
    void importManifestFile({ event, setManifestMessage })
  }

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
