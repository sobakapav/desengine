"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { normalizeProject, type Project } from "@/lib/project/runtime";
import { createBrowserProjectStorage } from "@/lib/project/storage";
import type { LevelOverview as LevelOverviewData } from "@/lib/level/types"
import type { TaskCheckResult as TaskCheckResultData, TaskData, TaskListItem, TaskTransition } from "@/lib/task/types";
import { createTaskDonePath, } from "@/lib/task/navigation";
import { getLabUrl } from "@/lib/lab/navigation";
import { getLevelsRootUrl, getLevelUrl } from "@/lib/level/navigation";

import { LabProps } from "./props"
import { LabScreenState } from "./states"
import {
    buildLabTaskScreenEvent,
    createLabTaskScreenEventInput,
    syncLabTaskScreenEventInput,
} from "./screen-event"
import {
    CheckScreenSection,
    DoneScreenSection,
    LevelScreenSection,
    StatusNotice,
    TaskScreenSection,
    TransitionScreenSection,
} from "./ScreenSections"
import { buildTaskOpenUrl, postTaskStart, readProjectFromTaskUrl } from "../task-client-boundary"

function createDoneHref(taskId: string) {
    return createTaskDonePath(taskId);
}

async function readStoredProject(taskId: string): Promise<Project> {
    const urlProject = readProjectFromTaskUrl(taskId);
    if (urlProject) {
        return urlProject;
    }

    const fallbackProject = normalizeProject({
        id: `task-${taskId}`,
        title: `Проект ${taskId}`,
    });

    try {
        const storage = createBrowserProjectStorage({ storage: window.localStorage, taskId });
        const activeProjectId = await storage.getActiveProjectId();
        const project = await storage.getProject(activeProjectId ?? `task-${taskId}`);
        return project ?? fallbackProject;
    } catch {
        return fallbackProject;
    }
}

function replaceTaskUrl(taskId: string, screen?: string | null) {
    if (typeof window === "undefined") {
        return;
    }

    const nextHref = getLabUrl(taskId, screen, readProjectFromTaskUrl(taskId) ?? undefined);
    const currentHref = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (currentHref !== nextHref) {
        window.history.replaceState(window.history.state, "", nextHref);
    }
}

function useLevelOverviewState(initLevelOverview: LevelOverviewData) {
    const [levelOverview, setLevelOverview] = useState<LevelOverviewData>(initLevelOverview);
    const [status, setStatus] = useState<string>("");

    async function loadLevelOverview(levelId?: string, options?: { silent?: boolean }) {
        const ref = levelId ? `/api/levels/${levelId}` : "/api/levels/current";
        if (!options?.silent) {
            setStatus("Загрузка уровня…");
        }
        const res = await fetch(ref, { method: "GET" });
        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.ok) {
            setStatus(data?.error || "Ошибка загрузки уровня");
            return null;
        }

        setLevelOverview(data.overview);
        setStatus("");
        return data.overview as LevelOverviewData;
    }

    return { levelOverview, loadLevelOverview, setStatus, status };
}

function useTaskState(initTaskItem: TaskListItem | null, initTaskData: TaskData | null) {
    const [taskItem, setTaskItem] = useState(initTaskItem);
    const [taskData, setTaskData] = useState(initTaskData);

    function handleTaskItemChange(next: TaskListItem | null) {
        if (next) setTaskItem(next);
    }

    return { handleTaskItemChange, setTaskData, setTaskItem, taskData, taskItem };
}

function useLevelStarter({
    setTaskData,
    setTaskItem,
    taskItem,
}: Pick<ReturnType<typeof useTaskState>, "setTaskData" | "setTaskItem" | "taskItem">) {
    const [startStatus, setStartStatus] = useState<"" | "starting">("");
    const [startError, setStartError] = useState("");

    async function handleLevelStart() {
        if (!taskItem) return;
        setStartStatus("starting");
        setStartError("");

        const project = await readStoredProject(taskItem.id);
        const res = await postTaskStart(taskItem.id, project);
        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.ok) {
            setStartError(data?.error || "Не удалось запустить уровень");
            setStartStatus("");
            return;
        }

        if (data.taskItem) setTaskItem(data.taskItem);
        if (data.taskData) setTaskData(data.taskData);
        setStartStatus("");
    }

    return { handleLevelStart, startError, startStatus };
}

function useLevelNavigation({
    loadLevelOverview,
    setScreen,
    setStatus,
    taskItem,
}: Pick<ReturnType<typeof useLevelOverviewState>, "loadLevelOverview" | "setStatus"> & {
    setScreen: (screen: LabScreenState) => void;
    taskItem: TaskListItem | null;
}) {
    const router = useRouter();

    async function handleNavigateLevel(levelId: string) {
        router.push(getLevelUrl(levelId));
        setScreen({ type: "level" });
        setStatus("");
        void loadLevelOverview(levelId, { silent: true });
    }

    async function handleReturnToLevelList(levelId?: string) {
        router.push(levelId ? getLevelUrl(levelId) : getLevelsRootUrl());
        setScreen({ type: "level" });
        setStatus("");
        void loadLevelOverview(levelId, { silent: true });
    }

    function handleScreenChange(nextScreen: string) {
        if (!taskItem) return;
        replaceTaskUrl(taskItem.id, nextScreen);
        setScreen({ type: "task", screen: nextScreen });
    }

    return { handleNavigateLevel, handleReturnToLevelList, handleScreenChange, router };
}

