import { TasksScreen } from "@/components/desengine/task/TasksScreen"
import { requireAccessOrRedirect } from "@/lib/auth/server"
import { listTaskProjectBindings } from "@/lib/task/assignment-server"
import { getTasks } from "@/lib/task/server"
import { getTasksRootUrl } from "@/lib/task/navigation"

export default async function Page() {
  await requireAccessOrRedirect(getTasksRootUrl())
  const [tasks, bindings] = await Promise.all([
    getTasks(),
    listTaskProjectBindings(),
  ])

  return <TasksScreen tasks={tasks} bindings={bindings} />
}
