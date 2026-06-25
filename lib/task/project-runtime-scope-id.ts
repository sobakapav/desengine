import { normalizeProject, type Project } from "@/lib/project/runtime"

const PROJECT_COMPONENT_SCOPE_SEPARATOR = "::component::"

function buildProjectComponentRuntimeId(projectId: string, componentId: string) {
  return `${projectId.trim()}${PROJECT_COMPONENT_SCOPE_SEPARATOR}${componentId.trim()}`
}

function parseProjectComponentRuntimeId(runtimeProjectId: string) {
  const [projectId, componentId] = runtimeProjectId.split(PROJECT_COMPONENT_SCOPE_SEPARATOR)

  if (!projectId?.trim()) {
    return {
      projectId: runtimeProjectId.trim(),
      componentId: null,
    }
  }

  return {
    projectId: projectId.trim(),
    componentId: componentId?.trim() || null,
  }
}

function buildProjectComponentRuntimeProject(project: Project, componentId: string) {
  return normalizeProject({
    ...project,
    id: buildProjectComponentRuntimeId(project.id, componentId),
  })
}

export {
  buildProjectComponentRuntimeId,
  buildProjectComponentRuntimeProject,
  parseProjectComponentRuntimeId,
}
