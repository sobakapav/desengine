import {
  CHANGE_KINDS,
  EXECUTION_MODES,
  GOVERNED_PREFIXES,
  PARENT_CHANGE_PATTERN,
  PRODUCER_REF_PATTERN,
  RELEASE_REF_PATTERN,
  ROADMAP_REF_PATTERN,
  ROADMAP_REFS_PATTERN,
  STRATEGY_ROOT_PATTERN,
  VERIFICATION_COMMAND_PATTERN,
  VERIFICATION_LEVEL_PATTERN,
  parseMetadataList,
  parseMetadataValue,
} from "./common.mjs"

function validateCommonRules(changeName, changeKind, executionMode, errors) {
  const namePrefix = changeName.split("-", 1)[0]

  if (/-[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(changeName)) {
    errors.push(`${changeName}: суффикс даты в имени change не допускается`)
  }
  if (!CHANGE_KINDS.has(changeKind)) {
    errors.push(`${changeName}: change_kind должен быть одним из focus/release/idea/producer/dispatcher/implement/fix`)
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
  const producerRef = parseMetadataValue(metadata, PRODUCER_REF_PATTERN) || ""
  const strategyRoot = parseMetadataValue(metadata, STRATEGY_ROOT_PATTERN) || ""
  const changeKind = context.changeKindsByName.get(changeName) || ""

  if (parentChange && !context.allChangeNames.has(parentChange)) {
    errors.push(`${changeName}: parent_change ссылается на неизвестный change: ${parentChange}`)
  }
  if (!releaseRef) {
  } else if (!context.allChangeNames.has(releaseRef)) {
    if (context.archivedChangeKindsByName.get(releaseRef) === "release") {
      const activeMembers = [...(context.activeReleaseMembersByReleaseRef.get(releaseRef) || [])].sort((left, right) => left.localeCompare(right))
      const membersLabel = activeMembers.length > 0 ? ` (${activeMembers.join(", ")})` : ""
      errors.push(
        `${changeName}: release_ref ссылается на архивированный release ${releaseRef}; release change можно закрывать только после закрытия всех active changes состава${membersLabel}`,
      )
    } else {
      errors.push(`${changeName}: release_ref ссылается на неизвестный change: ${releaseRef}`)
    }
  } else if (context.changeKindsByName.get(releaseRef) !== "release") {
    errors.push(`${changeName}: release_ref должен ссылаться на change_kind=release`)
  } else if (!["implement", "fix"].includes(changeKind)) {
    errors.push(`${changeName}: release_ref разрешён только для change_kind=implement или change_kind=fix`)
  }
  if (!producerRef) {
  } else if (!context.allChangeNames.has(producerRef)) {
    errors.push(`${changeName}: producer_ref ссылается на неизвестный change: ${producerRef}`)
  } else if (context.changeKindsByName.get(producerRef) !== "producer") {
    errors.push(`${changeName}: producer_ref должен ссылаться на change_kind=producer`)
  }

  if (!strategyRoot) {
    return
  }
  if (!context.allChangeNames.has(strategyRoot)) {
    errors.push(`${changeName}: strategy_root ссылается на неизвестный change: ${strategyRoot}`)
  } else if (!["focus", "idea", "producer"].includes(context.changeKindsByName.get(strategyRoot))) {
    errors.push(`${changeName}: strategy_root должен ссылаться на стратегический change`)
  }
}

function roadmapRefsFromMetadata(metadata) {
  const refs = []
  const singleRef = parseMetadataValue(metadata, ROADMAP_REF_PATTERN) || ""
  const listRefs = parseMetadataList(metadata, ROADMAP_REFS_PATTERN)

  if (singleRef) {
    refs.push(singleRef)
  }

  for (const ref of listRefs) {
    if (!refs.includes(ref)) {
      refs.push(ref)
    }
  }

  return refs
}

function strategicLineageForDispatcher(changeName, parentChange, strategyRoot, context) {
  const lineage = new Set()
  let current = parentChange

  while (current && context.allChangeNames.has(current)) {
    const currentKind = context.changeKindsByName.get(current)

    if (["focus", "idea", "producer"].includes(currentKind)) {
      lineage.add(current)
    }

    current = context.parentByChangeName.get(current) || ""
  }

  if (strategyRoot && context.allChangeNames.has(strategyRoot)) {
    const strategyKind = context.changeKindsByName.get(strategyRoot)

    if (["focus", "idea", "producer"].includes(strategyKind)) {
      lineage.add(strategyRoot)
    }
  }

  return lineage
}

function validateRoadmapInheritanceRules(changeName, parentChange, strategyRoot, roadmapRefs, context, errors) {
  if (roadmapRefs.length === 0) {
    errors.push(`${changeName}: dispatcher change должен иметь roadmap_ref или roadmap_refs`)
    return
  }

  const allowedOwners = strategicLineageForDispatcher(changeName, parentChange, strategyRoot, context)

  for (const ref of roadmapRefs) {
    const match = ref.match(/^([^/]+)\/(roadmaps\/.+\.md)$/)

    if (!match) {
      errors.push(`${changeName}: roadmap reference должен иметь вид <change>/roadmaps/<file>.md: ${ref}`)
      continue
    }

    const ownerChange = match[1]
    const relativePath = match[2]

    if (!context.allChangeNames.has(ownerChange)) {
      errors.push(`${changeName}: roadmap owner ссылается на неизвестный change: ${ownerChange}`)
      continue
    }

    const ownerKind = context.changeKindsByName.get(ownerChange)

    if (!["focus", "idea", "producer"].includes(ownerKind)) {
      errors.push(`${changeName}: roadmap owner должен быть стратегическим change: ${ownerChange}`)
    }

    if (!allowedOwners.has(ownerChange)) {
      errors.push(`${changeName}: roadmap owner ${ownerChange} должен быть стратегическим предком или strategy_root`)
    }

    const absolutePath = context.changeDirByName.get(ownerChange)
      ? `${context.changeDirByName.get(ownerChange)}/${relativePath}`
      : ""

    if (!absolutePath || !context.fileExists(absolutePath)) {
      errors.push(`${changeName}: roadmap file не найден у владельца ${ownerChange}: ${relativePath}`)
    }
  }
}

function validateStrategicKindRules(changeName, changeKind, executionMode, parentChange, context, errors) {
  if (changeKind === "idea" && parentChange && context.changeKindsByName.get(parentChange) !== "focus") {
    errors.push(`${changeName}: idea change может иметь parent_change только на focus`)
  }
  if (["idea", "focus", "release", "producer", "dispatcher"].includes(changeKind) && executionMode !== "no-code") {
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

function validateProducerRules(changeName, changeKind, parentChange, context, errors) {
  const parentKind = context.changeKindsByName.get(parentChange)

  if (changeKind !== "producer") {
    return
  }
  if (!context.hasRoadmapFiles(changeName)) {
    errors.push(`${changeName}: producer change должен иметь собственный roadmap в каталоге roadmaps/`)
  }
  if (!parentChange || !parentKind) {
    return
  }
  if (!["focus", "idea", "producer"].includes(parentKind)) {
    errors.push(`${changeName}: producer change может иметь parent_change только на стратегический change`)
  }
}

function validateProducerContextRules(changeName, changeKind, parentChange, metadata, context, errors) {
  const producerRef = parseMetadataValue(metadata, PRODUCER_REF_PATTERN) || ""

  if (!["dispatcher", "implement", "fix"].includes(changeKind)) {
    return
  }

  if (changeKind === "dispatcher") {
    const parentKind = context.changeKindsByName.get(parentChange) || ""

    if (parentKind === "producer") {
      errors.push(`${changeName}: dispatcher change не может иметь parent_change на producer`)
    }
    if (producerRef) {
      errors.push(`${changeName}: dispatcher change не может иметь producer_ref`)
    }

    return
  }

  if (parentChange && context.changeKindsByName.get(parentChange) !== "dispatcher") {
    return
  }
}

/**
 * @example
 * validateChangeKindRules("implement-demo", metadata, context)
 */
export function validateChangeKindRules(changeName, metadata, context) {
  const errors = []
  const changeKind = context.changeKindsByName.get(changeName) || ""
  const executionMode = parseMetadataValue(metadata, /^execution_mode:\s*(.+)\s*$/m)
  const parentChange = parseMetadataValue(metadata, PARENT_CHANGE_PATTERN) || ""
  const strategyRoot = parseMetadataValue(metadata, STRATEGY_ROOT_PATTERN) || ""
  const roadmapRefs = roadmapRefsFromMetadata(metadata)
  const verificationLevel = parseMetadataValue(metadata, VERIFICATION_LEVEL_PATTERN) || ""
  const verificationCommand = parseMetadataValue(metadata, VERIFICATION_COMMAND_PATTERN) || ""

  if (!changeKind) {
    return [`${changeName}: отсутствует обязательное поле change_kind`]
  }

  validateCommonRules(changeName, changeKind, executionMode, errors)
  validateReferenceRules(changeName, metadata, context, errors)
  validateStrategicKindRules(changeName, changeKind, executionMode, parentChange, context, errors)
  validateProducerRules(changeName, changeKind, parentChange, context, errors)
  validateProducerContextRules(changeName, changeKind, parentChange, metadata, context, errors)

  if (changeKind === "dispatcher") {
    validateRoadmapInheritanceRules(changeName, parentChange, strategyRoot, roadmapRefs, context, errors)
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
