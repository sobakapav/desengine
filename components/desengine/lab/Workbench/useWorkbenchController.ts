"use client";

import { useEffect, useState } from "react";

import { type Project } from "@/lib/project/runtime";

import type { WorkbenchProps } from "./props";
import {
    useCodeController,
    useDirtyFiles,
    useEditableFileIds,
    useSaveController,
    useSaveEffects,
    useTaskDataReplacement,
    useWorkbenchRefs,
} from "./useWorkbenchPersistence";
import { useResetAction, useWorkbenchActions } from "./useWorkbenchTaskActions";
import { useProjectController, useWorkbenchProjectScope } from "./useWorkbenchProjectScope";
import { usePromptController, usePromptInput } from "./useWorkbenchPrompt";
import { buildWorkbenchSurfaceSnapshot } from "./workbenchSurface";
import { changeLabTaskScreenEventInput, readLabTaskScreenEventActiveScreen } from "../LabScreen/screen-event";

function buildTaskHintUrl(taskId: string, project: Project, activeScreen?: string | null) {
    const params = new URLSearchParams({
        projectId: project.id,
        projectTitle: project.title,
        uiKitId: project.settings.uiKitId,
    });

    if (activeScreen) {
        params.set("activeScreen", activeScreen);
    }

    return `/api/tasks/${encodeURIComponent(taskId)}/hint?${params.toString()}`;
}

function useTaskHintController(
    taskId: string,
    initialTaskTip: string,
    project: Project,
    projectReady: boolean,
    activeScreen?: string | null,
) {
    const [taskTip, setTaskTip] = useState(initialTaskTip);

    useEffect(() => {
        setTaskTip(initialTaskTip);
    }, [initialTaskTip]);

    useEffect(() => {
        if (!projectReady) {
            setTaskTip(initialTaskTip);
            return;
        }

        let cancelled = false;

        async function refreshTaskTip() {
            try {
                const res = await fetch(buildTaskHintUrl(taskId, project, activeScreen));
                const data = await res.json().catch(() => null);

                if (!cancelled && res.ok && data?.ok && typeof data.taskTip === "string") {
                    setTaskTip(data.taskTip);
                }
            } catch {
                if (!cancelled) setTaskTip(initialTaskTip);
            }
        }

        void refreshTaskTip();
        return () => { cancelled = true; };
    }, [activeScreen, initialTaskTip, project.id, project.title, project.settings.uiKitId, projectReady, taskId]);

    return { taskTip };
}

function useWorkbenchRuntime(props: WorkbenchProps, activeScreen?: string | null) {
    const editableFileIds = useEditableFileIds(props.taskData);
    const refs = useWorkbenchRefs(props.taskItem.id, props.taskData, editableFileIds);
    const projectState = useProjectController(props.taskItem.id);
    const dirty = useDirtyFiles(refs.savedContentByFileIdRef, refs.dirtyFileIdsRef);
    const [autosaveRevision, setAutosaveRevision] = useState(0);
    const saveController = useSaveController({
        refs,
        setDirtyFileIds: dirty.setDirtyFileIds,
        setPreviewVersion: projectState.setPreviewVersion,
        project: projectState.project,
    });
    const code = useCodeController({ markFileDirtyState: dirty.markFileDirtyState, onTaskDataChange: props.onTaskDataChange, refs, setAutosaveRevision, taskData: props.taskData });
    const replaceTaskData = useTaskDataReplacement({
        code,
        dirty,
        onTaskDataChange: props.onTaskDataChange,
        refs,
        save: saveController,
        setPreviewVersion: projectState.setPreviewVersion,
    });
    const project = useWorkbenchProjectScope({
        projectState,
        props,
        replaceTaskData,
        saveBeforeAction: saveController.saveBeforeAction,
    });
    const hint = useTaskHintController(
        props.taskItem.id,
        props.taskData.labContext?.taskTip ?? "",
        project.project,
        project.projectReady,
        activeScreen,
    );
    const actions = useWorkbenchActions(props, project.project, saveController.saveBeforeAction, replaceTaskData);
    const reset = useResetAction(props, project.project, saveController.saveBeforeAction, replaceTaskData, actions);
    const prompt = usePromptController(props, project.project, saveController.saveBeforeAction, replaceTaskData);
    const promptInput = usePromptInput(prompt);
    const surface = buildWorkbenchSurfaceSnapshot({
        project: project.project,
        taskData: props.taskData,
        taskItem: props.taskItem,
        activeFileId: activeScreen,
    });

    useSaveEffects(saveController.saveDirtyFiles, dirty.dirtyFileIds, autosaveRevision);

    return {
        actions,
        code,
        dirty,
        hint,
        project,
        prompt,
        promptInput,
        reset,
        save: saveController,
        surface,
    };
}

function useWorkbenchHandlers(args: {
    activeScreen?: string | null;
    onBackToLevelList: WorkbenchProps["onBackToLevelList"];
    onScreenEventChange: WorkbenchProps["onScreenEventChange"];
    saveBeforeAction: (targetFileIds?: string[]) => Promise<boolean>;
    screenEvent: WorkbenchProps["screenEvent"];
    surface: ReturnType<typeof buildWorkbenchSurfaceSnapshot> | null;
}) {
    async function handleBackToLevelList() {
        if (await args.saveBeforeAction()) args.onBackToLevelList();
    }

    async function handleFileChange(nextFileId: string) {
        if (await args.saveBeforeAction(args.activeScreen ? [args.activeScreen] : undefined)) {
            args.onScreenEventChange(changeLabTaskScreenEventInput({
                taskId: args.screenEvent.scope.taskId,
                activeScreen: args.activeScreen,
            }, nextFileId));
        }
    }

    async function handleWorkflowPointSelect(pointId: string) {
        const point = args.surface?.workflowPoints.find((item) => item.id === pointId);

        if (!point?.isSelectable || !point.primaryFileId) {
            return;
        }

        if (point.primaryFileId === args.activeScreen) {
            return;
        }

        await handleFileChange(point.primaryFileId);
    }

    return {
        handleBackToLevelList,
        handleFileChange,
        handleWorkflowPointSelect,
    };
}

function useWorkbenchController(props: WorkbenchProps) {
    const activeScreen = readLabTaskScreenEventActiveScreen(props.screenEvent);
    const runtime = useWorkbenchRuntime(props, activeScreen);
    const handlers = useWorkbenchHandlers({
        activeScreen,
        onBackToLevelList: props.onBackToLevelList,
        onScreenEventChange: props.onScreenEventChange,
        saveBeforeAction: runtime.save.saveBeforeAction,
        screenEvent: props.screenEvent,
        surface: runtime.surface,
    });

    return {
        ...runtime,
        ...handlers,
    };
}

export { useWorkbenchController };
