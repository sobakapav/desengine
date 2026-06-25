import { TasksScreen } from "@/components/desengine/task/TasksScreen"
import { requireAccessOrRedirect } from "@/lib/auth/server"
import { listTaskProjectBindings } from "@/lib/task/assignment-server"
import { getTasksRootUrl } from "@/lib/task/navigation"
import { getTasks } from "@/lib/task/server"

export default async function Page() {
  await requireAccessOrRedirect(getTasksRootUrl())
  const [tasks, bindings] = await Promise.all([
    getTasks(),
    listTaskProjectBindings(),
  ])

  return <TasksScreen tasks={tasks} bindings={bindings} />
}
