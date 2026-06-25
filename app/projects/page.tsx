import { ProjectsScreen } from "@/components/desengine/project/ProjectsScreen"
import { requireAccessOrRedirect } from "@/lib/auth/server"
import { getProjectsRootUrl } from "@/lib/project/navigation"

export default async function ProjectsPage() {
  await requireAccessOrRedirect(getProjectsRootUrl())

  return <ProjectsScreen />
}
