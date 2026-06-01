"use client";

import { type KeyboardEvent as ReactKeyboardEvent, useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

import { CodeProps } from "./props";
import { BaseStyles } from "@/components/desengine/system/Base";
import { MonacoCodeEditor } from "./MonacoCodeEditor";
import { Button } from "@/components/ui/button";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { TabsStyles } from "./styles"
import { isEditorSaveHotkey } from "@/lib/lab/editor";
import { taskWorkbenchFiles } from "@/lib/system/config/client";
import {
  changeLabTaskScreenEventInput,
  readLabTaskScreenEventActiveScreen,
} from "../LabScreen/screen-event";

type CodeHeaderProps = {
  fileName: string;
  isDirty: boolean;
  title: string;
}

function CodeHeader({ fileName, isDirty, title }: CodeHeaderProps) {
  return (
    <div className="flex items-center gap-2 px-1 text-sm text-black/80">
      <strong>{title}</strong>
      {isDirty ? (
        <span
          aria-hidden="true"
          className="inline-block size-2.5 rounded-full bg-destructive"
        />
      ) : null}
      <span className="text-xs text-black/50">
        <code>{fileName}</code>
      </span>
    </div>
  );
}

function CopyButton({ copied, onCopy }: { copied: boolean; onCopy: () => void }) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onCopy}
      className="absolute right-3 top-3 z-10 gap-2 border-black bg-black text-white shadow-sm hover:bg-black/90 hover:text-white"
    >
      {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
      {copied ? "Скопировано" : "Скопировать"}
    </Button>
  );
}

function useCopyState(text: string) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCopied(false);
    }, 1600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return { copied, copy };
}

function createTaskDataWithFileContent(taskData: CodeProps["taskData"], fileId: string, nextValue: string) {
  return {
    ...taskData,
    contentByFileId: {
      ...taskData.contentByFileId,
      [fileId]: nextValue,
    },
  };
}

function Code({
  id,
  taskData,
  onTaskDataChange,
  onFileChange,
  onSaveShortcut,
  dirtyFileIds = [],
}: Omit<CodeProps, "screenEvent" | "onScreenEventChange"> & { id: string }) {
  const currentFile = id ? taskWorkbenchFiles.find((file) => file.id === id) : null;
  const isDirty = id ? dirtyFileIds.includes(id) : false;
  const fileContent = id ? taskData.contentByFileId[id] ?? "" : "";
  const { copied, copy } = useCopyState(fileContent);

  if (!id || !currentFile) {
    return null;
  }

  function handleEditorKeyDownCapture(event: ReactKeyboardEvent<HTMLDivElement>) {
    const isSaveHotkey = isEditorSaveHotkey(event);

    if (!isSaveHotkey) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    onSaveShortcut?.();
  }

  function handleChange(nextValue: string) {
    if (onFileChange) {
      onFileChange(id, nextValue);
      return;
    }

    if (!onTaskDataChange) return;
    onTaskDataChange(createTaskDataWithFileContent(taskData, id, nextValue));
  }

  return (
    <div className="flex h-full w-full flex-col gap-2">
      <CodeHeader
        fileName={currentFile.fileName}
        isDirty={isDirty}
        title={currentFile.title}
      />

      <div
        className={[
          "relative min-h-0 flex-1 overflow-hidden rounded-2xl border bg-[#fbf8f2]",
          isDirty ? "border-destructive/40" : "border-black/10",
        ].join(" ")}
        onKeyDownCapture={handleEditorKeyDownCapture}
      >
        <CopyButton copied={copied} onCopy={() => void copy()} />

        <MonacoCodeEditor
          fileId={id}
          fileName={currentFile.fileName}
          value={fileContent}
          onSaveShortcut={onSaveShortcut}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

function CodeTab({ title, file, isDirty }: { title: string; file: string; isDirty: boolean }) {
  return(
    <div className="w-full space-y-1">
      <div className="flex items-center gap-2">
        <p className="text-sm"><strong>{title}</strong></p>
        {isDirty ? (
          <span
            aria-hidden="true"
            className="inline-block size-2.5 rounded-full bg-destructive"
          />
        ) : null}
      </div>
      <p className="text-xs opacity-70"><code>{file}</code></p>
    </div>
  );
}

const SEEN_WORKBENCH_FILES_STORAGE_KEY = "desengine:workbench:seen-files";
const DEFAULT_KNOWN_FILE_COUNT = 2;

function buildNextScreenEvent(screenEvent: CodeProps["screenEvent"], nextFileId: string) {
  return changeLabTaskScreenEventInput({
    taskId: screenEvent.scope.taskId,
    activeScreen: readLabTaskScreenEventActiveScreen(screenEvent),
  }, nextFileId)
}

function buildSeenFilesStorageKey(taskId: string) {
  return `${SEEN_WORKBENCH_FILES_STORAGE_KEY}:${taskId}`;
}

function readSeenFileIds(taskId: string) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(buildSeenFilesStorageKey(taskId));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : null;
  } catch {
    return null;
  }
}

function writeSeenFileIds(taskId: string, fileIds: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(buildSeenFilesStorageKey(taskId), JSON.stringify(fileIds));
  } catch {
    // sessionStorage может быть недоступен; affordance останется только в текущем runtime.
  }
}

