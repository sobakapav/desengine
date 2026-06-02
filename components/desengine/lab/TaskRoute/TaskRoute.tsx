"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Workbench } from "../Workbench";
import { TaskLevelStart } from "../../task/TaskLevelStart";
import { createTaskCheckPath, createTaskDonePath } from "@/lib/task/navigation";
import { getLabUrl } from "@/lib/lab/navigation";
import { getLevelUrl } from "@/lib/level/navigation";
import type { TaskCheckResult, TaskData, TaskListItem, TaskTransition } from "@/lib/task/types";
import {
    buildLabTaskScreenEvent,
    changeLabTaskScreenEventInput,
    createLabTaskScreenEventInput,
    syncLabTaskScreenEventInput,
    type LabTaskScreenEventInput,
} from "../LabScreen/screen-event";

type TaskRouteProps = {
    initTaskItem: TaskListItem;
    initTaskData: TaskData;
};

function TaskRoute({ initTaskItem, initTaskData }: TaskRouteProps) {
    const router = useRouter();
    const [taskItem, setTaskItem] = useState(initTaskItem);
    const [taskData, setTaskData] = useState(initTaskData);
    const [startStatus, setStartStatus] = useState<"" | "starting">("");
    const [startError, setStartError] = useState("");
    const [screenInput, setScreenInput] = useState(() => createLabTaskScreenEventInput(
        initTaskItem.id,
        initTaskData.labContext?.editableFileIds[0] ?? "component",
    ));

    const taskScreenEvent = useMemo(() => buildLabTaskScreenEvent({
        input: syncLabTaskScreenEventInput({
            activeScreen: screenInput.activeScreen,
            fallbackTaskId: taskItem.id,
            input: screenInput,
        }),
        levelNumber: taskItem.progress.currentLevel,
    }), [screenInput, taskItem.id, taskItem.progress.currentLevel]);

    async function handleLevelStart() {
        setStartStatus("starting");
        setStartError("");

        const res = await fetch(`/api/tasks/${taskItem.id}/start`, { method: "POST" });
        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.ok) {
            setStartError(data?.error || "Не удалось запустить уровень");
            setStartStatus("");
            return;
        }

        if (data.taskItem) {
            setTaskItem(data.taskItem);
        }
        if (data.taskData) {
            setTaskData(data.taskData);
        }
        setStartStatus("");
    }

    function handleCheckResult(
        result: TaskCheckResult,
        _transition: TaskTransition | null,
        _nextTaskItem: TaskListItem | null,
        _nextTaskData: TaskData,
    ) {
        router.push(createTaskCheckPath(result.taskId));
    }

    function handleTransition(transition: TaskTransition | null) {
        if (!transition) return;

        router.push(
            transition.toLevel
                ? getLabUrl(transition.taskId)
                : createTaskDonePath(transition.taskId),
        );
    }

    function handleScreenEventChange(nextInput: LabTaskScreenEventInput) {
        setScreenInput((current) => changeLabTaskScreenEventInput(current, nextInput.activeScreen));
    }

    if (!taskItem.progress.currentLevelStarted) {
        return (
            <TaskLevelStart
                taskItem={taskItem}
                taskData={taskData}
                startStatus={startStatus}
                startError={startError}
                onStart={() => void handleLevelStart()}
                onBackToLevelList={() => router.push(getLevelUrl(taskItem.progress.currentLevelId))}
            />
        );
    }

    return (
        <Workbench
            taskItem={taskItem}
            taskData={taskData}
            onTaskItemChange={(next) => {
                if (next) {
                    setTaskItem(next);
                }
            }}
            onTaskDataChange={setTaskData}
            onBackToLevelList={() => router.push(getLevelUrl(taskItem.progress.currentLevelId))}
            onCheckResult={handleCheckResult}
            onTransition={handleTransition}
            screenEvent={taskScreenEvent}
            onScreenEventChange={handleScreenEventChange}
        />
    );
}

export { TaskRoute };
