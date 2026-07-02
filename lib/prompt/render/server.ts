import "server-only"

import nunjucks from "nunjucks"

type RenderPromptTemplateOptions = {
  required?: boolean
}

/**
 * @example
 * ```ts
 * const text = await renderPromptTemplateFromRoot("/tmp/prompts", "main.njk", {
 *   project: { title: "Demo" },
 * }, { required: true })
 * ```
 */
export async function renderPromptTemplateFromRoot(
  root: string,
  templatePath: string,
  context: Record<string, unknown>,
  options: RenderPromptTemplateOptions = {},
) {
  const environment = new nunjucks.Environment(
    new nunjucks.FileSystemLoader(root, {
      noCache: true,
      watch: false,
    }),
    {
      autoescape: false,
      throwOnUndefined: Boolean(options.required),
      trimBlocks: false,
      lstripBlocks: false,
    },
  )

  return environment.render(templatePath, context)
}
