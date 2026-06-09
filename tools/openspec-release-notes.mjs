import fs from "node:fs"
import path from "node:path"

const RELEASE_NOTE_ARTIFACT_RELATIVE_PATH = path.join("artifacts", "release-note.md")
const REQUIRED_RELEASE_NOTE_MARKERS = [
  "Что меняется для пользователя:",
  "Как это влияет на пользователя:",
  "Как проверить:",
]

function normalizeText(text) {
  return text.replace(/\r\n/g, "\n").trim()
}

export function getReleaseNoteArtifactPath(changesDir, changeName) {
  return path.join(changesDir, changeName, RELEASE_NOTE_ARTIFACT_RELATIVE_PATH)
}

export function getReleaseNotesPath(changesDir, releaseRef) {
  return path.join(changesDir, releaseRef, "release-notes.md")
}

export function readReleaseNoteArtifact(changesDir, changeName) {
  const artifactPath = getReleaseNoteArtifactPath(changesDir, changeName)

  if (!fs.existsSync(artifactPath)) {
    throw new Error(
      `Для release-linked change ${changeName} не найден release-note артефакт: ${artifactPath}`,
    )
  }

  const content = normalizeText(fs.readFileSync(artifactPath, "utf8"))

  if (!content) {
    throw new Error(`Release-note артефакт ${artifactPath} пуст.`)
  }

  for (const marker of REQUIRED_RELEASE_NOTE_MARKERS) {
    if (!content.includes(marker)) {
      throw new Error(
        `Release-note артефакт ${artifactPath} должен содержать секцию "${marker}"`,
      )
    }
  }

  return content
}

export function buildReleaseNotesEntry(changeName, releaseNoteContent) {
  return `### \`${changeName}\`\n\n${normalizeText(releaseNoteContent)}`
}

export function appendReleaseNoteToRelease({
  changeName,
  changesDir,
  releaseRef,
}) {
  const releaseNotesPath = getReleaseNotesPath(changesDir, releaseRef)

  if (!fs.existsSync(releaseNotesPath)) {
    throw new Error(
      `У release ${releaseRef} отсутствует release-notes.md: ${releaseNotesPath}`,
    )
  }

  const existing = fs.readFileSync(releaseNotesPath, "utf8")
  const heading = `### \`${changeName}\``

  if (existing.includes(heading)) {
    return { releaseNotesPath, status: "already-present" }
  }

  const entry = buildReleaseNotesEntry(changeName, readReleaseNoteArtifact(changesDir, changeName))
  const next = `${existing.replace(/\s*$/, "")}\n\n${entry}\n`

  fs.writeFileSync(releaseNotesPath, next, "utf8")
  return { releaseNotesPath, status: "appended" }
}
