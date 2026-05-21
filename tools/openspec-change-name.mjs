const DATE_SUFFIX_PATTERN = /-[0-9]{4}-[0-9]{2}-[0-9]{2}$/

function buildDateSuffixError(changeName) {
  return `${changeName}: суффикс даты в имени change не допускается. Добавьте смысловой хвост, например ${changeName}-day`
}

export function assertValidChangeName(changeName) {
  const normalized = changeName.trim()

  if (!normalized) {
    throw new Error("Имя change не может быть пустым.")
  }
  if (DATE_SUFFIX_PATTERN.test(normalized)) {
    throw new Error(buildDateSuffixError(normalized))
  }

  return normalized
}

export function normalizeCreatedChangeName(changeName) {
  return assertValidChangeName(changeName)
}

export function normalizeDispatchedChangeName(kind, name) {
  const normalizedName = name.trim()
  const candidate = normalizedName.startsWith("implement-") || normalizedName.startsWith("fix-")
    ? normalizedName
    : `${kind}-${normalizedName}`

  return assertValidChangeName(candidate)
}
