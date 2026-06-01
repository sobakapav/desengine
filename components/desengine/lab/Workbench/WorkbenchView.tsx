"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { type KeyboardEvent as ReactKeyboardEvent } from "react";
import { ChevronDown, Files } from "lucide-react";

import { MarkdownContent } from "../../system/MarkdownContent";
import { InOut } from "../InOut";
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
import { taskWorkbenchFiles } from "@/lib/system/config/client";
import { getLevelAssetPath } from "@/lib/level/navigation";

import type { WorkbenchProps } from "./props";
import type { useWorkbenchController } from "./useWorkbenchController";

const CodeList = dynamic(
    () => import("../Code").then((module) => module.CodeList),
    {
        ssr: false,
        loading: () => (
            <div className="rounded-md border p-4 text-sm text-muted-foreground">
                Загружаем редактор…
            </div>
        ),
    },
);

const Prompt = dynamic(
    () => import("../Propmt").then((module) => module.Prompt),
    {
        ssr: false,
        loading: () => (
            <div className="rounded-md border p-4 text-sm text-muted-foreground">
                Загружаем историю уточнений…
            </div>
        ),
    },
);

const PromptComposer = dynamic(
    () => import("../Propmt").then((module) => module.PromptComposer),
    {
        ssr: false,
        loading: () => (
            <div className="rounded-xl border bg-white p-4 text-sm text-muted-foreground shadow-2xl">
                Загружаем форму уточнений…
            </div>
        ),
    },
);

type WorkbenchController = ReturnType<typeof useWorkbenchController>;
const SHOW_UI_KIT_SWITCHER = false;

function WorkbenchHeader({
    completePending,
    onBackToLevelList,
    onCheck,
    onResetLevel,
    onResetTask,
    resetError,
    resetPending,
    taskItem,
}: Pick<WorkbenchProps, "taskItem"> & {
    completePending: boolean;
    onBackToLevelList: () => void;
    onCheck: () => void;
    onResetLevel: () => Promise<boolean>;
    onResetTask: () => Promise<boolean>;
    resetError: string;
    resetPending: boolean;
}) {
    return (
        <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">Рабочий стол</p>
                <p className="text-muted-foreground">Задача: <code>{taskItem.id}</code></p>
                <h1 className="text-2xl font-semibold text-black">Уровень {taskItem.progress.currentLevel}</h1>
            </div>
            <WorkbenchHeaderActions
                canCompleteCurrentLevel={taskItem.progress.currentLevelStarted && taskItem.progress.currentLevelStatus !== "completed"}
                completePending={completePending}
                onBackToLevelList={onBackToLevelList}
                onCheck={onCheck}
                onResetLevel={onResetLevel}
                onResetTask={onResetTask}
                resetError={resetError}
                resetPending={resetPending}
            />
        </div>
    );
}

function ContextStatusItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-black/10 bg-white/85 px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.16em] text-black/45">{label}</p>
            <p className="mt-1 text-sm font-medium text-black">{value}</p>
        </div>
    );
}

