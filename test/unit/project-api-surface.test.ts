// @openSpec capability: project-api
// @openSpec scenarios:
// @openSpec  - "Пользователь или внешняя автоматизация читает manifest через API"
// @openSpec  - "API не публикует внутренние служебные слои как отдельную ценность"

import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

function readProjectFile(...segments: string[]) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8")
}

describe("project api surface", () => {
  it("публикует manifest routes как project-owned API foundation", () => {
    const route = readProjectFile("app", "api", "projects", "manifest", "route.ts")
    const exportRoute = readProjectFile("app", "api", "projects", "manifest", "export", "route.ts")
    const importRoute = readProjectFile("app", "api", "projects", "manifest", "import", "route.ts")
    const apiModule = readProjectFile("lib", "project", "api.ts")
    const manifestModule = readProjectFile("lib", "project", "manifest.ts")

    expect(route).toContain("requireAccessOrUnauthorizedResponse")
    expect(route).toContain("createProjectManifestReadResponse")
    expect(route).toContain("createProjectManifestWriteResponse")
    expect(exportRoute).toContain("requireAccessOrUnauthorizedResponse")
    expect(exportRoute).toContain("createProjectManifestReadResponse")
    expect(exportRoute).toContain("manifest")
    expect(importRoute).toContain("requireAccessOrUnauthorizedResponse")
    expect(importRoute).toContain("createProjectManifestWriteResponse")
    expect(importRoute).toContain("manifest")
    expect(apiModule).toContain("createProjectManifestReadResponse")
    expect(apiModule).toContain("createProjectManifestWriteResponse")
    expect(manifestModule).toContain("type ProjectManifest")
    expect(manifestModule).toContain("workflow")
    expect(manifestModule).not.toContain("localStorage")
  })
})
