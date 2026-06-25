"use client";

import type { WorkbenchProps } from "./props";
import type { useWorkbenchController } from "./useWorkbenchController";
import { WorkbenchHeader } from "./WorkbenchHeader";
import {
    WorkbenchFooter,
    WorkbenchOverview,
    WorkbenchWorkArea,
} from "./WorkbenchContent";
import { WorkbenchProjectMigrationStatus } from "./WorkbenchProjectShell";

type WorkbenchController = ReturnType<typeof useWorkbenchController>;

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
        <div className="space-y-3">
            <WorkbenchProjectMigrationStatus project={controller.project.project} />
            <WorkbenchHeader
                interactionDisabled={!controller.project.projectReady}
                taskItem={props.taskItem}
                completePending={controller.actions.completePending}
                resetPending={controller.actions.resetPending}
                onBackToLevelList={() => void controller.handleBackToLevelList()}
                onCheck={() => void controller.actions.handleCheck()}
                onResetLevel={() => controller.reset.handleLevelReset()}
                onResetTask={() => controller.reset.handleTaskReset()}
                onSelectWorkflowPoint={(pointId) => void controller.handleWorkflowPointSelect(pointId)}
                resetError={controller.actions.resetError}
                surface={controller.surface}
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
