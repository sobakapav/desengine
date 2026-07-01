"use client";

import { useState } from "react";

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

import type { WorkbenchProps } from "./props";
import { WorkbenchSurfaceSummary } from "./WorkbenchSurfaceSummary";
import type { WorkbenchSurfaceSnapshot } from "./workbenchSurface";
import { useTaskProjectComponent } from "@/components/desengine/project/useTaskProjectComponent";

function getRemainingOutcomeText(taskItem: WorkbenchProps["taskItem"]) {
    const remainingChecks = Math.max(taskItem.progress.checkAttemptsLimit - taskItem.progress.checkAttemptsUsed, 0);

    if (taskItem.progress.isCompleted) {
        return "Главный outcome уже достигнут: проверка пройдена.";
    }

    if (taskItem.progress.currentLevelDisplayStatus === "awaiting_check_retry") {
        return `До состояния «Проверка пройдена» остался один шаг: повторить проверку. Попыток проверки осталось ${remainingChecks} из ${taskItem.progress.checkAttemptsLimit}.`;
    }

    if (remainingChecks === 0) {
        return "Лимит содержательных проверок исчерпан. Вернитесь к рабочим файлам, чтобы разобрать решение, затем сбросьте текущую итерацию или всю задачу.";
    }

    if (taskItem.progress.currentLevelNotStarted) {
        return "До состояния «Проверка пройдена» осталось начать workflow-сессию, собрать решение и отправить его на проверку.";
    }

    return `До состояния «Проверка пройдена» осталось закончить решение и отправить его на проверку. Попыток проверки осталось ${remainingChecks} из ${taskItem.progress.checkAttemptsLimit}.`;
}

function ResetErrorNotice({ message }: { message: string }) {
    return (
        <pre className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive whitespace-pre-wrap">
            {message}
        </pre>
    );
}

