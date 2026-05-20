"use client";

import { type KeyboardEvent as ReactKeyboardEvent } from "react";

import { MarkdownContent } from "../../system/MarkdownContent";
import { InOut } from "../InOut";
import { Prompt, PromptComposer } from "../Propmt";
import { CodeList } from "../Code";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Project } from "@/lib/project/runtime";

import type { WorkbenchProps } from "./props";
import type { useWorkbenchController } from "./useWorkbenchController";

type WorkbenchController = ReturnType<typeof useWorkbenchController>;
const SHOW_UI_KIT_SWITCHER = false;

function WorkbenchHeader({
    completePending,
    onBackToLevelList,
    onCheck,
    onReset,
    resetPending,
    taskItem,
}: Pick<WorkbenchProps, "taskItem"> & {
    completePending: boolean;
    onBackToLevelList: () => void;
    onCheck: () => void;
    onReset: () => void;
    resetPending: boolean;
}) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
                <p>Рабочий стол</p>
                <p className="text-muted-foreground">Задача: <code>{taskItem.id}</code></p>
                <p className="text-muted-foreground">
                    Уровень {taskItem.progress.currentLevel} из {taskItem.maxLevel}. Промптов: {taskItem.progress.promptsUsed} / {taskItem.progress.promptsLimit}.
                </p>
                {taskItem.progress.currentLevelDisplayStatus === "awaiting_check_retry" && (
                    <p className="text-muted-foreground">Статус уровня: ждёт повторной проверки.</p>
                )}
            </div>
            <WorkbenchHeaderActions
                canCompleteCurrentLevel={taskItem.progress.currentLevelStarted && taskItem.progress.currentLevelStatus !== "completed"}
                completePending={completePending}
                onBackToLevelList={onBackToLevelList}
                onCheck={onCheck}
                onReset={onReset}
                resetPending={resetPending}
            />
        </div>
    );
}

function WorkbenchHeaderActions({
    canCompleteCurrentLevel,
    completePending,
    onBackToLevelList,
    onCheck,
    onReset,
    resetPending,
}: {
    canCompleteCurrentLevel: boolean;
    completePending: boolean;
    onBackToLevelList: () => void;
    onCheck: () => void;
    onReset: () => void;
    resetPending: boolean;
}) {
    return (
        <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={onBackToLevelList}>К списку задач уровня</Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" disabled={completePending || resetPending}>{resetPending ? "Сброс…" : "Сбросить задачу"}</Button>
                </AlertDialogTrigger>
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Сбросить задачу?</AlertDialogTitle>
                        <AlertDialogDescription>Будут удалены рабочие файлы и история уточнений. Задача снова станет не начатой.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={onReset}>Подтвердить сброс</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Button variant="secondary" disabled={completePending || resetPending || !canCompleteCurrentLevel} onClick={onCheck}>
                {completePending ? "Проверка…" : "Проверить результат"}
            </Button>
        </div>
    );
}

function ProjectSettings({
    project,
    uiKitOptions,
    updateProject,
}: {
    project: Project;
    uiKitOptions: Array<{ id: Project["uiKitId"]; title: string }>;
    updateProject: (project: Project) => void;
}) {
    function handleUiKitChange(nextUiKitId: Project["uiKitId"]) {
        updateProject({
            ...project,
            uiKitId: nextUiKitId,
            uiMode: nextUiKitId === "none" ? "html-tags" : "ui-kit",
        });
    }

    return (
        <div className="rounded-md border bg-muted/30 p-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div className="space-y-1">
                    <p className="text-sm font-medium">Настройки проекта</p>
                    <p className="text-xs text-muted-foreground">
                        UI kit меняет Sandpack preview без перезагрузки страницы. Режим: {project.uiMode === "html-tags" ? "HTML-теги" : "UI kit"}.
                    </p>
                </div>
                <label className="flex flex-col gap-1 text-sm">
                    <span className="text-xs text-muted-foreground">UI kit</span>
                    <select
                        className="h-9 rounded-md border bg-background px-3 text-sm"
                        value={project.uiKitId}
                        onChange={(event) => handleUiKitChange(event.target.value as Project["uiKitId"])}
                    >
                        {uiKitOptions.map((kit) => <option key={kit.id} value={kit.id}>{kit.title}</option>)}
                    </select>
                </label>
            </div>
        </div>
    );
}

function ErrorNotices({ completeError, resetError, saveError, saveStatus }: {
    completeError: string;
    resetError: string;
    saveError: string;
    saveStatus: "idle" | "saving" | "error";
}) {
    return (
        <>
            {saveStatus === "error" && <ErrorBlock message={saveError} />}
            {completeError && <ErrorBlock message={completeError} />}
            {resetError && <ErrorBlock message={resetError} />}
        </>
    );
}

