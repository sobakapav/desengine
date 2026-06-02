"use client";

import { Workbench } from "../Workbench";
import { LevelOverview } from "../../level/LevelOverview";
import { TaskCheckResult } from "../../task/TaskCheckResult";
import { TaskDone } from "../../task/TaskDone";
import { TaskLevelStart } from "../../task/TaskLevelStart";
import { TaskLevelTransition } from "../../task/TaskLevelTransition";
import { createTaskDonePath } from "@/lib/task/navigation";
import { getLabUrl } from "@/lib/lab/navigation";
import { normalizeProject, type Project } from "@/lib/project/runtime";
import { createBrowserProjectStorage } from "@/lib/project/storage";
import type { LevelOverview as LevelOverviewData } from "@/lib/level/types";
import type { TaskCheckResult as TaskCheckResultData, TaskData, TaskListItem, TaskTransition } from "@/lib/task/types";
import type { LabScreenState } from "./states";
import type { LabTaskScreenEvent, LabTaskScreenEventInput } from "./screen-event";

type RouterLike = {
    push: (href: string) => void;
}

type CheckResultHandler = (
    result: TaskCheckResultData,
    transition: TaskTransition | null,
    nextTaskItem: TaskListItem | null,
    nextTaskData: TaskData,
) => void;

async function readStoredProject(taskId: string): Promise<Project> {
    const fallbackProject = normalizeProject({
        id: `task-${taskId}`,
        title: `Проект ${taskId}`,
    });

    try {
        const storage = createBrowserProjectStorage({ storage: window.localStorage, taskId });
        const project = await storage.getProject(`task-${taskId}`);
        return project ?? fallbackProject;
    } catch {
        return fallbackProject;
    }
}

async function fetchTaskCheck(taskId: string) {
    const res = await fetch(`/api/tasks/${taskId}/check`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ project: await readStoredProject(taskId) }),
    });
    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok || !data?.checkResult || !data?.taskData) {
        throw new Error(data?.error || "Не удалось повторить проверку");
    }

    return data as {
        checkResult: TaskCheckResultData;
        taskData: TaskData;
        taskItem?: TaskListItem | null;
        transition?: TaskTransition | null;
    };
}

function StatusNotice({ status }: { status: string }) {
    return status ? <p className="text-muted-foreground">{status}</p> : null;
}

function LevelScreenSection({
    handleNavigateLevel,
    handleTaskOpen,
    levelOverview,
    status,
}: {
    handleNavigateLevel: (levelId: string) => void;
    handleTaskOpen: (taskId: string) => void;
    levelOverview: LevelOverviewData;
    status: string;
}) {
    return (
        <LevelOverview
            overview={levelOverview}
            pending={status.length > 0}
            onOpenTask={handleTaskOpen}
            onNavigateLevel={handleNavigateLevel}
        />
    );
}

function TransitionScreenSection({
    handleReturnToLevelList,
    router,
    screen,
    setScreen,
    status,
    taskItem,
}: {
    handleReturnToLevelList: (levelId?: string) => void;
    router: RouterLike;
    screen: Extract<LabScreenState, { type: "transition" }>;
    setScreen: (screen: LabScreenState) => void;
    status: string;
    taskItem: TaskListItem | null;
}) {
    return (
        <TaskLevelTransition
            transition={screen.transition}
            started={taskItem?.started ?? false}
            pending={status.length > 0}
            onContinue={() => {
                router.push(getLabUrl(screen.transition.taskId));
                setScreen({ type: "task", screen: "component" });
            }}
            onBackToLevelList={() => handleReturnToLevelList(screen.transition.toLevel?.id)}
        />
    );
}

function DoneScreenSection({
    handleReturnToLevelList,
    router,
    screen,
    setScreen,
    status,
    taskItem,
}: {
    handleReturnToLevelList: (levelId?: string) => void;
    router: RouterLike;
    screen: Extract<LabScreenState, { type: "done" }>;
    setScreen: (screen: LabScreenState) => void;
    status: string;
    taskItem: TaskListItem | null;
}) {
    return (
        <TaskDone
            transition={screen.transition}
            started={taskItem?.started ?? false}
            pending={status.length > 0}
            onOpenTask={() => {
                router.push(getLabUrl(screen.transition.taskId));
                setScreen({ type: "task", screen: "component" });
            }}
            onBackToTaskList={() => handleReturnToLevelList()}
        />
    );
}

