export type TaskProjectBindingSource = "stored-runtime"

export type TaskProjectBinding = {
  taskId: string
  taskTitle: string
  projectId: string
  projectTitle: string
  source: TaskProjectBindingSource
}

function filterTaskProjectBindingsForProject(bindings: TaskProjectBinding[], projectId: string) {
  return bindings.filter((binding) => binding.projectId === projectId)
}

function indexTaskProjectBindings(bindings: TaskProjectBinding[]) {
  return Object.fromEntries(bindings.map((binding) => [binding.taskId, binding] as const))
}

export {
  filterTaskProjectBindingsForProject,
  indexTaskProjectBindings,
}
