type PreviewRuntimeContractStatus = "loading" | "ready" | "unstyled-dom" | "render-error"

type PreviewRuntimeContractMessage = {
  source: "desengine-sandpack-preview"
  type: "contract"
  status: PreviewRuntimeContractStatus
  message?: string
  previewSessionId: string
}

type PreviewRuntimeContractDiagnostic = {
  status: PreviewRuntimeContractStatus
  message?: string
}

const previewRuntimeContractStatuses = new Set<PreviewRuntimeContractStatus>([
  "loading",
  "ready",
  "unstyled-dom",
  "render-error",
])

function readPreviewRuntimeContractMessage(
  value: unknown,
  previewSessionId: string,
): PreviewRuntimeContractMessage | null {
  if (typeof value !== "object" || value === null) {
    return null
  }

  const candidate = value as Partial<PreviewRuntimeContractMessage>
  if (candidate.source !== "desengine-sandpack-preview" || candidate.type !== "contract") {
    return null
  }

  if (candidate.previewSessionId !== previewSessionId) {
    return null
  }

  if (!previewRuntimeContractStatuses.has(candidate.status as PreviewRuntimeContractStatus)) {
    return null
  }

  return candidate as PreviewRuntimeContractMessage
}

function getPreviewCheckGuardMessage(value: PreviewRuntimeContractDiagnostic): string | null {
  if (value.status !== "render-error") {
    return null
  }

  const detail = typeof value.message === "string" ? value.message.trim() : ""
  const baseMessage =
    "Проверка результата временно недоступна: preview сломан и не может подтвердить рендер компонента."

  return detail ? `${baseMessage} Сначала исправьте ошибку preview: ${detail}` : baseMessage
}

export {
  getPreviewCheckGuardMessage,
  readPreviewRuntimeContractMessage,
  type PreviewRuntimeContractDiagnostic,
  type PreviewRuntimeContractMessage,
  type PreviewRuntimeContractStatus,
}
