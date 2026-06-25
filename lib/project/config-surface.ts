import { normalizeProject, serializeProjectWorkspace, type ProjectWorkspace } from "@/lib/project/runtime"

type ProjectConfigDraft = {
  id: string
  title: string
  uiKitId: ProjectWorkspace["settings"]["uiKitId"]
}

type ValidateProjectConfigDraftResult =
  | {
    ok: true
    draft: ProjectConfigDraft
  }
  | {
    ok: false
    message: string
  }

function buildProjectConfigDraft(project: ProjectWorkspace): ProjectConfigDraft {
  return {
    id: project.id,
    title: project.title,
    uiKitId: project.settings.uiKitId,
  }
}

function validateProjectConfigDraft(draft: ProjectConfigDraft): ValidateProjectConfigDraftResult {
  const normalized = normalizeProject({
    id: draft.id,
    title: draft.title,
    settings: {
      uiKitId: draft.uiKitId,
    },
  })

  if (!draft.id.trim()) {
    return {
      ok: false,
      message: "Идентификатор проекта не должен быть пустым.",
    }
  }

  if (!draft.title.trim()) {
    return {
      ok: false,
      message: "Название проекта не должно быть пустым.",
    }
  }

  return {
    ok: true,
    draft: buildProjectConfigDraft(normalized),
  }
}

function applyProjectConfigDraft(project: ProjectWorkspace, draft: ProjectConfigDraft) {
  const validation = validateProjectConfigDraft(draft)

  if (!validation.ok) {
    throw new Error(validation.message)
  }

  return serializeProjectWorkspace({
    ...project,
    id: validation.draft.id,
    title: validation.draft.title,
    updatedAt: new Date().toISOString(),
    settings: {
      uiKitId: validation.draft.uiKitId,
    },
  })
}

export {
  applyProjectConfigDraft,
  buildProjectConfigDraft,
  validateProjectConfigDraft,
}

export type {
  ProjectConfigDraft,
  ValidateProjectConfigDraftResult,
}
