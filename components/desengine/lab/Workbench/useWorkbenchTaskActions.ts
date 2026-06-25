"use client";

import { useState } from "react";
import type { Project, ProjectMigrationTarget } from "@/lib/project/runtime";
import type { WorkbenchProps } from "./props";
import { buildWorkbenchActionNetworkMessage, fetchWorkbenchActionJson } from "./actionTimeout";
import { changeLabTaskScreenEventInput, readLabTaskScreenEventActiveScreen } from "../LabScreen/screen-event";

type CheckSuccessBody = {
  ok: true;
  checkResult: Parameters<WorkbenchProps["onCheckResult"]>[0];
  taskData: WorkbenchProps["taskData"];
  transition?: Parameters<WorkbenchProps["onTransition"]>[0];
  taskItem?: WorkbenchProps["taskItem"] | null;
};

type CheckRunOutcome = {
  kind: "success";
  data: CheckSuccessBody;
} | {
  kind: "error";
  error: string;
};

type ProjectMigrationSuccessBody = {
  ok: true;
  invalidationScope: "current-level";
  taskData: WorkbenchProps["taskData"];
  taskItem?: WorkbenchProps["taskItem"] | null;
};

async function postTaskCheck(taskId: string, project: Project) {
  return fetchWorkbenchActionJson<CheckSuccessBody>({
    url: `/api/tasks/${taskId}/check`,
    actionLabel: "Проверка результата",
    fallbackError: "Не удалось запустить проверку результата",
    init: {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ project }),
    },
  });
}

async function postProjectMigration(taskId: string, project: Project, target: ProjectMigrationTarget) {
  return fetchWorkbenchActionJson<ProjectMigrationSuccessBody>({
    url: `/api/tasks/${taskId}/project-migration`,
    actionLabel: "Переключение UI kit проекта",
    fallbackError: "Не удалось переключить UI kit проекта",
    init: {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ project, target }),
    },
  });
}

async function postTaskReset(taskId: string, project: Project, scope: "task" | "level") {
  return fetchWorkbenchActionJson<{
    ok: true;
    taskData?: WorkbenchProps["taskData"] | null;
    taskItem?: WorkbenchProps["taskItem"] | null;
    started?: boolean;
  }>({
    url: scope === "level"
      ? `/api/tasks/${taskId}/reset-level`
      : `/api/tasks/${taskId}/reset`,
    actionLabel: scope === "level" ? "Сброс уровня" : "Сброс задачи",
    fallbackError: scope === "level" ? "Не удалось сбросить текущий уровень" : "Не удалось сбросить задачу",
    init: {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ project }),
    },
  });
}

async function runCheckSubmission(args: {
  taskId: string;
  project: Project;
  saveBeforeAction: (targetFileIds?: string[]) => Promise<boolean>;
  setCompletePending: (pending: boolean) => void;
  setCompleteError: (error: string) => void;
  postTaskCheckImpl?: typeof postTaskCheck;
}): Promise<CheckRunOutcome | null> {
  if (!(await args.saveBeforeAction())) return null;

  args.setCompletePending(true);
  args.setCompleteError("");

  try {
    const postTaskCheckImpl = args.postTaskCheckImpl ?? postTaskCheck;
    const data = await postTaskCheckImpl(args.taskId, args.project);

    if (!data?.ok || !data?.checkResult || !data?.taskData) {
      const error = !data?.ok ? data.error : "Не удалось запустить проверку результата";
      args.setCompleteError(error);
      return { kind: "error", error };
    }

    return {
      kind: "success",
      data,
    };
  } catch {
    const error = buildWorkbenchActionNetworkMessage("Не удалось запустить проверку результата");
    args.setCompleteError(error);
    return { kind: "error", error };
  } finally {
    args.setCompletePending(false);
  }
}

/**
 * @example
 * ```ts
 * const actions = useWorkbenchActions(props, project, saveBeforeAction, replaceTaskData)
 * await actions.handleCheck()
 * ```
 */
export function useWorkbenchActions(
  props: WorkbenchProps,
  project: Project,
  saveBeforeAction: (targetFileIds?: string[]) => Promise<boolean>,
  replaceTaskData: (taskData: WorkbenchProps["taskData"]) => void,
) {
  const [completePending, setCompletePending] = useState(false);
  const [completeError, setCompleteError] = useState("");
  const [resetPending, setResetPending] = useState(false);
  const [resetError, setResetError] = useState("");

  async function handleCheck() {
    const outcome = await runCheckSubmission({
      taskId: props.taskItem.id,
      project,
      saveBeforeAction,
      setCompletePending,
      setCompleteError,
    });

    if (!outcome || outcome.kind !== "success") return;

    replaceTaskData(outcome.data.taskData);
    props.onCheckResult(
      outcome.data.checkResult,
      outcome.data.transition ?? null,
      outcome.data.taskItem ?? null,
      outcome.data.taskData,
    );
  }

  return { completeError, completePending, handleCheck, resetError, resetPending, setResetError, setResetPending };
}

/**
 * @example
 * ```ts
 * const reset = useResetAction(props, project, saveBeforeAction, replaceTaskData, actionState)
 * await reset.handleLevelReset()
 * ```
 */
export function useResetAction(
  props: WorkbenchProps,
  project: Project,
  saveBeforeAction: () => Promise<boolean>,
  replaceTaskData: (taskData: WorkbenchProps["taskData"]) => void,
  actionState: ReturnType<typeof useWorkbenchActions>,
) {
  async function runResetRequest(scope: "task" | "level", fallbackError: string) {
    if (!(await saveBeforeAction())) return false;
    actionState.setResetPending(true);
    actionState.setResetError("");

    try {
      const data = await postTaskReset(props.taskItem.id, project, scope);
      if (!data?.ok) throw new Error(data?.error || fallbackError);
      if (data.taskItem) props.onTaskItemChange(data.taskItem);
      if (data.taskData) replaceTaskData(data.taskData);
      props.onTransition(null);
      props.onScreenEventChange(changeLabTaskScreenEventInput({
        taskId: props.screenEvent.scope.taskId,
        activeScreen: readLabTaskScreenEventActiveScreen(props.screenEvent),
      }, "component"));
      return true;
    } catch (error) {
      actionState.setResetError(error instanceof Error ? error.message : fallbackError);
      return false;
    } finally {
      actionState.setResetPending(false);
    }
  }

  async function handleLevelReset() {
    return runResetRequest(
      "level",
      "Не удалось сбросить текущий уровень",
    );
  }

  async function handleTaskReset() {
    return runResetRequest(
      "task",
      "Не удалось сбросить задачу",
    );
  }

  return { handleLevelReset, handleTaskReset };
}

export { postTaskCheck, postTaskReset, runCheckSubmission };
export { postProjectMigration };
