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

function getRemainingOutcomeText(taskItem: WorkbenchProps["taskItem"]) {
    const remainingChecks = Math.max(taskItem.progress.checkAttemptsLimit - taskItem.progress.checkAttemptsUsed, 0);

    if (taskItem.progress.isCompleted) {
        return "Главный outcome уже достигнут: проверка пройдена.";
    }

    if (taskItem.progress.currentLevelDisplayStatus === "awaiting_check_retry") {
        return `До состояния «Проверка пройдена» остался один шаг: повторить проверку. Попыток проверки осталось ${remainingChecks} из ${taskItem.progress.checkAttemptsLimit}.`;
    }

    if (taskItem.progress.currentLevelNotStarted) {
        return "До состояния «Проверка пройдена» осталось начать уровень, сделать решение и отправить его на проверку.";
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
    canCompleteCurrentLevel,
    completePending,
    interactionDisabled,
    onResetLevel,
    resetError,
    resetPending,
}: {
    canCompleteCurrentLevel: boolean;
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
                <Button variant="outline" disabled={interactionDisabled || completePending || resetPending || !canCompleteCurrentLevel}>
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
                        {resetPending ? "Сбрасываем уровень…" : "Подтвердить сброс уровня"}
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
    canCompleteCurrentLevel,
    completePending,
    interactionDisabled,
    onBackToLevelList,
    onCheck,
    onResetLevel,
    onResetTask,
    resetError,
    resetPending,
}: {
    canCompleteCurrentLevel: boolean;
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
            <Button variant="outline" onClick={onBackToLevelList}>К списку задач уровня</Button>
            <LevelResetDialog
                canCompleteCurrentLevel={canCompleteCurrentLevel}
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
            <Button variant="secondary" disabled={interactionDisabled || completePending || resetPending || !canCompleteCurrentLevel} onClick={onCheck}>
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
    resetError: string;
    resetPending: boolean;
    surface: WorkbenchSurfaceSnapshot | null;
}) {
    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">Рабочая поверхность</p>
                    <p className="text-muted-foreground">Задача: <code>{taskItem.id}</code></p>
                    <h1 className="text-2xl font-semibold text-black">Шаг workflow: уровень {taskItem.progress.currentLevel}</h1>
                    <p className="max-w-2xl text-sm text-muted-foreground">
                        {getRemainingOutcomeText(taskItem)}
                    </p>
                </div>
                <WorkbenchHeaderActions
                    canCompleteCurrentLevel={taskItem.progress.currentLevelStarted && taskItem.progress.currentLevelStatus !== "completed"}
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
            {surface ? <WorkbenchSurfaceSummary surface={surface} /> : null}
        </div>
    );
}
