"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";

import { taskWorkbenchFiles } from "@/lib/system/config/client";
import { applyFileContentChange } from "@/lib/lab/editor";
import { sandpackUiKitsConfig } from "@/lib/lab/sandpack-ui-kits.config";
import { createDefaultProject, normalizeProject, type Project } from "@/lib/project/runtime";
import { createBrowserProjectStorage } from "@/lib/project/storage";

import type { WorkbenchProps } from "./props";
import { usePromptController, usePromptInput } from "./useWorkbenchPrompt";

type SaveErrorItem = { fileId: string; error: string }

type FileUpdate = { fileId: string; content: string }

const AUTOSAVE_DELAY_MS = 10_000;

function getDirtyUpdates(contentByFileId: Record<string, string>, editableIds: Set<string>, dirtyIds: string[], targetFileIds?: string[]) {
    const dirtySet = new Set(dirtyIds);
    const allowedTargetIds = targetFileIds ? new Set(targetFileIds) : null;

    return Object.entries(contentByFileId)
        .filter(([fileId]) => editableIds.has(fileId))
        .filter(([fileId]) => dirtySet.has(fileId))
        .filter(([fileId]) => (allowedTargetIds ? allowedTargetIds.has(fileId) : true))
        .map(([fileId, content]) => ({ fileId, content }));
}

async function postFileUpdates(taskId: string, updates: FileUpdate[]) {
    const res = await fetch(`/api/tasks/${taskId}/files`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ updates }),
    });
    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok) {
        const errors = Array.isArray(data?.errors)
            ? data.errors.map((e: SaveErrorItem) => `${e.fileId}: ${e.error}`).join("\n")
            : "";
        throw new Error(data?.error || errors || "Ошибка сохранения");
    }
}

async function postTaskCheck(taskId: string, project: Project) {
    const res = await fetch(`/api/tasks/${taskId}/check`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ project }),
    });
    return res;
}

function useProjectController(taskId: string) {
    const [previewVersion, setPreviewVersion] = useState(0);
    const [project, setProject] = useState<Project>(() => createDefaultProject(`task-${taskId}`));
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
                const taskProject = await projectStorage.getProject(`task-${taskId}`);
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

function useEditableFileIds(taskData: WorkbenchProps["taskData"]) {
    return useMemo(() => {
        const editableIds = taskData.labContext?.editableFileIds ?? [];
        return new Set(
            taskWorkbenchFiles
                .filter((f) => f.edit === true && editableIds.includes(f.id))
                .map((f) => f.id)
        );
    }, [taskData.labContext?.editableFileIds]);
}

function useWorkbenchRefs(taskId: string, taskData: WorkbenchProps["taskData"], editableFileIds: Set<string>) {
    const savedContentByFileIdRef = useRef<Record<string, string>>({ ...taskData.contentByFileId });
    const currentContentByFileIdRef = useRef<Record<string, string>>(taskData.contentByFileId);
    const dirtyFileIdsRef = useRef<string[]>([]);
    const editableFileIdsRef = useRef<Set<string>>(new Set());
    const taskIdRef = useRef(taskId);

    useEffect(() => {
        currentContentByFileIdRef.current = taskData.contentByFileId;
    }, [taskData.contentByFileId]);
    useEffect(() => {
        editableFileIdsRef.current = editableFileIds;
    }, [editableFileIds]);
    useEffect(() => {
        taskIdRef.current = taskId;
    }, [taskId]);

    return { currentContentByFileIdRef, dirtyFileIdsRef, editableFileIdsRef, savedContentByFileIdRef, taskIdRef };
}

function useDirtyFiles(savedContentByFileIdRef: MutableRefObject<Record<string, string>>, dirtyFileIdsRef: MutableRefObject<string[]>) {
    const [dirtyFileIds, setDirtyFileIds] = useState<string[]>([]);

    useEffect(() => {
        dirtyFileIdsRef.current = dirtyFileIds;
    }, [dirtyFileIds, dirtyFileIdsRef]);

    function markFileDirtyState(fileId: string, nextValue: string) {
        const savedValue = savedContentByFileIdRef.current[fileId] ?? "";
        setDirtyFileIds((current) => {
            const shouldBeDirty = nextValue !== savedValue;
            const isDirty = current.includes(fileId);
            const next = shouldBeDirty
                ? (isDirty ? current : [...current, fileId])
                : current.filter((currentFileId) => currentFileId !== fileId);
            dirtyFileIdsRef.current = next;
            return next;
        });
    }

    return { dirtyFileIds, markFileDirtyState, setDirtyFileIds };
}

function useSaveController({
    refs,
    setDirtyFileIds,
    setPreviewVersion,
}: {
    refs: ReturnType<typeof useWorkbenchRefs>;
    setDirtyFileIds: Dispatch<SetStateAction<string[]>>;
    setPreviewVersion: Dispatch<SetStateAction<number>>;
}) {
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "error">("idle");
    const [saveError, setSaveError] = useState<string>("");
    const savePromiseRef = useRef<Promise<boolean> | null>(null);

    async function saveDirtyFiles(targetFileIds?: string[]) {
        while (true) {
            if (savePromiseRef.current && !(await savePromiseRef.current)) return false;
            if (savePromiseRef.current) continue;

            const updates = getDirtyUpdates(refs.currentContentByFileIdRef.current, refs.editableFileIdsRef.current, refs.dirtyFileIdsRef.current, targetFileIds);
            if (updates.length === 0) return true;

            const promise = saveUpdates({ refs, setDirtyFileIds, setPreviewVersion, setSaveError, setSaveStatus, updates });
            savePromiseRef.current = promise;
            try {
                if (!(await promise)) return false;
            } finally {
                savePromiseRef.current = null;
            }
        }
    }

    return { saveBeforeAction: saveDirtyFiles, saveDirtyFiles, saveError, saveStatus, setSaveError, setSaveStatus };
}

async function saveUpdates({
    refs,
    setDirtyFileIds,
    setPreviewVersion,
    setSaveError,
    setSaveStatus,
    updates,
}: {
    refs: ReturnType<typeof useWorkbenchRefs>;
    setDirtyFileIds: Dispatch<SetStateAction<string[]>>;
    setPreviewVersion: Dispatch<SetStateAction<number>>;
    setSaveError: (error: string) => void;
    setSaveStatus: (status: "idle" | "saving" | "error") => void;
    updates: FileUpdate[];
}) {
    try {
        setSaveStatus("saving");
        setSaveError("");
        await postFileUpdates(refs.taskIdRef.current, updates);
        updates.forEach((update) => { refs.savedContentByFileIdRef.current[update.fileId] = update.content; });
        setDirtyFileIds((current) => current.filter((fileId) => (refs.currentContentByFileIdRef.current[fileId] ?? "") !== (refs.savedContentByFileIdRef.current[fileId] ?? "")));
        setSaveStatus("idle");
        setPreviewVersion((current) => current + 1);
        return true;
    } catch (error) {
        setSaveError(error instanceof Error ? error.message : "Ошибка сохранения");
        setSaveStatus("error");
        return false;
    }
}

function useCodeController({
    markFileDirtyState,
    onTaskDataChange,
    refs,
    setAutosaveRevision,
    taskData,
}: Pick<WorkbenchProps, "onTaskDataChange" | "taskData"> & {
    markFileDirtyState: (fileId: string, nextValue: string) => void;
    refs: ReturnType<typeof useWorkbenchRefs>;
    setAutosaveRevision: Dispatch<SetStateAction<number>>;
}) {
    const [codeContentByFileId, setCodeContentByFileId] = useState<Record<string, string>>(taskData.contentByFileId);

    function handleCodeChange(fileId: string, nextValue: string) {
        const nextContentByFileId = applyFileContentChange(refs.currentContentByFileIdRef.current, fileId, nextValue);
        const nextTaskData = { ...taskData, contentByFileId: nextContentByFileId };
        refs.currentContentByFileIdRef.current = nextContentByFileId;
        setCodeContentByFileId(nextContentByFileId);
        markFileDirtyState(fileId, nextValue);
        setAutosaveRevision((current) => current + 1);
        onTaskDataChange(nextTaskData);
    }

    return { codeContentByFileId, setCodeContentByFileId, handleCodeChange };
}

function useSaveEffects(saveDirtyFiles: () => Promise<boolean>, dirtyFileIds: string[], autosaveRevision: number) {
    useEffect(() => {
        if (dirtyFileIds.length === 0) return;
        const timeoutId = window.setTimeout(() => { void saveDirtyFiles(); }, AUTOSAVE_DELAY_MS);
        return () => { window.clearTimeout(timeoutId); };
    }, [autosaveRevision, dirtyFileIds.length]);

    useEffect(() => {
        function handleWindowKeyDown(event: globalThis.KeyboardEvent) {
            if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "s") return;
            event.preventDefault();
            void saveDirtyFiles();
        }

        window.addEventListener("keydown", handleWindowKeyDown);
        return () => { window.removeEventListener("keydown", handleWindowKeyDown); };
    }, []);
}

