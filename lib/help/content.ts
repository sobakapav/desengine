import "server-only"

import { readdir, readFile } from "node:fs/promises"
import path from "node:path"

import {
  createHelpImageUrl,
  createHelpMermaidUrl,
  createHelpPageUrl,
} from "./navigation"

const HELP_ROOT = path.join(/*turbopackIgnore: true*/ process.cwd(), "help")
const HELP_IMAGES_ROOT = path.join(HELP_ROOT, "images")
const HELP_MERMAID_ROOT = path.join(HELP_ROOT, "mermaid")
const MARKDOWN_EXTENSION = ".md"
const MERMAID_EXTENSION = ".mmd"
const RESERVED_HELP_IDS = new Set(["error", "images", "mermaid"])

const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml; charset=utf-8",
  ".webp": "image/webp",
}

type HelpPageEntry = {
  href: string
  id: string
  title: string
}

type HelpMarkdownPage = HelpPageEntry & {
  content: string
}

type HelpImageAsset = {
  body: Buffer
  contentType: string
}

function isSafeHelpId(value: string) {
  return /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(value) && !RESERVED_HELP_IDS.has(value)
}

function isSafeAssetId(value: string) {
  return /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(value) && !value.includes("..")
}

function getMarkdownTitle(content: string, fallback: string) {
  const headingMatch = content.match(/(?:^|\n)#(?!#)\s+(.+?)\s*#*\s*(?:\n|$)/)
  return headingMatch?.[1]?.trim() || fallback
}

function resolveInside(root: string, fileName: string) {
  const resolvedRoot = path.resolve(root)
  const resolvedPath = path.resolve(resolvedRoot, fileName)

  if (resolvedPath !== resolvedRoot && resolvedPath.startsWith(`${resolvedRoot}${path.sep}`)) {
    return resolvedPath
  }

  return null
}

function normalizeMermaidId(rawId: string) {
  if (!rawId.endsWith(MERMAID_EXTENSION)) {
    return rawId
  }

  return rawId.slice(0, -MERMAID_EXTENSION.length)
}

async function listHelpPages(helpRoot = HELP_ROOT): Promise<HelpPageEntry[]> {
  let entries

  try {
    entries = await readdir(helpRoot, { withFileTypes: true })
  } catch {
    return []
  }

  const pages = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(MARKDOWN_EXTENSION))
      .map(async (entry) => {
        const id = entry.name.slice(0, -MARKDOWN_EXTENSION.length)

        if (!isSafeHelpId(id)) {
          return null
        }

        const filePath = resolveInside(helpRoot, entry.name)
        if (!filePath) return null

        const content = await readFile(filePath, "utf8")
        const title = getMarkdownTitle(content, id)

        return {
          href: createHelpPageUrl(id),
          id,
          title,
        }
      }),
  )

  return pages
    .filter((page): page is HelpPageEntry => Boolean(page))
    .sort((left, right) => left.title.localeCompare(right.title, "ru"))
}

async function readHelpMarkdownPage(
  helpId: string,
  helpRoot = HELP_ROOT,
): Promise<HelpMarkdownPage | null> {
  if (!isSafeHelpId(helpId)) {
    return null
  }

  const filePath = resolveInside(helpRoot, `${helpId}${MARKDOWN_EXTENSION}`)
  if (!filePath) return null

  try {
    const content = await readFile(filePath, "utf8")

    return {
      content,
      href: createHelpPageUrl(helpId),
      id: helpId,
      title: getMarkdownTitle(content, helpId),
    }
  } catch {
    return null
  }
}

async function readHelpImageAsset(
  imgId: string,
  imagesRoot = HELP_IMAGES_ROOT,
): Promise<HelpImageAsset | null> {
  if (!isSafeAssetId(imgId)) {
    return null
  }

  const filePath = resolveInside(imagesRoot, imgId)
  if (!filePath) return null

  try {
    const body = await readFile(filePath)
    const extension = path.extname(filePath).toLowerCase()

    return {
      body,
      contentType: CONTENT_TYPE_BY_EXTENSION[extension] ?? "application/octet-stream",
    }
  } catch {
    return null
  }
}

async function readHelpMermaidSource(
  rawMermaidId: string,
  mermaidRoot = HELP_MERMAID_ROOT,
) {
  const mermaidId = normalizeMermaidId(rawMermaidId)

  if (!isSafeHelpId(mermaidId)) {
    return null
  }

  const filePath = resolveInside(mermaidRoot, `${mermaidId}${MERMAID_EXTENSION}`)
  if (!filePath) return null

  try {
    const content = await readFile(filePath, "utf8")

    return {
      content,
      href: createHelpMermaidUrl(mermaidId),
      id: mermaidId,
      title: mermaidId,
    }
  } catch {
    return null
  }
}

export {
  createHelpImageUrl,
  createHelpMermaidUrl,
  HELP_IMAGES_ROOT,
  HELP_MERMAID_ROOT,
  HELP_ROOT,
  isSafeAssetId,
  isSafeHelpId,
  listHelpPages,
  readHelpImageAsset,
  readHelpMarkdownPage,
  readHelpMermaidSource,
}
