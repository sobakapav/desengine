import "server-only"

import {
  validateGeneratedFilesPayload,
} from "@/lib/lab/workbench"
import { runStructuredLlmRequest } from "@/lib/llm/server"
import { appConfig } from "@/lib/system/config/server"

import { taskActionShared } from "./shared"
import type { NullableFilesPayload, OutputFile } from "./types"

type IterateInstructionInput = {
  defaultProductionPrompt: string
  iterateProductionPrompt: string
  defaultDidacticPrompt: string
  levelSpecifyPrompt: string
  commonExplanation: string
  targetFilesText: string
  supportingFilesText: string
  promptText: string
  workflowPointText: string
  imagesText: string
  targetFilesStateText: string
  supportingFilesStateText: string
}

export const taskIterateLlm = {
  buildInstruction(args: IterateInstructionInput) {
    return `
${args.defaultProductionPrompt}

${args.iterateProductionPrompt}

${args.defaultDidacticPrompt}

${args.levelSpecifyPrompt}

ОБЩЕЕ ПОЯСНЕНИЕ УРОВНЯ:
${args.commonExplanation}

## Целевые файлы этой итерации
${args.targetFilesText}

Верни JSON только с ключами из этого списка:
${args.targetFilesText}

Для каждого ключа верни одно из двух:
- полный текст файла, если его нужно изменить;
- \`null\`, если этот файл менять не нужно.

Если пользователь просит изменить компонент, не возвращай \`null\` для всех файлов, пока действительно не убедишься, что текущее состояние уже полностью удовлетворяет запросу.

ТЕКУЩИЙ УТОЧНЯЮЩИЙ ПРОМПТ ПОЛЬЗОВАТЕЛЯ:
${args.promptText}

${args.workflowPointText}

${args.supportingFilesText
  ? `Поддерживающие файлы, которые уже существуют рядом и могут влиять на результат:
${args.supportingFilesText}`
  : ""}

КАРТИНКИ ТЕКУЩЕГО УРОВНЯ:
${args.imagesText}

ТЕКУЩЕЕ СОСТОЯНИЕ ЦЕЛЕВЫХ ФАЙЛОВ:
${args.targetFilesStateText}

${args.supportingFilesStateText
  ? `ПОДДЕРЖИВАЮЩИЙ КОНТЕКСТ СОСЕДНИХ ФАЙЛОВ:
${args.supportingFilesStateText}`
  : ""}
`.trim()
  },
  call(args: {
    instruction: string
    imageBase64List: string[]
    editableFiles: OutputFile[]
  }) {
    return runStructuredLlmRequest({
      target: "iterate",
      instruction: args.instruction,
      imageBase64List: args.imageBase64List,
      schemaName: "desengine_iterate_component_files",
      schema: {
        type: "object",
        additionalProperties: false,
        required: args.editableFiles.map((file) => file.id),
        properties: Object.fromEntries(
          args.editableFiles.map((file) => [file.id, { type: ["string", "null"] }]),
        ),
      },
    })
  },
  parsePayload(outputText: string, editableFiles: OutputFile[]) {
    const parsed = taskActionShared.extractJson(outputText)
    if (!parsed || typeof parsed !== "object") throw new Error("Ответ не является JSON-объектом")

    const payload = parsed as NullableFilesPayload
    validateGeneratedFilesPayload(payload, editableFiles, appConfig.taskWorkbenchFiles, {
      allowNull: true,
    })
    return payload
  },
}
