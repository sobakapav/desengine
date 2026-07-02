import { z } from "zod"

import {
  LLM_PROVIDER_IDS
} from "./const"

/**
 * Схема ID LLM-провайдера.
 * Нужна для схемы конфигурации приложения. 
 */
export const LlmProviderIdSchema =
  z.enum(LLM_PROVIDER_IDS)

/**
 * Схема конфигурации приложения.
 * Реализована через zod, потому что хранится во внешнем файле (desengine.config.json).
 */ 
const AppConfigSchema = z
  .object({
    promptsRoot: z.string().optional(),
    productionPromptsRoot: z.string().optional(),
    llm: z
      .object({
        provider: LlmProviderIdSchema.optional(),
      })
      .optional(),
  })
  .transform((value) => {
    const promptsRoot = value.promptsRoot ?? value.productionPromptsRoot ?? "prompts"

    return {
      ...value,
      promptsRoot,
    }
  })

export type AppConfig = z.infer<typeof AppConfigSchema>

export { AppConfigSchema }
