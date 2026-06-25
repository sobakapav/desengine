import { ProjectOverviewScreen } from "@/components/desengine/project/ProjectOverviewScreen"
import { requireAccessOrRedirect } from "@/lib/auth/server"
import { readProjectHistoryDiagnostics } from "@/lib/project/history-diagnostics"
import { getProjectUrl } from "@/lib/project/navigation"
import { readProjectWorkflowReadout } from "@/lib/project/workflow-readout"
import { listTaskProjectBindings } from "@/lib/task/assignment-server"
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

  const [historyDiagnostics, taskBindings, tasks, workflowReadout] = await Promise.all([
    readProjectHistoryDiagnostics(projectId),
    listTaskProjectBindings(),
    getTasks(),
    readProjectWorkflowReadout(projectId),
  ])

  return (
    <ProjectOverviewScreen
      historyDiagnostics={historyDiagnostics}
      occupiedTaskIds={taskBindings.map((binding) => binding.taskId)}
      projectId={projectId}
      workflowTaskCatalog={tasks.map((task) => ({ taskId: task.id, taskTitle: task.id }))}
      workflowReadout={workflowReadout}
    />
  )
}
