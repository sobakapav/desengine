import "server-only"

import { readFile } from "node:fs/promises"
import path from "node:path"

import nunjucks from "nunjucks"

import type { PromptRenderContext } from "../types"

type RenderOptions = {
  required?: boolean
  missingMessage?: string
  onErrorFallbackToRaw?: boolean
}

const envByRoot = new Map<string, nunjucks.Environment>()

function getEnv(root: string) {
  const existing = envByRoot.get(root)
  if (existing) return existing

  const noCache = process.env.NODE_ENV !== "production"
  const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(root, { noCache }), {
    autoescape: false,
    throwOnUndefined: false,
  })

  envByRoot.set(root, env)
  return env
}

function renderAsync(
  env: nunjucks.Environment,
  templatePath: string,
  context: PromptRenderContext,
) {
  return new Promise<string>((resolve, reject) => {
    env.render(templatePath, context, (error, output) => {
      if (error) return reject(error)
      resolve(String(output ?? ""))
    })
  })
}

/**
 * @example
 * ```ts
 * await renderPromptTemplateFromRoot(root, "levels/level-1/start.njk", context, { required: true })
 * ```
 */
export async function renderPromptTemplateFromRoot(
  root: string,
  templatePath: string,
  context: PromptRenderContext,
  options: RenderOptions = {},
) {
  const env = getEnv(root)

  try {
    return await renderAsync(env, templatePath, context)
  } catch (error) {
    if (options.required) {
      if (options.missingMessage) {
        throw new Error(options.missingMessage)
      }
      throw error instanceof Error ? error : new Error(String(error))
    }

    if (options.onErrorFallbackToRaw) {
      try {
        const raw = await readFile(path.join(root, templatePath), "utf-8")
        return raw
      } catch {
        // ignore
      }
    }

    return ""
  }
}
