"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import {
  applyProjectConfigDraft,
  buildProjectConfigDraft,
  validateProjectConfigDraft,
  type ProjectConfigDraft,
} from "@/lib/project/config-surface"
import { saveProjectOnServer, type ProjectSurfaceSummary } from "@/lib/project/client"
import { getProjectUrl } from "@/lib/project/navigation"
import type { ProjectWorkspace } from "@/lib/project/runtime"

import {
  buildProjectConfigContractModel,
  listProjectUiKitOptions,
} from "./projectSurface"

async function persistProjectConfig(args: {
  draft: ProjectConfigDraft & { code: string }
  onProjectSaved: (
    project: ProjectWorkspace,
    options?: {
      rootPath?: string | null
      surface?: ProjectSurfaceSummary | null
    },
  ) => void
  project: ProjectWorkspace
  router: ReturnType<typeof useRouter>
}) {
  const nextProject = applyProjectConfigDraft(args.project, args.draft)
  const response = await saveProjectOnServer({
    metadata: {
      code: args.draft.code,
    },
    project: nextProject,
    previousProjectId: args.project.id,
  })
  args.onProjectSaved(response.project, {
    rootPath: response.rootPath,
    surface: response.surface,
  })
  if (nextProject.id !== args.project.id) {
    args.router.replace(getProjectUrl(nextProject.id))
  }

  return response.project
}

function useProjectConfigController(args: {
  onProjectSaved: (
    project: ProjectWorkspace,
    options?: {
      rootPath?: string | null
      surface?: ProjectSurfaceSummary | null
    },
  ) => void
  project: ProjectWorkspace
  projectSurface: ProjectSurfaceSummary | null
}) {
  const router = useRouter()
  const [draft, setDraft] = useState<ProjectConfigDraft & { code: string }>(() => ({
    ...buildProjectConfigDraft(args.project),
    code: args.projectSurface?.metadata.code ?? args.project.metadata.code ?? args.project.id,
  }))
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [message, setMessage] = useState("")
  useEffect(() => {
    setDraft({
      ...buildProjectConfigDraft(args.project),
      code: args.projectSurface?.metadata.code ?? args.project.metadata.code ?? args.project.id,
    })
    setSaveState("idle")
    setMessage("")
  }, [args.project.id, args.project.metadata.code, args.project.title, args.project.updatedAt, args.project.settings.uiKitId, args.projectSurface?.metadata.code])
  const validatedBaseDraft = validateProjectConfigDraft(draft)
  const validatedDraft = !draft.code.trim()
    ? { ok: false as const, message: "Код проекта не должен быть пустым." }
    : validatedBaseDraft.ok
      ? {
        ok: true as const,
        draft: {
          ...validatedBaseDraft.draft,
          code: draft.code.trim(),
        },
      }
      : validatedBaseDraft
  const draftProject = validatedDraft.ok ? applyProjectConfigDraft(args.project, validatedDraft.draft) : args.project

  useEffect(() => {
    if (!validatedDraft.ok) {
      return
    }

    const currentDraft = {
      ...buildProjectConfigDraft(args.project),
      code: args.projectSurface?.metadata.code ?? args.project.metadata.code ?? args.project.id,
    }
    const hasChanges = JSON.stringify(currentDraft) !== JSON.stringify(validatedDraft.draft)
    if (!hasChanges) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setSaveState("saving")
      setMessage("")
      void persistProjectConfig({
        draft: validatedDraft.draft,
        onProjectSaved: args.onProjectSaved,
        project: args.project,
        router,
      })
        .then((nextProject) => {
          setDraft({
            ...buildProjectConfigDraft(nextProject),
            code: validatedDraft.draft.code,
          })
          setSaveState("saved")
          setMessage("Конфигурация проекта автоматически сохранена на диск.")
        })
        .catch((error) => {
          setSaveState("error")
          setMessage(error instanceof Error ? error.message : "Не удалось автоматически сохранить конфигурацию проекта.")
        })
    }, 500)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [args.onProjectSaved, args.project, draft, router, validatedDraft])

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
      setDraft({
        ...buildProjectConfigDraft(nextProject),
        code: validatedDraft.draft.code,
      })
      setSaveState("saved")
      setMessage("Конфигурация проекта сохранена на диск.")
    } catch (error) {
      setSaveState("error")
      setMessage(error instanceof Error ? error.message : "Не удалось сохранить конфигурацию проекта.")
    }
  }
  function handleReset() {
    setDraft({
      ...buildProjectConfigDraft(args.project),
      code: args.projectSurface?.metadata.code ?? args.project.metadata.code ?? args.project.id,
    })
    setSaveState("idle")
    setMessage("")
  }
  function updateDraft(patch: Partial<ProjectConfigDraft & { code: string }>) {
    setDraft((currentDraft) => ({ ...currentDraft, ...patch }))
    setSaveState("idle")
    setMessage("")
  }
  return {
    contract: buildProjectConfigContractModel(draftProject, validatedDraft.ok ? validatedDraft.draft.code : draft.code), draft, draftProject, handleReset, handleSave,
    message, saveState, uiKitOptions: listProjectUiKitOptions(), updateDraft,
    validatedDraft, validationMessage: validatedDraft.ok ? "" : validatedDraft.message,
  }
}

export { useProjectConfigController }