function ErrorBlock({ message }: { message: string }) {
    return (
        <pre className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-destructive whitespace-pre-wrap">
            {message}
        </pre>
    );
}

function WorkbenchBody({ controller, props }: { controller: WorkbenchController; props: WorkbenchProps }) {
    const levelReadyForWork = props.taskItem.progress.currentLevelStarted;

    return (
        <div className="space-y-3 md:space-y-4">
            <WorkbenchHeader
                taskItem={props.taskItem}
                completePending={controller.actions.completePending}
                resetPending={controller.actions.resetPending}
                onBackToLevelList={() => void controller.handleBackToLevelList()}
                onCheck={() => void controller.actions.handleCheck()}
                onReset={() => void controller.reset.handleReset()}
            />
            <InOut task={props.taskItem.id} taskData={props.taskData} started={props.taskItem.started} reloadKey={controller.project.previewVersion} startStatus="" project={controller.project.project} />
            {props.taskData.labContext && <TaskTip content={controller.hint.taskTip} />}
            {levelReadyForWork && <WorkbenchWorkArea controller={controller} props={props} />}
            <ErrorNotices
                completeError={controller.actions.completeError}
                resetError={controller.actions.resetError}
                saveError={controller.save.saveError}
                saveStatus={controller.save.saveStatus}
            />
        </div>
    );
}

function TaskTip({ content }: { content: string }) {
    return (
        <div className="rounded-md border p-4">
            <p className="font-medium">Что важно в этой задаче</p>
            <MarkdownContent className="mt-2" content={content || "Для этого уровня пока нет отдельного пояснения задачи."} />
        </div>
    );
}

function WorkbenchWorkArea({ controller, props }: { controller: WorkbenchController; props: WorkbenchProps }) {
    return (
        <div className="space-y-3 pb-4">
            {controller.dirty.dirtyFileIds.length > 0 && (
                <div className="flex items-center gap-2">
                    <Button onClick={() => void controller.save.saveDirtyFiles()} variant="secondary" disabled={controller.save.saveStatus === "saving"}>
                        {controller.save.saveStatus === "saving" ? "Сохранение…" : "Сохранить"}
                    </Button>
                </div>
            )}
            {SHOW_UI_KIT_SWITCHER ? (
                <ProjectSettings
                    project={controller.project.project}
                    uiKitOptions={controller.project.uiKitOptions}
                    updateProject={controller.project.updateProject}
                />
            ) : null}
            <CodeList
                taskData={{ ...props.taskData, contentByFileId: controller.code.codeContentByFileId }}
                onFileChange={controller.code.handleCodeChange}
                onSaveShortcut={() => void controller.save.saveDirtyFiles()}
                activeFileId={props.activeScreen}
                onActiveFileIdChange={(nextFileId) => void controller.handleFileChange(nextFileId)}
                dirtyFileIds={controller.dirty.dirtyFileIds}
            />
            <Prompt taskItem={props.taskItem} taskData={props.taskData} status={controller.prompt.promptStatus} error={controller.prompt.promptError} />
        </div>
    );
}

function WorkbenchFooter({ controller, props }: { controller: WorkbenchController; props: WorkbenchProps }) {
    if (!props.taskItem.progress.currentLevelStarted) {
        return null;
    }

    return (
        <PromptComposer
            value={controller.prompt.promptText}
            promptsUsed={props.taskItem.progress.promptsUsed}
            promptsLimit={props.taskItem.progress.promptsLimit}
            teachingCostCents={props.taskData.llmUsageSummary.teachingCostCents}
            disabled={controller.prompt.promptPending}
            pending={controller.prompt.promptPending}
            runDisabled={controller.prompt.promptPending}
            onChange={controller.promptInput.handlePromptChange}
            onKeyDown={controller.promptInput.handlePromptKeyDown as (event: ReactKeyboardEvent<HTMLTextAreaElement>) => void}
            onRun={() => void controller.prompt.handlePromptRun()}
        />
    );
}

function WorkbenchView({ controller, props }: { controller: WorkbenchController; props: WorkbenchProps }) {
    return (
        <div className="grid overflow-hidden rounded-xl bg-white shadow-2xl" style={{ height: "calc(100dvh - 20px)", gridTemplateRows: "minmax(0, 1fr) auto" }}>
            <div className="min-h-0 overflow-y-auto px-3 pb-5 pt-3 md:px-4 md:pb-6 md:pt-4">
                <WorkbenchBody controller={controller} props={props} />
            </div>
            <WorkbenchFooter controller={controller} props={props} />
        </div>
    );
}

export { WorkbenchView };