function LevelResetDialog({
    canResetCurrentLevel,
    completePending,
    interactionDisabled,
    onResetLevel,
    resetError,
    resetPending,
}: {
    canResetCurrentLevel: boolean;
    completePending: boolean;
    interactionDisabled: boolean;
    onResetLevel: () => Promise<boolean>;
    resetError: string;
    resetPending: boolean;
}) {
    const [open, setOpen] = useState(false);

    async function handleConfirm() {
        const success = await onResetLevel();
        if (success) {
            setOpen(false);
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={interactionDisabled || completePending || resetPending || !canResetCurrentLevel}>
                    {resetPending ? "Сброс…" : "Сбросить текущую итерацию"}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogTitle>Сбросить текущую итерацию workflow?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Будут удалены рабочие файлы, история уточнений и проверки только у текущего рабочего среза. Уже пройденный прогресс сохранится.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                {open && resetError ? <ResetErrorNotice message={resetError} /> : null}
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={resetPending}>Отмена</AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
                        disabled={resetPending}
                        onClick={(event) => {
                            event.preventDefault();
                            void handleConfirm();
                        }}
                    >
                        {resetPending ? "Сбрасываем итерацию…" : "Подтвердить сброс итерации"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function TaskResetDialog({
    interactionDisabled,
    onResetTask,
    resetError,
    resetPending,
}: {
    interactionDisabled: boolean;
    onResetTask: () => Promise<boolean>;
    resetError: string;
    resetPending: boolean;
}) {
    const [open, setOpen] = useState(false);

    async function handleConfirm() {
        const success = await onResetTask();
        if (success) {
            setOpen(false);
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={interactionDisabled || resetPending}>
                    {resetPending ? "Сброс…" : "Сбросить задачу"}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogTitle>Сбросить всю задачу?</AlertDialogTitle>
                    <AlertDialogDescription>Будут удалены рабочие файлы и история уточнений. Задача снова станет не начатой.</AlertDialogDescription>
                </AlertDialogHeader>
                {open && resetError ? <ResetErrorNotice message={resetError} /> : null}
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={resetPending}>Отмена</AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
                        disabled={resetPending}
                        onClick={(event) => {
                            event.preventDefault();
                            void handleConfirm();
                        }}
                    >
                        {resetPending ? "Сбрасываем задачу…" : "Подтвердить полный сброс"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function WorkbenchHeaderActions({
    canCheckCurrentLevel,
    canResetCurrentLevel,
    completePending,
    interactionDisabled,
    onBackToLevelList,
    onCheck,
    onResetLevel,
    onResetTask,
    resetError,
    resetPending,
}: {
    canCheckCurrentLevel: boolean;
    canResetCurrentLevel: boolean;
    completePending: boolean;
    interactionDisabled: boolean;
    onBackToLevelList: () => void;
    onCheck: () => void;
    onResetLevel: () => Promise<boolean>;
    onResetTask: () => Promise<boolean>;
    resetError: string;
    resetPending: boolean;
}) {
    return (
        <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={onBackToLevelList}>Назад к задачам</Button>
            <LevelResetDialog
                canResetCurrentLevel={canResetCurrentLevel}
                completePending={completePending}
                interactionDisabled={interactionDisabled}
                onResetLevel={onResetLevel}
                resetError={resetError}
                resetPending={resetPending}
            />
            <TaskResetDialog
                interactionDisabled={interactionDisabled || completePending}
                onResetTask={onResetTask}
                resetError={resetError}
                resetPending={resetPending}
            />
            <Button variant="secondary" disabled={interactionDisabled || completePending || resetPending || !canCheckCurrentLevel} onClick={onCheck}>
                {completePending ? "Проверяем решение…" : "Отправить решение на проверку"}
            </Button>
        </div>
    );
}

/**
 * @example
 * ```tsx
 * <WorkbenchHeader
 *   interactionDisabled={!controller.project.projectReady}
 *   taskItem={props.taskItem}
 *   completePending={controller.actions.completePending}
 *   resetPending={controller.actions.resetPending}
 *   onBackToLevelList={() => void controller.handleBackToLevelList()}
 *   onCheck={() => void controller.actions.handleCheck()}
 *   onResetLevel={() => controller.reset.handleLevelReset()}
 *   onResetTask={() => controller.reset.handleTaskReset()}
 *   resetError={controller.actions.resetError}
 * />
 * ```
 */
export function WorkbenchHeader({
    interactionDisabled,
    completePending,
    onBackToLevelList,
    onCheck,
    onResetLevel,
    onResetTask,
    onSelectWorkflowPoint,
    resetError,
    resetPending,
    surface,
    taskItem,
}: Pick<WorkbenchProps, "taskItem"> & {
    interactionDisabled: boolean;
    completePending: boolean;
    onBackToLevelList: () => void;
    onCheck: () => void;
    onResetLevel: () => Promise<boolean>;
    onResetTask: () => Promise<boolean>;
    onSelectWorkflowPoint: (pointId: string) => void;
    resetError: string;
    resetPending: boolean;
    surface: WorkbenchSurfaceSnapshot | null;
}) {
    const projectComponentState = useTaskProjectComponent(taskItem.id, surface?.projectId ?? null);
    const canResetCurrentLevel = taskItem.progress.currentLevelStarted && taskItem.progress.currentLevelStatus !== "completed";
    const canCheckCurrentLevel = canResetCurrentLevel
        && taskItem.progress.checkAttemptsUsed < taskItem.progress.checkAttemptsLimit;

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">Рабочая сессия</p>
                    {projectComponentState.component ? (
                        <p className="text-sm font-medium text-black/75">
                            Компонент проекта: {projectComponentState.component.title}
                        </p>
                    ) : (
                        <p className="text-muted-foreground">Задача: <code>{taskItem.id}</code></p>
                    )}
                    <h1 className="text-2xl font-semibold text-black">{surface?.headline ?? "Работаем над workflow"}</h1>
                    <p className="text-sm font-medium text-black/70">
                        {surface ? `${surface.workflowStepTitle} • ${surface.sessionStatusLabel}` : "Текущий этап уже открыт"}
                    </p>
                    {surface?.selectedWorkflowPointTitle ? (
                        <p className="text-sm text-black/60">Текущий шаг: {surface.selectedWorkflowPointTitle}</p>
                    ) : null}
                    <p className="max-w-2xl text-sm text-muted-foreground">
                        {surface?.outcomeLabel ?? getRemainingOutcomeText(taskItem)}
                    </p>
                </div>
                <WorkbenchHeaderActions
                    canCheckCurrentLevel={canCheckCurrentLevel}
                    canResetCurrentLevel={canResetCurrentLevel}
                    completePending={completePending}
                    interactionDisabled={interactionDisabled}
                    onBackToLevelList={onBackToLevelList}
                    onCheck={onCheck}
                    onResetLevel={onResetLevel}
                    onResetTask={onResetTask}
                    resetError={resetError}
                    resetPending={resetPending}
                />
            </div>
            {surface ? (
                <WorkbenchSurfaceSummary
                    componentTitle={projectComponentState.component?.title ?? null}
                    onSelectWorkflowPoint={onSelectWorkflowPoint}
                    surface={surface}
                />
            ) : null}
        </div>
    );
}
