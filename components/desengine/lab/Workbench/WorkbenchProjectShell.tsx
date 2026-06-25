"use client";
import { type Project } from "@/lib/project/runtime";
import { parseProjectComponentRuntimeId } from "@/lib/task/project-runtime-scope-id";
import { useWorkbenchProjectSettingsController } from "./useWorkbenchProjectSettingsController";

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
} from "@/components/ui/alert-dialog";

function formatProjectUpdatedAt(updatedAt: string) {
    const parsedDate = new Date(updatedAt);
    if (Number.isNaN(parsedDate.getTime())) {
        return "Не удалось определить";
    }

    const isoValue = parsedDate.toISOString();
    const [datePart = "", timePartWithMs = ""] = isoValue.split("T");
    const [year = "", month = "", day = ""] = datePart.split("-");
    const [hours = "", minutes = ""] = timePartWithMs.split(":");

    if (!year || !month || !day || !hours || !minutes) {
        return "Не удалось определить";
    }

    return `${day}.${month}.${year}, ${hours}:${minutes} UTC`;
}

type WorkbenchProjectSettingsProps = {
    createPending: boolean;
    projectActionError: string;
    projectActionPending: boolean;
    project: Project;
    projects: Project[];
    selectProject: (projectId: string) => Promise<void>;
    uiKitOptions: Array<{ id: Project["settings"]["uiKitId"]; title: string }>;
    updateProject: (uiKitId: Project["settings"]["uiKitId"]) => Promise<boolean>;
    onCreateProject: (title: string) => Promise<boolean>;
}

function ProjectScopeSection(args: {
    createPending: boolean;
    nextProjectTitle: string;
    onCreate: () => void;
    onTitleChange: (value: string) => void;
    project: Project;
    projects: Project[];
    selectProject: (projectId: string) => Promise<void>;
    visibleProjectId: string;
}) {
    return (
        <div className="space-y-3 rounded-xl border border-black/10 bg-white/80 p-3">
            <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                <label className="flex flex-col gap-1 text-sm">
                    <span className="text-xs text-muted-foreground">Активный проект</span>
                    <select className="h-9 rounded-md border bg-background px-3 text-sm" value={args.project.id} disabled={args.createPending || args.projects.length === 0} onChange={(event) => void args.selectProject(event.target.value)}>
                        {args.projects.map((workspace) => <option key={workspace.id} value={workspace.id}>{workspace.title}</option>)}
                    </select>
                </label>
                <div className="rounded-md border border-dashed border-black/10 bg-background/70 px-3 py-2 text-xs text-muted-foreground">
                    <div>ID: <code>{args.visibleProjectId}</code></div>
                    <div className="mt-1">Обновлён: {formatProjectUpdatedAt(args.project.updatedAt)}</div>
                </div>
            </div>
            <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
                <label className="flex flex-col gap-1 text-sm">
                    <span className="text-xs text-muted-foreground">Новый проект</span>
                    <input
                        className="h-9 rounded-md border bg-background px-3 text-sm"
                        placeholder="Например, UI kit sandbox"
                        value={args.nextProjectTitle}
                        disabled={args.createPending}
                        onChange={(event) => args.onTitleChange(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                event.preventDefault();
                                void args.onCreate();
                            }
                        }}
                    />
                </label>
                <Button className="md:self-end" variant="outline" disabled={args.createPending} onClick={() => void args.onCreate()}>
                    {args.createPending ? "Создаём…" : "Создать"}
                </Button>
            </div>
        </div>
    );
}

function ProjectUiKitSection(args: {
    onUiKitChange: (nextUiKitId: Project["settings"]["uiKitId"]) => void;
    project: Project;
    projectActionPending: boolean;
    uiKitOptions: Array<{ id: Project["settings"]["uiKitId"]; title: string }>;
}) {
    return (
        <div className="space-y-3 rounded-xl border border-black/10 bg-white/80 p-3">
            <label className="flex flex-col gap-1 text-sm">
                <span className="text-xs text-muted-foreground">UI kit</span>
                <select
                    className="h-9 rounded-md border bg-background px-3 text-sm"
                    value={args.project.settings.uiKitId}
                    disabled={args.projectActionPending}
                    onChange={(event) => args.onUiKitChange(event.target.value as Project["settings"]["uiKitId"])}
                >
                    {args.uiKitOptions.map((kit) => <option key={kit.id} value={kit.id}>{kit.title}</option>)}
                </select>
            </label>
            <div className="rounded-md border border-black/10 bg-background/70 px-3 py-2 text-xs text-muted-foreground">
                Настройки предпросмотра берутся из настроек проекта, а состояние переключения сохраняется в самом проекте.
            </div>
        </div>
    );
}