function useTaskLoader({
    router,
    setScreen,
    setStatus,
    setTaskData,
    setTaskItem,
}: Pick<ReturnType<typeof useLevelNavigation>, "router"> & Pick<ReturnType<typeof useLevelOverviewState>, "setStatus"> & Pick<ReturnType<typeof useTaskState>, "setTaskData" | "setTaskItem"> & {
    setScreen: (screen: LabScreenState) => void;
}) {
    async function handleTaskOpen(taskId: string) {
        setStatus("Загрузка задания…");
        router.push(getLabUrl(taskId));

        const project = await readStoredProject(taskId);
        const res = await fetch(buildTaskOpenUrl(taskId, project), { method: "GET" });
        const data = await res.json();

        if (!data?.ok) {
            setStatus(data?.error || "Ошибка загрузки задания");
            return;
        }

        setTaskItem(data.taskItem);
        setTaskData(data.taskData);
        setScreen({ type: "task", screen: "component" });
        setStatus("");
    }

    return { handleTaskOpen };
}

function useTaskResultHandlers({
    router,
    setScreen,
    setTaskData,
    setTaskItem,
}: Pick<ReturnType<typeof useLevelNavigation>, "router"> & Pick<ReturnType<typeof useTaskState>, "setTaskData" | "setTaskItem"> & {
    setScreen: (screen: LabScreenState) => void;
}) {
    function applyDeferredTaskState(nextTaskItem: TaskListItem | null, nextTaskData: TaskData | null) {
        if (nextTaskItem) {
            setTaskItem(nextTaskItem);
        }

        if (nextTaskData) {
            setTaskData(nextTaskData);
        }
    }

    function handleTransition(transition: TaskTransition | null) {
        if (!transition) return;
        router.push(transition.toLevel ? getLabUrl(transition.taskId) : createDoneHref(transition.taskId));
        setScreen(transition.toLevel ? { type: "task", screen: "component" } : { type: "done", transition });
    }

    function handleCheckResult(result: TaskCheckResultData, transition: TaskTransition | null, nextTaskItem: TaskListItem | null, nextTaskData: TaskData) {
        setScreen({
            type: "check",
            result,
            transition,
            nextTaskItem,
            nextTaskData,
        });
    }

    return { applyDeferredTaskState, handleCheckResult, handleTransition };
}

function Lab({initLevelOverview, initScreen, initTaskItem, initTaskData, initTaskScreenEventInput} : LabProps) {
    const [screen, setScreen] = useState<LabScreenState>(initScreen);
    const { levelOverview, loadLevelOverview, setStatus, status } = useLevelOverviewState(initLevelOverview);
    const taskState = useTaskState(initTaskItem, initTaskData);
    const navigation = useLevelNavigation({ loadLevelOverview, setScreen, setStatus, taskItem: taskState.taskItem });
    const starter = useLevelStarter(taskState);
    const taskLoader = useTaskLoader({ ...navigation, setScreen, setStatus, setTaskData: taskState.setTaskData, setTaskItem: taskState.setTaskItem });
    const taskResults = useTaskResultHandlers({ ...navigation, setScreen, setTaskData: taskState.setTaskData, setTaskItem: taskState.setTaskItem });
    const taskScreenEventInput = useMemo(() => {
        if (screen.type !== "task") {
            return null;
        }

        const fallbackTaskId = taskState.taskItem?.id ?? taskState.taskData?.taskId ?? initTaskScreenEventInput?.taskId ?? "";
        return syncLabTaskScreenEventInput({
            activeScreen: screen.screen,
            fallbackTaskId,
            input: initTaskScreenEventInput ?? createLabTaskScreenEventInput(fallbackTaskId, screen.screen),
        });
    }, [initTaskScreenEventInput, screen, taskState.taskData?.taskId, taskState.taskItem?.id]);
    const taskScreenEvent = useMemo(() => {
        if (!taskScreenEventInput) {
            return null;
        }

        const levelNumber = taskState.taskItem?.progress.currentLevel ?? taskState.taskData?.labContext?.levelNumber ?? 1;
        return buildLabTaskScreenEvent({
            input: taskScreenEventInput,
            levelNumber,
        });
    }, [taskScreenEventInput, taskState.taskData?.labContext?.levelNumber, taskState.taskItem?.progress.currentLevel]);

    return (
        <main>
            <StatusNotice status={status} />
            {screen.type === "level" ? <LevelScreenSection {...navigation} {...taskLoader} levelOverview={levelOverview} status={status} /> : null}
            {screen.type === "transition" ? <TransitionScreenSection {...navigation} screen={screen} setScreen={setScreen} status={status} taskItem={taskState.taskItem} /> : null}
            {screen.type === "done" ? <DoneScreenSection {...navigation} screen={screen} setScreen={setScreen} status={status} taskItem={taskState.taskItem} /> : null}
            {screen.type === "check" ? <CheckScreenSection {...navigation} {...taskResults} screen={screen} setScreen={setScreen} setStatus={setStatus} status={status} taskItem={taskState.taskItem} /> : null}
            {screen.type === "task" && taskScreenEvent ? (
                <TaskScreenSection
                    {...navigation}
                    {...starter}
                    {...taskResults}
                    {...taskState}
                    screenEvent={taskScreenEvent}
                    onScreenEventChange={(nextInput) => navigation.handleScreenChange(nextInput.activeScreen)}
                />
            ) : null}
        </main>
    );
}

export { Lab, readStoredProject }
