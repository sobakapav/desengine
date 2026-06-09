// @openSpec capability: admin-tools
// @openSpec scenarios:
// @openSpec  - "Разработчик закрывает release-linked implement/fix change"
// @openSpec  - "Release notes уже содержат запись о change"

import fs from "node:fs"
import os from "node:os"
import path from "node:path"

import { afterEach, describe, expect, it } from "vitest"

import {
  appendReleaseNoteToRelease,
  buildReleaseNotesEntry,
} from "../../tools/openspec-release-notes.mjs"

const tempDirs: string[] = []

function writeFile(filePath: string, content: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, content, "utf8")
}

describe("openspec release notes sync", () => {
  afterEach(() => {
    while (tempDirs.length > 0) {
      const dirPath = tempDirs.pop()
      if (dirPath) {
        fs.rmSync(dirPath, { recursive: true, force: true })
      }
    }
  })

  it("добавляет release-note артефакт change в release-notes релиза", () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "openspec-release-notes-"))
    tempDirs.push(fixtureRoot)

    const changesDir = path.join(fixtureRoot, "openspec", "changes")
    const releaseRef = "release-demo"
    const changeName = "fix-demo"
    const artifactContent = `- Что меняется для пользователя: страница больше не мерцает.
- Как это влияет на пользователя: результат выглядит стабильнее.
- Как проверить:
  1. Открыть страницу.
  2. Повторить действие.
  3. Убедиться, что мерцания нет.`

    writeFile(
      path.join(changesDir, releaseRef, "release-notes.md"),
      "# Release Notes\n\n## Изменения релиза\n",
    )
    writeFile(
      path.join(changesDir, changeName, "artifacts", "release-note.md"),
      `${artifactContent}\n`,
    )

    const result = appendReleaseNoteToRelease({
      changeName,
      changesDir,
      releaseRef,
    })

    const releaseNotes = fs.readFileSync(
      path.join(changesDir, releaseRef, "release-notes.md"),
      "utf8",
    )

    expect(result.status).toBe("appended")
    expect(releaseNotes).toContain(buildReleaseNotesEntry(changeName, artifactContent))
  })

  it("не дублирует запись, если change уже есть в release notes", () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "openspec-release-notes-dedupe-"))
    tempDirs.push(fixtureRoot)

    const changesDir = path.join(fixtureRoot, "openspec", "changes")
    const releaseRef = "release-demo"
    const changeName = "fix-demo"
    const artifactContent = `- Что меняется для пользователя: страница больше не мерцает.
- Как это влияет на пользователя: результат выглядит стабильнее.
- Как проверить:
  1. Открыть страницу.
  2. Повторить действие.
  3. Убедиться, что мерцания нет.`
    const entry = buildReleaseNotesEntry(changeName, artifactContent)

    writeFile(
      path.join(changesDir, releaseRef, "release-notes.md"),
      `# Release Notes\n\n## Изменения релиза\n\n${entry}\n`,
    )
    writeFile(
      path.join(changesDir, changeName, "artifacts", "release-note.md"),
      `${artifactContent}\n`,
    )

    const result = appendReleaseNoteToRelease({
      changeName,
      changesDir,
      releaseRef,
    })
    const releaseNotes = fs.readFileSync(
      path.join(changesDir, releaseRef, "release-notes.md"),
      "utf8",
    )

    expect(result.status).toBe("already-present")
    expect(releaseNotes.match(/### `fix-demo`/g)).toHaveLength(1)
  })
})