function useTaskDataReplacement({
    code,
    dirty,
    onTaskDataChange,
    refs,
    save,
}: Pick<WorkbenchProps, "onTaskDataChange"> & {
    code: ReturnType<typeof useCodeController>;
    dirty: ReturnType<typeof useDirtyFiles>;
    refs: ReturnType<typeof useWorkbenchRefs>;
    save: ReturnType<typeof useSaveController>;
}) {
    function replaceTaskData(nextTaskData: WorkbenchProps["taskData"]) {
        refs.savedContentByFileIdRef.current = { ...nextTaskData.contentByFileId };
        refs.currentContentByFileIdRef.current = nextTaskData.contentByFileId;
        code.setCodeContentByFileId(nextTaskData.contentByFileId);
        refs.dirtyFileIdsRef.current = [];
        dirty.setDirtyFileIds([]);
        save.setSaveError("");
        save.setSaveStatus("idle");
        onTaskDataChange(nextTaskData);
    }

    return replaceTaskData;
}

function useWorkbenchActions(
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

function useResetAction(props: WorkbenchProps, saveBeforeAction: () => Promise<boolean>, replaceTaskData: (taskData: WorkbenchProps["taskData"]) => void, actionState: ReturnType<typeof useWorkbenchActions>) {
    async function handleReset() {
        if (!(await saveBeforeAction())) return;
        actionState.setResetPending(true);
        actionState.setResetError("");

        try {
            const res = await fetch(`/api/tasks/${props.taskItem.id}/reset`, { method: "POST" });
            const data = await res.json().catch(() => null);
            if (!res.ok || !data?.ok) throw new Error(data?.error || "Не удалось сбросить задачу");
            if (data.taskItem) props.onTaskItemChange(data.taskItem);
            if (data.taskData) replaceTaskData(data.taskData);
            props.onTransition(null);
            props.onScreenChange("component");
        } catch (error) {
            actionState.setResetError(error instanceof Error ? error.message : "Не удалось сбросить задачу");
        } finally {
            actionState.setResetPending(false);
        }
    }

    return { handleReset };
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
        if (await save.saveBeforeAction(props.activeScreen ? [props.activeScreen] : undefined)) props.onScreenChange(nextFileId);
    }

    return { actions, code, dirty, handleBackToLevelList, handleFileChange, hint, project, prompt, promptInput, reset, save };
}

export { useWorkbenchController };
