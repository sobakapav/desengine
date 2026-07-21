import { normalizeProject, serializeProjectWorkspace, type ProjectWorkspace } from "@/lib/project/runtime"

type ProjectConfigDraft = {
  code: string
  id: string
  promptBrief: string
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
    code: project.metadata.code || project.id,
    id: project.id,
    promptBrief: project.settings.promptBrief,
    title: project.title,
    uiKitId: project.settings.uiKitId,
  }
}

function validateProjectConfigDraft(draft: ProjectConfigDraft): ValidateProjectConfigDraftResult {
  const normalized = normalizeProject({
    id: draft.id,
    metadata: {
      code: draft.code,
      title: draft.title,
      uiKitId: draft.uiKitId,
    },
    promptBrief: draft.promptBrief,
    title: draft.title,
    settings: {
      promptBrief: draft.promptBrief,
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

  if (!draft.code.trim()) {
    return {
      ok: false,
      message: "Код проекта не должен быть пустым.",
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
    metadata: {
      ...project.metadata,
      code: validation.draft.code,
      title: validation.draft.title,
      uiKitId: validation.draft.uiKitId,
    },
    title: validation.draft.title,
    updatedAt: new Date().toISOString(),
    settings: {
      promptBrief: validation.draft.promptBrief.trim(),
      uiKitId: validation.draft.uiKitId,
      workflowTemplateId: project.settings.workflowTemplateId,
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
