import { ProjectOverviewScreen } from "@/components/desengine/project/ProjectOverviewScreen"
import { requireAccessOrRedirect } from "@/lib/auth/server"
import { getProjectUrl } from "@/lib/project/navigation"

type Params = {
  projectId: string
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { projectId } = await params
  const canonicalPath = getProjectUrl(projectId)

  await requireAccessOrRedirect(canonicalPath)

  return <ProjectOverviewScreen projectId={projectId} />
}