function getKnownFileIds(taskId: string, currentFileIds: string[]) {
  return readSeenFileIds(taskId) ?? currentFileIds.slice(0, DEFAULT_KNOWN_FILE_COUNT);
}

function getNewFileFocusTarget(newFileIds: string[]) {
  return newFileIds.find((fileId) => fileId === "styles") ?? newFileIds[0] ?? null;
}

function CodeTabs({
  taskData,
  onTaskDataChange,
  onFileChange,
  onSaveShortcut,
  screenEvent,
  onScreenEventChange,
  dirtyFileIds = [],
} : CodeProps) {
  const editableFileIds = taskData.labContext?.editableFileIds ?? [];
  const codeFiles = taskWorkbenchFiles.filter((f) => f.edit === true && editableFileIds.includes(f.id));
  const fallbackTab = codeFiles[0]?.id ?? "component"
  const activeFileId = readLabTaskScreenEventActiveScreen(screenEvent);
  const tab = codeFiles.some((file) => file.id === activeFileId) ? activeFileId : fallbackTab
  const autoFocusSignatureRef = useRef("")
  const [newFileIds, setNewFileIds] = useState<string[]>([])

  useEffect(() => {
    const currentFileIds = codeFiles.map((file) => file.id)
    const previousFileIds = getKnownFileIds(taskData.taskId, currentFileIds)
    const addedFileIds = currentFileIds.filter((fileId) => !previousFileIds.includes(fileId))

    if (addedFileIds.length > 0) {
      setNewFileIds((current) => [...new Set([...current, ...addedFileIds])])

      const nextFocusTarget = getNewFileFocusTarget(addedFileIds)
      const discoverySignature = `${taskData.taskId}:${currentFileIds.join(",")}:${addedFileIds.join(",")}`

      if (
        nextFocusTarget
        && nextFocusTarget !== tab
        && autoFocusSignatureRef.current !== discoverySignature
      ) {
        autoFocusSignatureRef.current = discoverySignature
        onScreenEventChange?.(buildNextScreenEvent(screenEvent, nextFocusTarget))
      }
    }

    writeSeenFileIds(taskData.taskId, currentFileIds)
  }, [codeFiles, onScreenEventChange, screenEvent, tab, taskData.taskId])

  if (codeFiles.length === 0) {
    return (
      <div className={`${BaseStyles.frameRow} h-96 items-center justify-center text-muted-foreground`}>
        Для этого уровня пока нет доступных файлов для редактирования.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {newFileIds.length > 0 ? (
        <div
          data-testid="code-new-file-callout"
          className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
        >
          Появился новый файл уровня:{" "}
          {codeFiles
            .filter((file) => newFileIds.includes(file.id))
            .map((file) => file.fileName)
            .join(", ")}
          . Он уже открыт в редакторе, чтобы вы не пропустили новый шаг.
        </div>
      ) : null}

      <Tabs
        value={tab}
        onValueChange={(nextValue) => {
          setNewFileIds((current) => current.filter((fileId) => fileId !== nextValue))
          onScreenEventChange?.(buildNextScreenEvent(screenEvent, nextValue))
        }}
        data-screen-event-id={screenEvent.eventId}
        className={`${BaseStyles.frameRow} min-w-0 flex-col h-[34rem] gap-3 lg:flex-row`}
      >
        <div className="min-h-0 min-w-0 flex-1 p-0">
          {codeFiles.map((file) => (
            <TabsContent
              key={file.id}
              value={file.id}
              className={TabsStyles.content}
            >
              <Code
                id={file.id}
                taskData={taskData}
                onTaskDataChange={onTaskDataChange}
                onFileChange={onFileChange}
                onSaveShortcut={onSaveShortcut}
                dirtyFileIds={dirtyFileIds}
              />
            </TabsContent>
          ))}
        </div>

        <TabsList className={TabsStyles.list}>
          {codeFiles.map((file) => (
            <TabsTrigger
              key={file.id}
              value={file.id}
              data-testid={`code-tab-${file.id}`}
              className={TabsStyles.trigger}
            >
              <div className="space-y-2 text-left">
                {newFileIds.includes(file.id) ? (
                  <span
                    data-testid={`code-tab-badge-new-${file.id}`}
                    className="inline-flex rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.14em] text-amber-900"
                  >
                    Новый
                  </span>
                ) : null}
                <CodeTab
                  title={file.title}
                  file={file.fileName}
                  isDirty={dirtyFileIds.includes(file.id)}
                />
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}

function CodeList({
  taskData,
  onTaskDataChange,
  onFileChange,
  onSaveShortcut,
  screenEvent,
  onScreenEventChange,
  dirtyFileIds = [],
} : CodeProps) {
  return (
    <CodeTabs
      taskData={taskData}
      onTaskDataChange={onTaskDataChange}
      onFileChange={onFileChange}
      onSaveShortcut={onSaveShortcut}
      screenEvent={screenEvent}
      onScreenEventChange={onScreenEventChange}
      dirtyFileIds={dirtyFileIds}
    />
  );
}

export {
    Code,
    CodeList,
}
