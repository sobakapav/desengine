import { Buffer } from "node:buffer"

import { LlmError } from "@/lib/llm/errors"
import { sumTextLengths } from "@/lib/task/runtime-observability"

type RuntimeBudgetPath = "start" | "iterate" | "check"
type RuntimeBudgetPhase = "input" | "output" | "write_set"
type RuntimeBudgetDimension =
  | "instruction_chars"
  | "prompt_image_count"
  | "prompt_image_base64_chars"
  | "structured_output_chars"
  | "write_set_file_count"
  | "write_set_bytes"

export type RuntimeBudgetExceededDetails = {
  path: RuntimeBudgetPath
  phase: RuntimeBudgetPhase
  dimension: RuntimeBudgetDimension
  actual: number
  budget: number
}

type PendingWriteEntry = {
  fileId: string
  fileName: string
  content: string
}

const taskActionLlmBudgets = {
  maxInstructionChars: 120_000,
  maxPromptImageCount: 8,
  maxPromptImageBase64Chars: 10_000_000,
  maxStructuredOutputChars: 200_000,
  maxWriteSetFileCount: 12,
  maxWriteSetBytes: 180_000,
} as const

const budgetDimensionLabels: Record<RuntimeBudgetDimension, string> = {
  instruction_chars: "размер instructions и текстового runtime context",
  prompt_image_count: "количество входных картинок",
  prompt_image_base64_chars: "общий объём входных картинок",
  structured_output_chars: "размер structured-output",
  write_set_file_count: "количество файлов в write-set",
  write_set_bytes: "суммарный размер write-set",
}

function getRuntimePathLabel(path: RuntimeBudgetPath) {
  switch (path) {
    case "start":
      return "initiator-запуск"
    case "iterate":
      return "уточнение"
    default:
      return "проверка"
  }
}

function getRuntimeBudgetUnit(dimension: RuntimeBudgetDimension) {
  switch (dimension) {
    case "prompt_image_count":
    case "write_set_file_count":
      return "шт."
    case "write_set_bytes":
      return "байт"
    default:
      return "символов"
  }
}

function buildRuntimeBudgetMessage(details: RuntimeBudgetExceededDetails) {
  const unit = getRuntimeBudgetUnit(details.dimension)
  return [
    `Превышен runtime budget для действия "${getRuntimePathLabel(details.path)}".`,
    `${budgetDimensionLabels[details.dimension]}: ${details.actual} ${unit} при лимите ${details.budget} ${unit}.`,
    "Уменьшите объём входного контекста или ожидаемого результата и повторите попытку.",
  ].join(" ")
}

class RuntimeBudgetExceededError extends LlmError {
  details: RuntimeBudgetExceededDetails

  constructor(details: RuntimeBudgetExceededDetails) {
    super("budget", buildRuntimeBudgetMessage(details))
    this.details = details
  }
}

function throwRuntimeBudgetExceeded(details: RuntimeBudgetExceededDetails): never {
  throw new RuntimeBudgetExceededError(details)
}

function getWriteSetBytes(entries: PendingWriteEntry[]) {
  return entries.reduce((total, entry) => total + Buffer.byteLength(entry.content, "utf8"), 0)
}

export function validateTaskActionInputBudget(args: {
  path: RuntimeBudgetPath
  instruction: string
  imageBase64List: string[]
}) {
  const promptImageBase64Chars = sumTextLengths(args.imageBase64List)

  if (args.instruction.length > taskActionLlmBudgets.maxInstructionChars) {
    throwRuntimeBudgetExceeded({
      path: args.path,
      phase: "input",
      dimension: "instruction_chars",
      actual: args.instruction.length,
      budget: taskActionLlmBudgets.maxInstructionChars,
    })
  }

  if (args.imageBase64List.length > taskActionLlmBudgets.maxPromptImageCount) {
    throwRuntimeBudgetExceeded({
      path: args.path,
      phase: "input",
      dimension: "prompt_image_count",
      actual: args.imageBase64List.length,
      budget: taskActionLlmBudgets.maxPromptImageCount,
    })
  }

  if (promptImageBase64Chars > taskActionLlmBudgets.maxPromptImageBase64Chars) {
    throwRuntimeBudgetExceeded({
      path: args.path,
      phase: "input",
      dimension: "prompt_image_base64_chars",
      actual: promptImageBase64Chars,
      budget: taskActionLlmBudgets.maxPromptImageBase64Chars,
    })
  }

  return {
    instructionChars: args.instruction.length,
    promptImageCount: args.imageBase64List.length,
    promptImageBase64Chars,
  }
}

export function validateTaskActionStructuredOutputBudget(args: {
  path: RuntimeBudgetPath
  outputText: string
}) {
  if (args.outputText.length > taskActionLlmBudgets.maxStructuredOutputChars) {
    throwRuntimeBudgetExceeded({
      path: args.path,
      phase: "output",
      dimension: "structured_output_chars",
      actual: args.outputText.length,
      budget: taskActionLlmBudgets.maxStructuredOutputChars,
    })
  }

  return {
    outputChars: args.outputText.length,
  }
}

export function validateTaskActionWriteSetBudget(args: {
  path: RuntimeBudgetPath
  entries: PendingWriteEntry[]
}) {
  if (args.entries.length > taskActionLlmBudgets.maxWriteSetFileCount) {
    throwRuntimeBudgetExceeded({
      path: args.path,
      phase: "write_set",
      dimension: "write_set_file_count",
      actual: args.entries.length,
      budget: taskActionLlmBudgets.maxWriteSetFileCount,
    })
  }

  const writeSetBytes = getWriteSetBytes(args.entries)
  if (writeSetBytes > taskActionLlmBudgets.maxWriteSetBytes) {
    throwRuntimeBudgetExceeded({
      path: args.path,
      phase: "write_set",
      dimension: "write_set_bytes",
      actual: writeSetBytes,
      budget: taskActionLlmBudgets.maxWriteSetBytes,
    })
  }

  return {
    writeSetBytes,
    writeSetFileCount: args.entries.length,
  }
}

export function getTaskActionBudgetErrorDetails(error: unknown): RuntimeBudgetExceededDetails | null {
  return error instanceof RuntimeBudgetExceededError ? error.details : null
}

export { taskActionLlmBudgets }
