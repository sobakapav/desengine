"use client";

import { useState } from "react";
import type { Project } from "@/lib/project/runtime";
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

async function postTaskCheck(taskId: string, project: Project) {
  return fetchWorkbenchActionJson<CheckSuccessBody>({
    url: `/api/tasks/${taskId}/check`,
    actionLabel: "Проверка уровня",
    fallbackError: "Не удалось проверить уровень",
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
      const error = !data?.ok ? data.error : "Не удалось проверить уровень";
      args.setCompleteError(error);
      return { kind: "error", error };
    }

    return {
      kind: "success",
      data,
    };
  } catch {
    const error = buildWorkbenchActionNetworkMessage("Не удалось проверить уровень");
    args.setCompleteError(error);
    return { kind: "error", error };
  } finally {
    args.setCompletePending(false);
  }
}

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

export function useResetAction(
  props: WorkbenchProps,
  saveBeforeAction: () => Promise<boolean>,
  replaceTaskData: (taskData: WorkbenchProps["taskData"]) => void,
  actionState: ReturnType<typeof useWorkbenchActions>,
) {
  async function runResetRequest(pathname: string, fallbackError: string) {
    if (!(await saveBeforeAction())) return false;
    actionState.setResetPending(true);
    actionState.setResetError("");

    try {
      const res = await fetch(pathname, { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) throw new Error(data?.error || fallbackError);
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
      `/api/tasks/${props.taskItem.id}/reset-level`,
      "Не удалось сбросить текущий уровень",
    );
  }

  async function handleTaskReset() {
    return runResetRequest(
      `/api/tasks/${props.taskItem.id}/reset`,
      "Не удалось сбросить задачу",
    );
  }

  return { handleLevelReset, handleTaskReset };
}

export { postTaskCheck, runCheckSubmission };
