"use client"

import {
  completeProjectUiKitMigration,
  failProjectUiKitMigration,
  getProjectMigrationTarget,
  normalizeProject,
  projectNeedsUiKitMigration,
  startProjectUiKitMigration,
  type Project,
} from "@/lib/project/runtime"

import type { WorkbenchProps } from "./props"
import { postProjectMigration } from "./useWorkbenchTaskActions"
import { fetchTaskScopeSnapshot } from "./projectScopeShared"
import { changeLabTaskScreenEventInput, readLabTaskScreenEventActiveScreen } from "../LabScreen/screen-event"

type TaskScopeRuntimeArgs = {
  projectState: {
    project: Project
    persistProject: (nextProject: Project, options?: { bumpPreview?: boolean }) => Project
    createProject: (title: string) => Promise<Project | null>
    selectProject: (projectId: string) => Promise<Project | null>
    setProjectActionError: (error: string) => void
    setProjectActionPending: (pending: boolean) => void
  }
  props: Pick<WorkbenchProps, "onScreenEventChange" | "onTaskItemChange" | "screenEvent" | "taskItem">
  replaceTaskData: (taskData: WorkbenchProps["taskData"]) => void
  saveBeforeAction: (targetFileIds?: string[]) => Promise<boolean>
}

/**
 * @example
 * ```ts
 * await rehydrateTaskScopeRuntime(runtimeArgs, nextProject, previousProjectId)
 * ```
 */
export async function rehydrateTaskScopeRuntime(
  args: TaskScopeRuntimeArgs,
  nextProject: Project,
  previousProjectId?: string,
) {
  try {
    const data = await fetchTaskScopeSnapshot(args.props.taskItem.id, nextProject)
    args.replaceTaskData(data.taskData)
    args.props.onTaskItemChange(data.taskItem)
    args.props.onScreenEventChange(changeLabTaskScreenEventInput({
      taskId: args.props.screenEvent.scope.taskId,
      activeScreen: readLabTaskScreenEventActiveScreen(args.props.screenEvent),
    }, "component"))
    return true
  } catch (error) {
    if (previousProjectId && previousProjectId !== nextProject.id) {
      await args.projectState.selectProject(previousProjectId)
    }

    args.projectState.setProjectActionError(
      error instanceof Error
        ? error.message
        : "Не удалось переключить project scope без смешивания данных задачи.",
    )
    return false
  }
}

/**
 * @example
 * ```ts
 * await handleProjectSelection(runtimeArgs, "project-2")
 * ```
 */
export async function handleProjectSelection(args: TaskScopeRuntimeArgs, projectId: string) {
  if (args.projectState.project.id === projectId) {
    return
  }

  const previousProjectId = args.projectState.project.id
  if (!(await args.saveBeforeAction())) {
    return
  }

  const switchedProject = await args.projectState.selectProject(projectId)
  if (!switchedProject || switchedProject.id === previousProjectId) {
    return
  }

  await rehydrateTaskScopeRuntime(args, switchedProject, previousProjectId)
}

/**
 * @example
 * ```ts
 * const ok = await handleProjectCreation(runtimeArgs, "Alpha")
 * ```
 */
export async function handleProjectCreation(args: TaskScopeRuntimeArgs, title: string) {
  const previousProjectId = args.projectState.project.id
  if (!(await args.saveBeforeAction())) {
    return false
  }

  const createdProject = await args.projectState.createProject(title)
  if (!createdProject) {
    return false
  }

  return rehydrateTaskScopeRuntime(args, createdProject, previousProjectId)
}

/**
 * @example
 * ```ts
 * await migrateProjectUiKitInScope(runtimeArgs, "ant")
 * ```
 */
export async function migrateProjectUiKitInScope(
  args: TaskScopeRuntimeArgs,
  nextUiKitId: Project["settings"]["uiKitId"],
) {
  const target = getProjectMigrationTarget(nextUiKitId)
  if (!projectNeedsUiKitMigration(args.projectState.project, target)) {
    args.projectState.persistProject(normalizeProject({
      ...args.projectState.project,
      migration: undefined,
    }), { bumpPreview: false })
    return true
  }

  const pendingProject = args.projectState.persistProject(
    startProjectUiKitMigration(args.projectState.project, target),
    { bumpPreview: false },
  )
  args.projectState.setProjectActionPending(true)
  args.projectState.setProjectActionError("")

  try {
    const data = await postProjectMigration(args.props.taskItem.id, pendingProject, target)
    if (!data?.ok || !data.taskItem || !data.taskData) {
      throw new Error(!data?.ok ? data.error : "Не удалось переключить UI kit проекта")
    }

    args.replaceTaskData(data.taskData)
    args.props.onTaskItemChange(data.taskItem)
    args.projectState.persistProject(completeProjectUiKitMigration(pendingProject, target, {
      invalidationScope: "current-level",
      requiresReplay: true,
      message: `Переключение UI kit завершено: проект переведён на ${target.uiKitId}, текущую работу нужно пройти заново.`,
    }))
    return true
  } catch (error) {
    args.projectState.persistProject(failProjectUiKitMigration(
      pendingProject,
      target,
      error instanceof Error ? error.message : "Не удалось переключить UI kit проекта",
    ), { bumpPreview: false })
    args.projectState.setProjectActionError(error instanceof Error ? error.message : "Не удалось переключить UI kit проекта")
    return false
  } finally {
    args.projectState.setProjectActionPending(false)
  }
}
