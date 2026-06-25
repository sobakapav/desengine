"use client";

import dynamic from "next/dynamic";
import { type KeyboardEvent as ReactKeyboardEvent } from "react";
import { ChevronDown, Files } from "lucide-react";

import { MarkdownContent } from "../../system/MarkdownContent";
import { InOut } from "../InOut";
import { Button } from "@/components/ui/button";
import { taskWorkbenchFiles } from "@/lib/system/config/client";
import { getLevelAssetPath } from "@/lib/level/navigation";

import type { WorkbenchProps } from "./props";
import type { useWorkbenchController } from "./useWorkbenchController";
import {
    WorkbenchProjectLoadingState,
    WorkbenchProjectSettings,
} from "./WorkbenchProjectShell";
import type { WorkbenchSurfaceSnapshot } from "./workbenchSurface";

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

function ContextStatusItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-black/10 bg-white/85 px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.16em] text-black/45">{label}</p>
            <p className="mt-1 text-sm font-medium text-black">{value}</p>
        </div>
    );
}

function TaskTip({
    surface,
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
    surface: WorkbenchSurfaceSnapshot | null;
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
            className="space-y-3 rounded-2xl border border-black/10 bg-[#f8f4eb] p-3 shadow-sm"
        >
            <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">Контекст workflow-сессии</p>
                <p className="text-base font-semibold text-black">Что сейчас формирует итоговый рендер</p>
            </div>

            <MarkdownContent className="text-sm leading-6" content={content || "Для этой задачи пока нет отдельного пояснения."} />

            <div data-testid="workbench-context-status" className="grid gap-2 sm:grid-cols-3">
                <ContextStatusItem label="Workflow" value={surface?.workflowStepTitle ?? `Шаг ${currentLevel} из ${maxLevel}`} />
                <ContextStatusItem label="Промпты" value={`${promptsUsed} / ${promptsLimit}`} />
                <ContextStatusItem label="Файлы" value={`${visibleFiles.length} шт.`} />
            </div>

            <div className="rounded-xl border border-black/10 bg-white/80 p-3">
                <p className="text-sm text-black/70">
                    {surface?.renderCenterDescription ?? "Главный outcome этого экрана: довести решение до состояния «Проверка пройдена»."}
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-black">
                    <Files className="size-4 text-black/60" aria-hidden="true" />
                    {surface?.renderCenterTitle ?? "Рабочие файлы поверхности"}: {visibleFiles.length}
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
                    <p className="mt-3 text-sm text-black/70">Следующий шаг: повторить проверку, не начиная отдельный новый workflow-этап.</p>
                ) : null}
            </div>

            <details
                data-testid="workbench-level-explanation"
                className="group rounded-xl border border-black/10 bg-white/80 p-3"
            >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-black">
                    Полное пояснение исходной задачи
                    <ChevronDown className="size-4 text-black/50 transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <MarkdownContent
                    className="mt-3 text-sm leading-6 text-black/80"
                    assetBasePath={levelAssetBasePath}
                    content={commonExplanation || "Общее пояснение задачи пока не заполнено."}
                />
            </details>
        </div>
    );
}

/**
 * @example
 * ```tsx
 * <WorkbenchOverview controller={controller} props={props} />
 * ```
 */
export function WorkbenchOverview({ controller, props }: { controller: WorkbenchController; props: WorkbenchProps }) {
    const editableFileIds = props.taskData.labContext?.editableFileIds ?? [];
    const levelAssetBasePath = props.taskData.labContext ? getLevelAssetPath(props.taskData.labContext.levelId) : undefined;
    const commonExplanation = props.taskData.labContext?.commonExplanation ?? "";

    return (
        <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.9fr)]">
            <div data-testid="workbench-preview-block" className="rounded-2xl border border-black/10 bg-[#f6f2ea] p-2.5 shadow-sm">
                <div className="mb-2 rounded-xl border border-black/10 bg-white/80 px-4 py-3 text-sm text-black/70">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
                        {controller.surface?.renderCenterTitle ?? "Главный рендер результата"}
                    </p>
                    <p className="mt-1">
                        {controller.surface?.renderCenterDescription ?? "Предпросмотр показывает текущее состояние компонента."}
                    </p>
                </div>
                {controller.project.projectReady ? (
                    <InOut
                        task={props.taskItem.id}
                        taskData={props.taskData}
                        started={props.taskItem.started}
                        reloadKey={controller.project.previewVersion}
                        startStatus=""
                        project={controller.project.project}
                    />
                ) : (
                    <div className="rounded-xl border border-dashed border-black/10 bg-white/80 p-4 text-sm text-muted-foreground">
                        Загружаем предпросмотр для активного проекта…
                    </div>
                )}
            </div>
            <TaskTip
                surface={controller.surface}
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

/**
 * @example
 * ```tsx
 * <WorkbenchWorkArea controller={controller} props={props} />
 * ```
 */
export function WorkbenchWorkArea({ controller, props }: { controller: WorkbenchController; props: WorkbenchProps }) {
    if (!controller.project.projectReady) {
        return <WorkbenchProjectLoadingState />;
    }

    return (
        <div className="space-y-3 pb-4">
            {controller.dirty.dirtyFileIds.length > 0 && (
                <div className="flex items-center gap-2">
                    <Button onClick={() => void controller.save.saveDirtyFiles()} variant="secondary" disabled={controller.save.saveStatus === "saving"}>
                        {controller.save.saveStatus === "saving" ? "Сохранение…" : "Сохранить"}
                    </Button>
                </div>
            )}
            <WorkbenchProjectSettings
                createPending={controller.project.projectActionPending}
                project={controller.project.project}
                projectActionError={controller.project.projectActionError}
                projectActionPending={controller.project.projectActionPending}
                projects={controller.project.projects}
                selectProject={controller.project.handleProjectSelect}
                uiKitOptions={controller.project.uiKitOptions}
                updateProject={controller.project.migrateProjectUiKit}
                onCreateProject={controller.project.handleProjectCreate}
            />
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

/**
 * @example
 * ```tsx
 * <WorkbenchFooter controller={controller} props={props} />
 * ```
 */
export function WorkbenchFooter({ controller, props }: { controller: WorkbenchController; props: WorkbenchProps }) {
    if (!props.taskItem.progress.currentLevelStarted || !controller.project.projectReady) {
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
