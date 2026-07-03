"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import {
  applyProjectConfigDraft,
  buildProjectConfigDraft,
  validateProjectConfigDraft,
  type ProjectConfigDraft,
} from "@/lib/project/config-surface"
import { getProjectUrl } from "@/lib/project/navigation"
import { createBrowserProjectStorage } from "@/lib/project/storage"
import type { ProjectWorkspace } from "@/lib/project/runtime"

import {
  buildProjectConfigContractModel,
  listProjectUiKitOptions,
} from "./projectSurface"

async function persistProjectConfig(args: {
  draft: ProjectConfigDraft
  onProjectSaved: (project: ProjectWorkspace) => void
  project: ProjectWorkspace
  router: ReturnType<typeof useRouter>
}) {
  const nextProject = applyProjectConfigDraft(args.project, args.draft)
  const storage = createBrowserProjectStorage({ storage: window.localStorage })

  await storage.saveProject(nextProject, args.project.id)
  args.onProjectSaved(nextProject)
  if (nextProject.id !== args.project.id) {
    args.router.replace(getProjectUrl(nextProject.id))
  }

  return nextProject
}

function useProjectConfigController(args: {
  onProjectSaved: (project: ProjectWorkspace) => void
  project: ProjectWorkspace
}) {
  const router = useRouter()
  const [draft, setDraft] = useState<ProjectConfigDraft>(() => buildProjectConfigDraft(args.project))
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [message, setMessage] = useState("")
  useEffect(() => {
    setDraft(buildProjectConfigDraft(args.project))
    setSaveState("idle")
    setMessage("")
  }, [args.project.id, args.project.title, args.project.updatedAt, args.project.settings.uiKitId])
  const validatedDraft = validateProjectConfigDraft(draft)
  const draftProject = validatedDraft.ok ? applyProjectConfigDraft(args.project, validatedDraft.draft) : args.project
  async function handleSave() {
    if (!validatedDraft.ok) {
      setSaveState("error")
      setMessage(validatedDraft.message)
      return
    }
    setSaveState("saving")
    setMessage("")
    try {
      const nextProject = await persistProjectConfig({
        draft: validatedDraft.draft,
        onProjectSaved: args.onProjectSaved,
        project: args.project,
        router,
      })
      setDraft(buildProjectConfigDraft(nextProject))
      setSaveState("saved")
      setMessage("Конфигурация проекта сохранена в локальном реестре браузера.")
    } catch (error) {
      setSaveState("error")
      setMessage(error instanceof Error ? error.message : "Не удалось сохранить конфигурацию проекта.")
    }
  }
  function handleReset() {
    setDraft(buildProjectConfigDraft(args.project))
    setSaveState("idle")
    setMessage("")
  }
  function updateDraft(patch: Partial<ProjectConfigDraft>) {
    setDraft((currentDraft) => ({ ...currentDraft, ...patch }))
    setSaveState("idle")
    setMessage("")
  }
  return {
    contract: buildProjectConfigContractModel(draftProject), draft, draftProject, handleReset, handleSave,
    message, saveState, uiKitOptions: listProjectUiKitOptions(), updateDraft,
    validatedDraft, validationMessage: validatedDraft.ok ? "" : validatedDraft.message,
  }
}

export { useProjectConfigController }
