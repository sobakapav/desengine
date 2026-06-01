"use client";

import { useEffect, useMemo, useState } from "react";

import { sandpackUiKitsConfig } from "@/lib/lab/sandpack-ui-kits.config";
import { normalizeProject, type Project } from "@/lib/project/runtime";
import {
    createBrowserProjectStorage,
    readBrowserStoredActiveProjectId,
    readBrowserStoredProject,
} from "@/lib/project/storage";

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
import { usePromptController, usePromptInput } from "./useWorkbenchPrompt";
import { changeLabTaskScreenEventInput, readLabTaskScreenEventActiveScreen } from "../LabScreen/screen-event";

function useProjectController(taskId: string) {
    function readInitialProject() {
        const fallbackProject = normalizeProject({
            id: `task-${taskId}`,
            title: `Проект ${taskId}`,
        });

        if (typeof window === "undefined") {
            return fallbackProject;
        }

        try {
            const activeProjectId = readBrowserStoredActiveProjectId(window.localStorage, taskId) ?? `task-${taskId}`;
            return readBrowserStoredProject(window.localStorage, activeProjectId, taskId) ?? fallbackProject;
        } catch {
            return fallbackProject;
        }
    }

    const [previewVersion, setPreviewVersion] = useState(0);
    const [project, setProject] = useState<Project>(() => readInitialProject());
    const projectStorage = useMemo(() => {
        if (typeof window === "undefined") return null;
        return createBrowserProjectStorage({ storage: window.localStorage, taskId });
    }, [taskId]);
    const uiKitOptions = useMemo(() => Object.values(sandpackUiKitsConfig), []);

    useEffect(() => {
        let cancelled = false;

        async function loadProject() {
            const fallbackProject = normalizeProject({
                id: `task-${taskId}`,
                title: `Проект ${taskId}`,
            });

            if (!projectStorage) {
                setProject(fallbackProject);
                return;
            }

            try {
                const activeProjectId = await projectStorage.getActiveProjectId();
                const taskProject = await projectStorage.getProject(activeProjectId ?? `task-${taskId}`);
                const nextProject = taskProject ?? fallbackProject;

                await projectStorage.saveProject(nextProject);
                await projectStorage.setActiveProjectId(nextProject.id);
                if (!cancelled) setProject(nextProject);
            } catch {
                if (!cancelled) setProject(fallbackProject);
            }
        }

        void loadProject();
        return () => { cancelled = true; };
    }, [projectStorage, taskId]);

    function updateProject(nextProject: Project) {
        const normalized = normalizeProject(nextProject);
        setProject(normalized);
        setPreviewVersion((value) => value + 1);

        void projectStorage?.saveProject(normalized)
            .then(() => projectStorage.setActiveProjectId(normalized.id))
            .catch(() => {
                // localStorage может быть недоступен в приватном режиме; runtime продолжит работать в памяти страницы.
            });
    }

    return { project, previewVersion, setPreviewVersion, uiKitOptions, updateProject };
}

function buildTaskHintUrl(taskId: string, project: Project) {
    const params = new URLSearchParams({
        projectId: project.id,
        projectTitle: project.title,
        uiKitId: project.settings.uiKitId,
        uiMode: project.settings.uiMode,
    });

    return `/api/tasks/${encodeURIComponent(taskId)}/hint?${params.toString()}`;
}

function useTaskHintController(taskId: string, initialTaskTip: string, project: Project) {
    const [taskTip, setTaskTip] = useState(initialTaskTip);

    useEffect(() => {
        setTaskTip(initialTaskTip);
    }, [initialTaskTip]);

    useEffect(() => {
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
    }, [initialTaskTip, project.id, project.title, project.settings.uiKitId, project.settings.uiMode, taskId]);

    return { taskTip };
}

function useWorkbenchController(props: WorkbenchProps) {
    const editableFileIds = useEditableFileIds(props.taskData);
    const refs = useWorkbenchRefs(props.taskItem.id, props.taskData, editableFileIds);
    const project = useProjectController(props.taskItem.id);
    const hint = useTaskHintController(props.taskItem.id, props.taskData.labContext?.taskTip ?? "", project.project);
    const dirty = useDirtyFiles(refs.savedContentByFileIdRef, refs.dirtyFileIdsRef);
    const [autosaveRevision, setAutosaveRevision] = useState(0);
    const save = useSaveController({ refs, setDirtyFileIds: dirty.setDirtyFileIds, setPreviewVersion: project.setPreviewVersion });
    const code = useCodeController({ markFileDirtyState: dirty.markFileDirtyState, onTaskDataChange: props.onTaskDataChange, refs, setAutosaveRevision, taskData: props.taskData });
    const replaceTaskData = useTaskDataReplacement({ code, dirty, onTaskDataChange: props.onTaskDataChange, refs, save });
    const actions = useWorkbenchActions(props, project.project, save.saveBeforeAction, replaceTaskData);
    const reset = useResetAction(props, save.saveBeforeAction, replaceTaskData, actions);
    const prompt = usePromptController(props, save.saveBeforeAction, replaceTaskData, project.setPreviewVersion);
    const promptInput = usePromptInput(prompt);

    useSaveEffects(save.saveDirtyFiles, dirty.dirtyFileIds, autosaveRevision);

    async function handleBackToLevelList() {
        if (await save.saveBeforeAction()) props.onBackToLevelList();
    }

    async function handleFileChange(nextFileId: string) {
        const activeScreen = readLabTaskScreenEventActiveScreen(props.screenEvent);
        if (await save.saveBeforeAction(activeScreen ? [activeScreen] : undefined)) {
            props.onScreenEventChange(changeLabTaskScreenEventInput({
                taskId: props.screenEvent.scope.taskId,
                activeScreen,
            }, nextFileId));
        }
    }

    return { actions, code, dirty, handleBackToLevelList, handleFileChange, hint, project, prompt, promptInput, reset, save };
}

export { useWorkbenchController };
