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

function buildTaskHintUrl(taskId: string, project: Project) {
    const params = new URLSearchParams({
        projectId: project.id,
        projectTitle: project.title,
        uiKitId: project.settings.uiKitId,
        uiMode: project.settings.uiMode,
    });

    return `/api/tasks/${encodeURIComponent(taskId)}/hint?${params.toString()}`;
}

function useTaskHintController(taskId: string, initialTaskTip: string, project: Project, projectReady: boolean) {
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
                const res = await fetch(buildTaskHintUrl(taskId, project));
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
    }, [initialTaskTip, project.id, project.title, project.settings.uiKitId, project.settings.uiMode, projectReady, taskId]);

    return { taskTip };
}

function useWorkbenchController(props: WorkbenchProps) {
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
    const replaceTaskData = useTaskDataReplacement({ code, dirty, onTaskDataChange: props.onTaskDataChange, refs, save: saveController });
    const project = useWorkbenchProjectScope({
        projectState,
        props,
        replaceTaskData,
        saveBeforeAction: saveController.saveBeforeAction,
    });
    const hint = useTaskHintController(props.taskItem.id, props.taskData.labContext?.taskTip ?? "", project.project, project.projectReady);
    const actions = useWorkbenchActions(props, project.project, saveController.saveBeforeAction, replaceTaskData);
    const reset = useResetAction(props, project.project, saveController.saveBeforeAction, replaceTaskData, actions);
    const prompt = usePromptController(props, project.project, saveController.saveBeforeAction, replaceTaskData, project.setPreviewVersion);
    const promptInput = usePromptInput(prompt);
    const surface = buildWorkbenchSurfaceSnapshot({
        project: project.project,
        taskData: props.taskData,
        taskItem: props.taskItem,
    });

    useSaveEffects(saveController.saveDirtyFiles, dirty.dirtyFileIds, autosaveRevision);

    async function handleBackToLevelList() {
        if (await saveController.saveBeforeAction()) props.onBackToLevelList();
    }

    async function handleFileChange(nextFileId: string) {
        const activeScreen = readLabTaskScreenEventActiveScreen(props.screenEvent);
        if (await saveController.saveBeforeAction(activeScreen ? [activeScreen] : undefined)) {
            props.onScreenEventChange(changeLabTaskScreenEventInput({
                taskId: props.screenEvent.scope.taskId,
                activeScreen,
            }, nextFileId));
        }
    }

    return {
        actions,
        code,
        dirty,
        handleBackToLevelList,
        handleFileChange,
        hint,
        project,
        prompt,
        promptInput,
        reset,
        save: saveController,
        surface,
    };
}

export { useWorkbenchController };