function WorkbenchHeaderActions({
    canCompleteCurrentLevel,
    completePending,
    onBackToLevelList,
    onCheck,
    onResetLevel,
    onResetTask,
    resetError,
    resetPending,
}: {
    canCompleteCurrentLevel: boolean;
    completePending: boolean;
    onBackToLevelList: () => void;
    onCheck: () => void;
    onResetLevel: () => Promise<boolean>;
    onResetTask: () => Promise<boolean>;
    resetError: string;
    resetPending: boolean;
}) {
    const [levelResetDialogOpen, setLevelResetDialogOpen] = useState(false);
    const [taskResetDialogOpen, setTaskResetDialogOpen] = useState(false);

    async function handleLevelResetConfirm() {
        const success = await onResetLevel();
        if (success) {
            setLevelResetDialogOpen(false);
        }
    }

    async function handleTaskResetConfirm() {
        const success = await onResetTask();
        if (success) {
            setTaskResetDialogOpen(false);
        }
    }

    return (
        <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={onBackToLevelList}>К списку задач уровня</Button>
            <AlertDialog open={levelResetDialogOpen} onOpenChange={setLevelResetDialogOpen}>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" disabled={completePending || resetPending || !canCompleteCurrentLevel}>
                        {resetPending ? "Сброс…" : "Сбросить уровень"}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Сбросить текущий уровень?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Будут удалены рабочие файлы, история уточнений и проверки только у текущего уровня. Уже пройденные уровни сохранятся.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    {levelResetDialogOpen && resetError ? (
                        <pre className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive whitespace-pre-wrap">
                            {resetError}
                        </pre>
                    ) : null}
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={resetPending}>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            disabled={resetPending}
                            onClick={(event) => {
                                event.preventDefault();
                                void handleLevelResetConfirm();
                            }}
                        >
                            {resetPending ? "Сбрасываем уровень…" : "Подтвердить сброс уровня"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={taskResetDialogOpen} onOpenChange={setTaskResetDialogOpen}>
                <AlertDialogTrigger asChild>
                    <Button variant="outline" disabled={completePending || resetPending}>{resetPending ? "Сброс…" : "Сбросить задачу"}</Button>
                </AlertDialogTrigger>
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Сбросить всю задачу?</AlertDialogTitle>
                        <AlertDialogDescription>Будут удалены рабочие файлы и история уточнений. Задача снова станет не начатой.</AlertDialogDescription>
                    </AlertDialogHeader>
                    {taskResetDialogOpen && resetError ? (
                        <pre className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive whitespace-pre-wrap">
                            {resetError}
                        </pre>
                    ) : null}
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={resetPending}>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            disabled={resetPending}
                            onClick={(event) => {
                                event.preventDefault();
                                void handleTaskResetConfirm();
                            }}
                        >
                            {resetPending ? "Сбрасываем задачу…" : "Подтвердить полный сброс"}
                        </AlertDialogAction>
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
    uiKitOptions: Array<{ id: Project["settings"]["uiKitId"]; title: string }>;
    updateProject: (project: Project) => void;
}) {
    function handleUiKitChange(nextUiKitId: Project["settings"]["uiKitId"]) {
        updateProject({
            ...project,
            settings: {
                ...project.settings,
                uiKitId: nextUiKitId,
                uiMode: nextUiKitId === "none" ? "html-tags" : "ui-kit",
            },
        });
    }

    return (
        <div className="rounded-md border bg-muted/30 p-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div className="space-y-1">
                    <p className="text-sm font-medium">Настройки проекта</p>
                    <p className="text-xs text-muted-foreground">
                        UI kit меняет Sandpack preview без перезагрузки страницы. Режим: {project.settings.uiMode === "html-tags" ? "HTML-теги" : "UI kit"}.
                    </p>
                </div>
                <label className="flex flex-col gap-1 text-sm">
                    <span className="text-xs text-muted-foreground">UI kit</span>
                    <select
                        className="h-9 rounded-md border bg-background px-3 text-sm"
                        value={project.settings.uiKitId}
                        onChange={(event) => handleUiKitChange(event.target.value as Project["settings"]["uiKitId"])}
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
                onResetLevel={() => controller.reset.handleLevelReset()}
                onResetTask={() => controller.reset.handleTaskReset()}
                resetError={controller.actions.resetError}
            />
            <WorkbenchOverview controller={controller} props={props} />
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

function TaskTip({
    currentLevel,
    currentLevelDisplayStatus,
    maxLevel,
    commonExplanation,
    content,
    editableFileIds,
    levelAssetBasePath,
    promptsLimit,
    promptsUsed,
}: {
    currentLevel: number;
    currentLevelDisplayStatus: WorkbenchProps["taskItem"]["progress"]["currentLevelDisplayStatus"];
    maxLevel: number;
    commonExplanation: string;
    content: string;
    editableFileIds: string[];
    levelAssetBasePath?: string;
    promptsLimit: number;
    promptsUsed: number;
}) {
    const visibleFiles = taskWorkbenchFiles.filter((file) => editableFileIds.includes(file.id));

    return (
        <div
            data-testid="workbench-context-block"
            className="space-y-4 rounded-2xl border border-black/10 bg-[#f8f4eb] p-4 shadow-sm"
        >
            <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">Контекст уровня</p>
                <p className="text-base font-semibold text-black">Что важно в этой задаче</p>
            </div>

            <MarkdownContent className="text-sm leading-6" content={content || "Для этого уровня пока нет отдельного пояснения задачи."} />

            <div data-testid="workbench-context-status" className="grid gap-2 sm:grid-cols-3">
                <ContextStatusItem label="Уровень" value={`${currentLevel} из ${maxLevel}`} />
                <ContextStatusItem label="Промпты" value={`${promptsUsed} / ${promptsLimit}`} />
                <ContextStatusItem label="Файлы" value={`${visibleFiles.length} шт.`} />
            </div>

            <div className="rounded-xl border border-black/10 bg-white/80 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-black">
                    <Files className="size-4 text-black/60" aria-hidden="true" />
                    Рабочие файлы уровня: {visibleFiles.length}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                    {visibleFiles.map((file) => (
                        <span
                            key={file.id}
                            className="inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-black/75"
                        >
                            {file.title}: <code className="ml-1">{file.fileName}</code>
                        </span>
                    ))}
                </div>
                {currentLevelDisplayStatus === "awaiting_check_retry" ? (
                    <p className="mt-3 text-sm text-black/70">Статус уровня: ждёт повторной проверки.</p>
                ) : null}
            </div>

            <details
                data-testid="workbench-level-explanation"
                className="group rounded-xl border border-black/10 bg-white/80 p-3"
            >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-black">
                    Полное пояснение уровня
                    <ChevronDown className="size-4 text-black/50 transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <MarkdownContent
                    className="mt-3 text-sm leading-6 text-black/80"
                    assetBasePath={levelAssetBasePath}
                    content={commonExplanation || "Общее пояснение уровня пока не заполнено."}
                />
            </details>
        </div>
    );
}

function WorkbenchOverview({ controller, props }: { controller: WorkbenchController; props: WorkbenchProps }) {
    const editableFileIds = props.taskData.labContext?.editableFileIds ?? [];
    const levelAssetBasePath = props.taskData.labContext ? getLevelAssetPath(props.taskData.labContext.levelId) : undefined;
    const commonExplanation = props.taskData.labContext?.commonExplanation ?? "";

    return (
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.9fr)]">
            <div data-testid="workbench-preview-block" className="rounded-2xl border border-black/10 bg-[#f6f2ea] p-3 shadow-sm">
                <InOut
                    task={props.taskItem.id}
                    taskData={props.taskData}
                    started={props.taskItem.started}
                    reloadKey={controller.project.previewVersion}
                    startStatus=""
                    project={controller.project.project}
                />
            </div>
            <TaskTip
                currentLevel={props.taskItem.progress.currentLevel}
                currentLevelDisplayStatus={props.taskItem.progress.currentLevelDisplayStatus}
                maxLevel={props.taskItem.maxLevel}
                commonExplanation={commonExplanation}
                content={controller.hint.taskTip}
                editableFileIds={editableFileIds}
                levelAssetBasePath={levelAssetBasePath}
                promptsLimit={props.taskItem.progress.promptsLimit}
                promptsUsed={props.taskItem.progress.promptsUsed}
            />
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
                screenEvent={props.screenEvent}
                onScreenEventChange={(nextScreenEvent) => void controller.handleFileChange(nextScreenEvent.activeScreen)}
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
