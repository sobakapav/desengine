"use client";

import { useState } from "react";
import type { Project } from "@/lib/project/runtime";

import type { WorkbenchProps } from "./props";
import { changeLabTaskScreenEventInput, readLabTaskScreenEventActiveScreen } from "../LabScreen/screen-event";

async function postTaskCheck(taskId: string, project: Project) {
  const res = await fetch(`/api/tasks/${taskId}/check`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ project }),
  });
  return res;
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
    if (!(await saveBeforeAction())) return;
    setCompletePending(true);
    setCompleteError("");
    const res = await postTaskCheck(props.taskItem.id, project);
    const data = await res.json().catch(() => null);
    setCompletePending(false);

    if (!res.ok || !data?.ok || !data?.checkResult || !data?.taskData) {
      setCompleteError(data?.error || "Не удалось проверить уровень");
      return;
    }

    replaceTaskData(data.taskData);
    props.onCheckResult(data.checkResult, data.transition ?? null, data.taskItem ?? null, data.taskData);
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
