"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";

import { taskWorkbenchFiles } from "@/lib/system/config/client";
import { applyFileContentChange } from "@/lib/lab/editor";

import type { WorkbenchProps } from "./props";

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

export function useEditableFileIds(taskData: WorkbenchProps["taskData"]) {
  return useMemo(() => {
    const editableIds = taskData.labContext?.editableFileIds ?? [];
    return new Set(
      taskWorkbenchFiles
        .filter((file) => file.edit === true && editableIds.includes(file.id))
        .map((file) => file.id),
    );
  }, [taskData.labContext?.editableFileIds]);
}

export function useWorkbenchRefs(taskId: string, taskData: WorkbenchProps["taskData"], editableFileIds: Set<string>) {
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

export function useDirtyFiles(savedContentByFileIdRef: MutableRefObject<Record<string, string>>, dirtyFileIdsRef: MutableRefObject<string[]>) {
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
    updates.forEach((update) => {
      refs.savedContentByFileIdRef.current[update.fileId] = update.content;
    });
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

export function useSaveController({
  refs,
  setDirtyFileIds,
  setPreviewVersion,
}: {
  refs: ReturnType<typeof useWorkbenchRefs>;
  setDirtyFileIds: Dispatch<SetStateAction<string[]>>;
  setPreviewVersion: Dispatch<SetStateAction<number>>;
}) {
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "error">("idle");
  const [saveError, setSaveError] = useState("");
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

export function useCodeController({
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

export function useSaveEffects(saveDirtyFiles: () => Promise<boolean>, dirtyFileIds: string[], autosaveRevision: number) {
  useEffect(() => {
    if (dirtyFileIds.length === 0) return;
    const timeoutId = window.setTimeout(() => {
      void saveDirtyFiles();
    }, AUTOSAVE_DELAY_MS);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [autosaveRevision, dirtyFileIds.length]);

  useEffect(() => {
    function handleWindowKeyDown(event: globalThis.KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "s") return;
      event.preventDefault();
      void saveDirtyFiles();
    }

    window.addEventListener("keydown", handleWindowKeyDown);
    return () => {
      window.removeEventListener("keydown", handleWindowKeyDown);
    };
  }, []);
}

export function useTaskDataReplacement({
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
