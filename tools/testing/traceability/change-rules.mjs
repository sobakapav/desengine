import {
  CHANGE_KINDS,
  EXECUTION_MODES,
  GOVERNED_PREFIXES,
  PARENT_CHANGE_PATTERN,
  RELEASE_REF_PATTERN,
  ROADMAP_REF_PATTERN,
  STRATEGY_ROOT_PATTERN,
  VERIFICATION_COMMAND_PATTERN,
  VERIFICATION_LEVEL_PATTERN,
  parseMetadataValue,
} from "./common.mjs"

function validateCommonRules(changeName, changeKind, executionMode, errors) {
  const namePrefix = changeName.split("-", 1)[0]

  if (/-[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(changeName)) {
    errors.push(`${changeName}: суффикс даты в имени change не допускается`)
  }
  if (!CHANGE_KINDS.has(changeKind)) {
    errors.push(`${changeName}: change_kind должен быть одним из focus/release/idea/research/dispatcher/implement/fix`)
    errors.push(`${changeName}: change_kind вне поддерживаемого набора`)
  }
  if (GOVERNED_PREFIXES.includes(namePrefix) && changeKind !== namePrefix) {
    errors.push(`${changeName}: префикс имени ${namePrefix}- должен совпадать с change_kind=${changeKind}`)
  }
  if (!executionMode) {
    errors.push(`${changeName}: отсутствует обязательное поле execution_mode`)
  } else if (!EXECUTION_MODES.has(executionMode)) {
    errors.push(`${changeName}: execution_mode должен быть no-code или code`)
  }
}

function validateReferenceRules(changeName, metadata, context, errors) {
  const parentChange = parseMetadataValue(metadata, PARENT_CHANGE_PATTERN) || ""
  const releaseRef = parseMetadataValue(metadata, RELEASE_REF_PATTERN) || ""
  const strategyRoot = parseMetadataValue(metadata, STRATEGY_ROOT_PATTERN) || ""

  if (parentChange && !context.allChangeNames.has(parentChange)) {
    errors.push(`${changeName}: parent_change ссылается на неизвестный change: ${parentChange}`)
  }
  if (!releaseRef) {
  } else if (!context.allChangeNames.has(releaseRef)) {
    errors.push(`${changeName}: release_ref ссылается на неизвестный change: ${releaseRef}`)
  } else if (context.changeKindsByName.get(releaseRef) !== "release") {
    errors.push(`${changeName}: release_ref должен ссылаться на change_kind=release`)
  }

  if (!strategyRoot) {
    return
  }
  if (!context.allChangeNames.has(strategyRoot)) {
    errors.push(`${changeName}: strategy_root ссылается на неизвестный change: ${strategyRoot}`)
  } else if (!["focus", "idea", "research"].includes(context.changeKindsByName.get(strategyRoot))) {
    errors.push(`${changeName}: strategy_root должен ссылаться на стратегический change`)
  }
}

function validateStrategicKindRules(changeName, changeKind, executionMode, parentChange, context, errors) {
  if (changeKind === "idea" && parentChange && context.changeKindsByName.get(parentChange) !== "focus") {
    errors.push(`${changeName}: idea change может иметь parent_change только на focus`)
  }
  if (["idea", "focus", "release", "research", "dispatcher"].includes(changeKind) && executionMode !== "no-code") {
    errors.push(`${changeName}: ${changeKind} change должен иметь execution_mode=no-code`)
  }
  if (["focus", "release"].includes(changeKind) && parentChange) {
    errors.push(`${changeName}: ${changeKind} change не должен иметь parent_change`)
  }
  if (changeKind === "release" && context.childCountByParent.get(changeName)) {
    errors.push(`${changeName}: release change не может быть родителем других changes`)
  }
  if (changeKind === "dispatcher" && !parentChange) {
    errors.push(`${changeName}: dispatcher change должен иметь parent_change`)
  }
}

function validateResearchRules(changeName, changeKind, parentChange, context, errors) {
  const parentKind = context.changeKindsByName.get(parentChange)

  if (changeKind !== "research" || !parentChange || !parentKind) {
    return
  }
  if (!["focus", "idea", "research"].includes(parentKind)) {
    errors.push(`${changeName}: research change может иметь parent_change только на стратегический change`)
  }
}

export function validateChangeKindRules(changeName, metadata, context) {
  const errors = []
  const changeKind = context.changeKindsByName.get(changeName) || ""
  const executionMode = parseMetadataValue(metadata, /^execution_mode:\s*(.+)\s*$/m)
  const parentChange = parseMetadataValue(metadata, PARENT_CHANGE_PATTERN) || ""
  const strategyRoot = parseMetadataValue(metadata, STRATEGY_ROOT_PATTERN) || ""
  const roadmapRef = parseMetadataValue(metadata, ROADMAP_REF_PATTERN) || ""
  const verificationLevel = parseMetadataValue(metadata, VERIFICATION_LEVEL_PATTERN) || ""
  const verificationCommand = parseMetadataValue(metadata, VERIFICATION_COMMAND_PATTERN) || ""

  if (!changeKind) {
    return [`${changeName}: отсутствует обязательное поле change_kind`]
  }

  validateCommonRules(changeName, changeKind, executionMode, errors)
  validateReferenceRules(changeName, metadata, context, errors)
  validateStrategicKindRules(changeName, changeKind, executionMode, parentChange, context, errors)
  validateResearchRules(changeName, changeKind, parentChange, context, errors)

  if (changeKind === "dispatcher" && !roadmapRef) {
    errors.push(`${changeName}: dispatcher change должен иметь roadmap_ref`)
  }
  if (["implement", "fix"].includes(changeKind) && !parentChange) {
    errors.push(`${changeName}: ${changeKind} change должен иметь parent_change`)
  }
  if (["implement", "fix"].includes(changeKind) && executionMode !== "code") {
    errors.push(`${changeName}: ${changeKind} change должен иметь execution_mode=code`)
  }
  if (["implement", "fix"].includes(changeKind) && parentChange && context.changeKindsByName.get(parentChange) !== "dispatcher") {
    errors.push(`${changeName}: ${changeKind} change должен иметь parent_change на dispatcher`)
  }
  if (["implement", "fix"].includes(changeKind) && !strategyRoot) {
    errors.push(`${changeName}: ${changeKind} change должен иметь strategy_root`)
  }
  if (["implement", "fix"].includes(changeKind) && !verificationLevel) {
    errors.push(`${changeName}: ${changeKind} change должен иметь verification_level`)
  }
  if (["implement", "fix"].includes(changeKind) && !verificationCommand) {
    errors.push(`${changeName}: ${changeKind} change должен иметь verification_command`)
  }

  return errors
}
