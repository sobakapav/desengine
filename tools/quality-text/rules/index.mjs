import { apiExampleRule } from "./api-example.mjs"
import { booleanTrapRule } from "./boolean-trap.mjs"
import { fileLengthRule } from "./file-length.mjs"
import { floatingPromiseRule } from "./floating-promise.mjs"
import { functionLengthRule } from "./function-length.mjs"
import { todoFormatRule } from "./todo-format.mjs"

export const qualityTextRules = [
  fileLengthRule,
  functionLengthRule,
  todoFormatRule,
  booleanTrapRule,
  floatingPromiseRule,
  apiExampleRule,
]

export const qualityTextRuleIds = qualityTextRules.map((rule) => rule.id)
