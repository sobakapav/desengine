import "server-only"

import {
  validateGeneratedFilesPayload,
} from "@/lib/lab/workbench"
import { runStructuredLlmRequest } from "@/lib/llm/server"
import { appConfig } from "@/lib/system/config/server"

import { taskActionShared } from "./shared"
import type { FilesPayload, OutputFile } from "./types"

type StartInstructionInput = {
  already: boolean
  productionPrompt: string
  defaultDidacticPrompt: string
  levelIteratePrompt: string
  levelStartPrompt: string
  levelNumber: number
  imagesText: string
  workflowPointText: string
  targetFilesText: string
  supportingFilesText: string
  allowedFilesText: string
  relevantCurrentFilesText: string
}

export const taskStartLlm = {
  buildInstruction(input: StartInstructionInput) {
    const taskText = input.already
      ? `ЗАДАНИЕ:
Это initiator-запуск нового уровня для уже существующей задачи.
Посмотри на картинки текущего уровня и сохрани полезные рабочие наработки только там, где они помогают уровню ${input.levelNumber}.
Если какого-то файла ещё нет в текущем состоянии, это нормально: ты можешь создать его с нуля.`
      : `ЗАДАНИЕ:
По картинкам текущего уровня создай первую рабочую реализацию набора файлов компонента.
Если какого-то файла пока нет, просто создай его с нуля.`

    return [
      input.productionPrompt,
      input.defaultDidacticPrompt,
      input.levelIteratePrompt,
      input.levelStartPrompt,
      taskText,
      input.workflowPointText,
      `КАРТИНКИ ТЕКУЩЕГО УРОВНЯ:
${input.imagesText}`,
      `## Целевые файлы этой генерации
${input.targetFilesText}

Верни полный набор файлов строго по этим ключам:
${input.targetFilesText}

Значение каждого ключа должно быть полным текстовым содержимым соответствующего файла.
Нельзя возвращать имя файла, fileId, короткую заглушку или пояснение вместо кода.`,
      input.supportingFilesText
        ? `## Поддерживающий контекст
Эти файлы уже существуют в рабочем наборе и могут влиять на связность результата, но не являются обязательной целью этой генерации:
${input.supportingFilesText}`
        : "",
      input.already && input.relevantCurrentFilesText
        ? `ТЕКУЩИЙ ПОЛЕЗНЫЙ КОНТЕКСТ ИЗ УЖЕ СУЩЕСТВУЮЩИХ ФАЙЛОВ:
${input.relevantCurrentFilesText}`
        : "",
    ]
      .map((section) => section.trim())
      .filter(Boolean)
      .join("\n\n")
  },
  buildFileContext(
    outputFiles: OutputFile[],
    supportingFiles: OutputFile[],
    contentByFileId: Record<string, string>,
  ) {
    const allowedFilesText = taskActionShared.formatAllowedFilesText(outputFiles)
    const relevantCurrentFiles = taskActionShared.getRelevantCurrentFiles(outputFiles, contentByFileId)
    const supportingFilesText = taskActionShared.formatAllowedFilesText(supportingFiles)

    return {
      allowedFilesText,
      targetFilesText: allowedFilesText,
      supportingFilesText,
      relevantCurrentFilesText: taskActionShared.formatFilesContextText(relevantCurrentFiles),
    }
  },
  call(args: {
    instruction: string
    imageBase64List: string[]
    outputFiles: OutputFile[]
  }) {
    return runStructuredLlmRequest({
      target: "init",
      instruction: args.instruction,
      imageBase64List: args.imageBase64List,
      schemaName: "desengine_start_component_files",
      schema: {
        type: "object",
        additionalProperties: false,
        required: args.outputFiles.map((file) => file.id),
        properties: Object.fromEntries(
          args.outputFiles.map((file) => [file.id, { type: "string" }]),
        ),
      },
    })
  },
  parsePayload(outputText: string, outputFiles: OutputFile[], contentByFileId: Record<string, string>) {
    const parsed = taskActionShared.extractJson(outputText)
    if (!parsed || typeof parsed !== "object") throw new Error("Ответ не является JSON-объектом")

    const payload = taskActionShared.normalizeStartPayload(
      parsed as FilesPayload,
      outputFiles,
      contentByFileId,
    )
    validateGeneratedFilesPayload(payload, outputFiles, appConfig.taskWorkbenchFiles, {
      allowBlankFileNames: Object.keys(taskActionShared.blankStartFallbackByFileName),
    })
    return payload
  },
}
