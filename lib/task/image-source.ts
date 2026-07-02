import "server-only"

import { readFile } from "node:fs/promises"
import path from "node:path"

import { appConfig } from "@/lib/system/config/server"
import { resolveTaskCatalogSourceId } from "@/lib/task/workflow-template"
import { getTaskCatalogFilePath } from "@/lib/user/server"

type ResolvedTaskImageAsset = {
  filePath: string
  contentType: "image/png" | "image/jpeg" | "image/webp"
}

function getImageFileCandidates(imageId: string) {
  const trimmed = imageId.trim() || "base"
  const ids = Array.from(new Set([trimmed, "base", "image"]))
  const extensions = [".png", ".jpg", ".jpeg", ".webp"]
  const candidates: string[] = []

  for (const id of ids) {
    for (const ext of extensions) {
      candidates.push(`${id}${ext}`)
    }
  }

  candidates.push(appConfig.taskImageFile)

  return Array.from(new Set(candidates))
}

function getContentType(fileName: string): ResolvedTaskImageAsset["contentType"] {
  const ext = path.extname(fileName).toLowerCase()

  if (ext === ".jpg" || ext === ".jpeg") {
    return "image/jpeg"
  }

  if (ext === ".webp") {
    return "image/webp"
  }

  return "image/png"
}

async function resolveTaskImageAsset(taskId: string, imageId: string): Promise<ResolvedTaskImageAsset | null> {
  const sourceTaskId = resolveTaskCatalogSourceId(taskId)

  for (const fileName of getImageFileCandidates(imageId)) {
    const filePath = getTaskCatalogFilePath(sourceTaskId, fileName)

    try {
      await readFile(filePath)
      return {
        filePath,
        contentType: getContentType(fileName),
      }
    } catch {
      // continue
    }
  }

  return null
}

async function readTaskImageBuffer(taskId: string, imageId: string) {
  const asset = await resolveTaskImageAsset(taskId, imageId)
  if (!asset) {
    return null
  }

  return {
    ...asset,
    buffer: await readFile(asset.filePath),
  }
}

async function readTaskImageDataUrl(taskId: string, imageId: string) {
  const asset = await readTaskImageBuffer(taskId, imageId)
  if (!asset) {
    return null
  }

  return `data:${asset.contentType};base64,${asset.buffer.toString("base64")}`
}

export {
  getImageFileCandidates,
  readTaskImageBuffer,
  readTaskImageDataUrl,
  resolveTaskImageAsset,
  type ResolvedTaskImageAsset,
}
