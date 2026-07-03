import { ProjectWorkbenchScreen } from "@/components/desengine/project/ProjectWorkbenchScreen"
import { requireAccessOrRedirect } from "@/lib/auth/server"
import { getProjectWorkbenchUrl } from "@/lib/project/navigation"

type Params = {
  projectId: string
  sessionId: string
}

/**
 * @example
 * ```tsx
 * <ProjectWorkbenchScreen projectId="project-a" sessionId="project-a--project--project-a" />
 * ```
 */
export default async function ProjectWorkbenchPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { projectId, sessionId } = await params
  const canonicalPath = getProjectWorkbenchUrl(projectId, sessionId)

  await requireAccessOrRedirect(canonicalPath)

  return <ProjectWorkbenchScreen projectId={projectId} sessionId={sessionId} />
}