function CheckScreenSection({
    applyDeferredTaskState,
    handleCheckResult,
    handleReturnToLevelList,
    router,
    screen,
    setScreen,
    setStatus,
    status,
    taskItem,
}: {
    applyDeferredTaskState: (nextTaskItem: TaskListItem | null, nextTaskData: TaskData | null) => void;
    handleCheckResult: CheckResultHandler;
    handleReturnToLevelList: (levelId?: string) => void;
    router: RouterLike;
    screen: Extract<LabScreenState, { type: "check" }>;
    setScreen: (screen: LabScreenState) => void;
    setStatus: (status: string) => void;
    status: string;
    taskItem: TaskListItem | null;
}) {
    return (
        <TaskCheckResult
            result={screen.result}
            transition={screen.transition}
            pending={status.length > 0}
            onContinue={() => handleCheckContinue({ applyDeferredTaskState, handleReturnToLevelList, router, screen, setScreen, taskItem })}
            onBackToLab={() => {
                if (!taskItem) return;
                applyDeferredTaskState(screen.nextTaskItem, screen.nextTaskData);
                router.push(getLabUrl(taskItem.id));
                setScreen({ type: "task", screen: "component" });
            }}
            onRetry={() => void handleRetry({ handleCheckResult, setStatus, taskItem })}
        />
    );
}

function handleCheckContinue({
    applyDeferredTaskState,
    handleReturnToLevelList,
    router,
    screen,
    setScreen,
    taskItem,
}: {
    applyDeferredTaskState: (nextTaskItem: TaskListItem | null, nextTaskData: TaskData | null) => void;
    handleReturnToLevelList: (levelId?: string) => void;
    router: RouterLike;
    screen: Extract<LabScreenState, { type: "check" }>;
    setScreen: (screen: LabScreenState) => void;
    taskItem: TaskListItem | null;
}) {
    if (screen.transition?.toLevel) {
        applyDeferredTaskState(screen.nextTaskItem, screen.nextTaskData);
        router.push(getLabUrl(screen.transition.taskId));
        setScreen({ type: "task", screen: "component" });
        return;
    }

    if (screen.transition) {
        applyDeferredTaskState(screen.nextTaskItem, screen.nextTaskData);
        router.push(createTaskDonePath(screen.transition.taskId));
        setScreen({ type: "done", transition: screen.transition });
        return;
    }

    applyDeferredTaskState(screen.nextTaskItem, screen.nextTaskData);
    void handleReturnToLevelList(taskItem?.progress.currentLevelId);
}

async function handleRetry({
    handleCheckResult,
    setStatus,
    taskItem,
}: {
    handleCheckResult: CheckResultHandler;
    setStatus: (status: string) => void;
    taskItem: TaskListItem | null;
}) {
    if (!taskItem) return;

    try {
        setStatus("Повторная проверка уровня…");
        const data = await fetchTaskCheck(taskItem.id);
        setStatus("");
        handleCheckResult(data.checkResult, data.transition ?? null, data.taskItem ?? null, data.taskData);
    } catch (error) {
        setStatus(error instanceof Error ? error.message : "Не удалось повторить проверку");
    }
}

function TaskScreenSection({
    handleCheckResult,
    handleLevelStart,
    handleReturnToLevelList,
    handleTaskItemChange,
    handleTransition,
    onScreenEventChange,
    screenEvent,
    setTaskData,
    startError,
    startStatus,
    taskData,
    taskItem,
}: {
    handleCheckResult: CheckResultHandler;
    handleLevelStart: () => void;
    handleReturnToLevelList: (levelId?: string) => void;
    handleTaskItemChange: (next: TaskListItem | null) => void;
    handleTransition: (transition: TaskTransition | null) => void;
    onScreenEventChange: (next: LabTaskScreenEventInput) => void;
    screenEvent: LabTaskScreenEvent;
    setTaskData: (taskData: TaskData) => void;
    startError: string;
    startStatus: "" | "starting";
    taskData: TaskData | null;
    taskItem: TaskListItem | null;
}) {
    if (!taskItem || !taskData) {
        return null;
    }

    return taskItem.progress.currentLevelStarted ? (
        <Workbench
            taskItem={taskItem}
            taskData={taskData}
            onTaskItemChange={handleTaskItemChange}
            onTaskDataChange={setTaskData}
            onBackToLevelList={() => handleReturnToLevelList(taskItem.progress.currentLevelId)}
            onCheckResult={handleCheckResult}
            onTransition={handleTransition}
            screenEvent={screenEvent}
            onScreenEventChange={onScreenEventChange}
        />
    ) : (
        <TaskLevelStart
            taskItem={taskItem}
            taskData={taskData}
            startStatus={startStatus}
            startError={startError}
            onStart={() => void handleLevelStart()}
            onBackToLevelList={() => handleReturnToLevelList(taskItem.progress.currentLevelId)}
        />
    );
}

export {
    CheckScreenSection,
    DoneScreenSection,
    LevelScreenSection,
    StatusNotice,
    TaskScreenSection,
    TransitionScreenSection,
}
