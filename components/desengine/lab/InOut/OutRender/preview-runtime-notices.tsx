"use client"

import type { SandpackPreviewPayload } from "@/lib/lab/sandpack-preview.types"
import { installPreviewDigestFallback } from "./preview-runtime-webcrypto"

function PreviewErrorNotice({ message }: { message: string }) {
  return (
    <div className="space-y-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
      <p className="font-medium text-destructive">Не удалось показать предпросмотр компонента.</p>
      <pre className="text-destructive whitespace-pre-wrap break-words">{message}</pre>
    </div>
  )
}

function PreviewStyleContractNotice({ message }: { message: string }) {
  return (
    <div className="mb-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
      <p className="font-medium">Предпросмотр открылся, но стили ещё не подтвердились.</p>
      <p className="mt-1 whitespace-pre-wrap break-words">{message}</p>
    </div>
  )
}

function PreviewRuntimeContractErrorNotice({ message }: { message: string }) {
  return (
    <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
      <p className="font-medium">Компонент не удалось отрендерить в предпросмотре.</p>
      <p className="mt-1 whitespace-pre-wrap break-words">{message}</p>
    </div>
  )
}

function PreviewCheckGuardNotice({ message }: { message: string }) {
  return (
    <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
      <p className="font-medium">Проверка результата временно недоступна.</p>
      <p className="mt-1 whitespace-pre-wrap break-words">{message}</p>
    </div>
  )
}

function PreviewSecureContextNotice({ message }: { message: string }) {
  return (
    <div className="mb-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
      <p className="font-medium">Предпросмотр сейчас не запускается в этом браузере.</p>
      <p className="mt-1 whitespace-pre-wrap break-words">{message}</p>
    </div>
  )
}

function ProjectCompatibilityNotice({ payload }: { payload: SandpackPreviewPayload }) {
  const compatibility = payload.project.compatibility

  if (compatibility.status !== "incompatible") {
    return null
  }

  return (
    <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
      <p className="font-medium">
        Настройки предпросмотра: {payload.project.settings.uiKitId}
        {payload.project.effectiveUiKitId !== payload.project.settings.uiKitId ? `, runtime ${payload.project.effectiveUiKitId}` : ""}
      </p>
      <p className="mt-1">{compatibility.message}</p>
    </div>
  )
}

function ProjectMigrationNotice({ payload }: { payload: SandpackPreviewPayload }) {
  const migration = payload.project.migration

  if (migration.state === "idle" || !migration.message) {
    return null
  }

  const className = migration.state === "failed"
    ? "mb-3 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
    : migration.state === "pending"
      ? "mb-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950"
      : "mb-3 rounded-md border border-black/10 bg-stone-50 p-3 text-sm text-stone-950"

  return (
    <div className={className}>
      <p className="font-medium">
        Переключение UI kit проекта: {migration.sourceUiKitId} {"->"} {migration.targetUiKitId}
      </p>
      <p className="mt-1 whitespace-pre-wrap break-words">{migration.message}</p>
    </div>
  )
}

function getPreviewRuntimeSupport() {
  if (typeof window === "undefined") {
    return { supported: true, message: "" }
  }

  if (installPreviewDigestFallback()) {
    return { supported: true, message: "" }
  }

  return {
    supported: false,
    message:
      "Предпросмотр нельзя запустить в текущем окружении: браузер не дал доступ к нужным возможностям защиты и не позволил включить локальный запасной режим для Sandpack. Откройте desengine по HTTPS или используйте совместимый браузер.",
  }
}

export {
  getPreviewRuntimeSupport,
  PreviewCheckGuardNotice,
  PreviewErrorNotice,
  PreviewRuntimeContractErrorNotice,
  PreviewSecureContextNotice,
  PreviewStyleContractNotice,
  ProjectCompatibilityNotice,
  ProjectMigrationNotice,
}
