import {
  exportProjectManifest,
  importProjectManifest,
  type ProjectManifest,
  type RawProjectManifest,
} from "@/lib/project/manifest"
import type { ProjectComponent } from "@/lib/project/component-runtime"
import type { ProjectWorkspace } from "@/lib/project/runtime"
import type { ProjectSession, ProjectWorkspaceActivity } from "@/lib/project/workspace-session"

type ProjectManifestReadRequest = {
  project: ProjectWorkspace
  components?: ProjectComponent[] | null
  session?: ProjectSession | null
  activities?: ProjectWorkspaceActivity[] | null
}

type ProjectManifestReadResponse = {
  ok: true
  manifest: ProjectManifest
}

type ProjectManifestWriteResponse = {
  ok: true
  manifest: ProjectManifest
}

/**
 * @example
 * ```ts
 * const response = createProjectManifestReadResponse({
 *   project,
 *   components: [],
 * })
 * ```
 */
function createProjectManifestReadResponse(request: ProjectManifestReadRequest): ProjectManifestReadResponse {
  return {
    ok: true,
    manifest: exportProjectManifest(request),
  }
}

/**
 * @example
 * ```ts
 * const response = createProjectManifestWriteResponse({
 *   project: { id: "project-a", title: "Альфа" },
 * })
 * ```
 */
function createProjectManifestWriteResponse(manifest: unknown): ProjectManifestWriteResponse {
  return {
    ok: true,
    manifest: importProjectManifest(manifest as RawProjectManifest),
  }
}

export {
  createProjectManifestReadResponse,
  createProjectManifestWriteResponse,
}

export type {
  ProjectManifestReadRequest,
  ProjectManifestReadResponse,
  ProjectManifestWriteResponse,
}
