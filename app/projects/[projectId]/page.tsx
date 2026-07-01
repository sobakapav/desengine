import { ProjectOverviewScreen } from "@/components/desengine/project/ProjectOverviewScreen"
import { requireAccessOrRedirect } from "@/lib/auth/server"
import { readProjectHistoryDiagnostics } from "@/lib/project/history-diagnostics"
import { getProjectUrl } from "@/lib/project/navigation"
import { readProjectWorkflowReadout } from "@/lib/project/workflow-readout"
import { getTasks } from "@/lib/task/server"

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

  const [historyDiagnostics, tasks, workflowReadout] = await Promise.all([
    readProjectHistoryDiagnostics(projectId),
    getTasks(),
    readProjectWorkflowReadout(projectId),
  ])

  return (
    <ProjectOverviewScreen
      historyDiagnostics={historyDiagnostics}
      projectId={projectId}
      workflowTaskCatalog={tasks.map((task) => ({ taskId: task.id, taskTitle: task.id }))}
      workflowReadout={workflowReadout}
    />
  )
}