function ProjectUiKitDialog(args: {
    open: boolean;
    pendingUiKitTitle: string;
    projectActionPending: boolean;
    onConfirm: () => void;
    onOpenChange: (open: boolean) => void;
    onResetPendingUiKit: () => void;
}) {
    return (
        <AlertDialog open={args.open} onOpenChange={args.onOpenChange}>
            <AlertDialogContent size="sm">
                <AlertDialogHeader>
                    <AlertDialogTitle>Переключить проект на другой UI kit?</AlertDialogTitle>
                    <AlertDialogDescription>
                        UI kit переключится на {args.pendingUiKitTitle}, а текущая работа вернётся к стартовому состоянию и потребует повторного прохождения.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={args.projectActionPending} onClick={args.onResetPendingUiKit}>
                        Отмена
                    </AlertDialogCancel>
                    <AlertDialogAction disabled={args.projectActionPending} onClick={(event) => {
                        event.preventDefault();
                        args.onConfirm();
                    }}>
                        {args.projectActionPending ? "Переключаем UI kit…" : "Подтвердить переключение"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

/**
 * @example
 * ```tsx
 * if (!projectReady) return <WorkbenchProjectLoadingState />
 * ```
 */
export function WorkbenchProjectLoadingState() {
    return (
        <div className="rounded-md border bg-muted/30 p-3">
            <div className="space-y-2 rounded-xl border border-black/10 bg-white/80 p-3">
                <p className="text-sm font-medium">Проект работы</p>
                <p className="text-sm text-muted-foreground">
                    Загружаем активный проект из локального списка. До завершения загрузки предпросмотр и действия проекта временно недоступны.
                </p>
            </div>
        </div>
    );
}

/**
 * @example
 * ```tsx
 * <WorkbenchProjectSettings
 *   project={project}
 *   projects={projects}
 *   selectProject={handleProjectSelect}
 *   updateProject={migrateProjectUiKit}
 *   onCreateProject={handleProjectCreate}
 * />
 * ```
 */
export function WorkbenchProjectSettings({
    createPending,
    projectActionError,
    projectActionPending,
    project,
    projects,
    selectProject,
    uiKitOptions,
    updateProject,
    onCreateProject,
}: WorkbenchProjectSettingsProps) {
    const visibleProjectId = parseProjectComponentRuntimeId(project.id).projectId;
    const controller = useWorkbenchProjectSettingsController({
        onCreateProject,
        project,
        uiKitOptions,
        updateProject,
    });

    return (
        <div className="rounded-md border bg-muted/30 p-3">
            <div className="space-y-3">
                <div className="space-y-1">
                    <p className="text-sm font-medium">Проект работы</p>
                    <p className="text-xs text-muted-foreground">
                        Активный проект задаёт рабочий контекст предпросмотра. Если сменить `UI kit`, текущую работу нужно будет заново пройти уже в новом проектном контексте.
                    </p>
                </div>

                <div className="grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                    <ProjectScopeSection
                        createPending={createPending}
                        nextProjectTitle={controller.nextProjectTitle}
                        onCreate={() => void controller.handleProjectCreate()}
                        onTitleChange={controller.setNextProjectTitle}
                        project={project}
                        projects={projects}
                        selectProject={selectProject}
                        visibleProjectId={visibleProjectId}
                    />
                    <ProjectUiKitSection
                        onUiKitChange={controller.handleUiKitChange}
                        project={project}
                        projectActionPending={projectActionPending}
                        uiKitOptions={uiKitOptions}
                    />
                </div>

                {projectActionError ? (
                    <pre className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive whitespace-pre-wrap">
                        {projectActionError}
                    </pre>
                ) : null}
                <ProjectUiKitDialog
                    open={controller.uiKitDialogOpen}
                    pendingUiKitTitle={controller.pendingUiKitTitle}
                    projectActionPending={projectActionPending}
                    onConfirm={() => void controller.handleMigrationConfirm()}
                    onOpenChange={controller.setUiKitDialogOpen}
                    onResetPendingUiKit={() => controller.setPendingUiKitId(null)}
                />
            </div>
        </div>
    );
}

/**
 * @example
 * ```tsx
 * <WorkbenchProjectMigrationStatus project={project} />
 * ```
 */
export function WorkbenchProjectMigrationStatus({ project }: { project: Project }) {
    if (project.migration.state === "idle" || !project.migration.message) {
        return null;
    }

    const toneClassName = project.migration.state === "failed"
        ? "border-destructive/40 bg-destructive/5 text-destructive"
        : project.migration.state === "pending"
            ? "border-amber-300 bg-amber-50 text-amber-950"
            : "border-black/10 bg-[#f6f2ea] text-black";

    return (
        <div className={`rounded-2xl border p-3 text-sm ${toneClassName}`}>
            <p className="font-medium">
                Переключение UI kit проекта: {project.migration.sourceUiKitId} → {project.migration.targetUiKitId}
            </p>
            <p className="mt-1 whitespace-pre-wrap">{project.migration.message}</p>
        </div>
    );
}
