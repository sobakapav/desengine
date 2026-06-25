import "server-only"

import {
  getBaseProjectId,
  getProjectComponentId,
  listStoredTaskProjects,
  readStoredTaskProject,
} from "@/lib/task/project-runtime-scope"
import { getTasks } from "@/lib/task/server"

import type { TaskProjectBinding } from "./assignment"

async function getTaskProjectBinding(taskId: string): Promise<TaskProjectBinding | null> {
  const [tasks, project] = await Promise.all([
    getTasks(),
    readStoredTaskProject(taskId),
  ])
  const taskItem = tasks.find((item) => item.id === taskId)

  if (!taskItem || !project) {
    return null
  }

  return {
    taskId: taskItem.id,
    taskTitle: taskItem.id,
    projectId: getBaseProjectId(project.id),
    projectTitle: project.title,
    componentId: getProjectComponentId(project.id),
    source: "stored-runtime",
  }
}

async function listTaskProjectBindings(): Promise<TaskProjectBinding[]> {
  const tasks = await getTasks()
  const bindings = await Promise.all(tasks.map(async (taskItem) => {
    const projects = await listStoredTaskProjects(taskItem.id)

    return projects.map((project) => ({
      taskId: taskItem.id,
      taskTitle: taskItem.id,
      projectId: getBaseProjectId(project.id),
      projectTitle: project.title,
      componentId: getProjectComponentId(project.id),
      source: "stored-runtime",
    } satisfies TaskProjectBinding))
  }))

  return bindings.flat()
}

export {
  getTaskProjectBinding,
  listTaskProjectBindings,
}
