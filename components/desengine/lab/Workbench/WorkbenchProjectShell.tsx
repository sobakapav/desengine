"use client";

import { useState } from "react";
import { type Project } from "@/lib/project/runtime";

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
}: {
    createPending: boolean;
    projectActionError: string;
    projectActionPending: boolean;
    project: Project;
    projects: Project[];
    selectProject: (projectId: string) => Promise<void>;
    uiKitOptions: Array<{ id: Project["settings"]["uiKitId"]; title: string }>;
    updateProject: (uiKitId: Project["settings"]["uiKitId"]) => Promise<boolean>;
    onCreateProject: (title: string) => Promise<boolean>;
}) {
    const [nextProjectTitle, setNextProjectTitle] = useState("");
    const [uiKitDialogOpen, setUiKitDialogOpen] = useState(false);
    const [pendingUiKitId, setPendingUiKitId] = useState<Project["settings"]["uiKitId"] | null>(null);

    function handleUiKitChange(nextUiKitId: Project["settings"]["uiKitId"]) {
        if (nextUiKitId === project.settings.uiKitId) {
            setPendingUiKitId(null);
            setUiKitDialogOpen(false);
            return;
        }

        setPendingUiKitId(nextUiKitId);
        setUiKitDialogOpen(true);
    }

    async function handleProjectCreate() {
        const created = await onCreateProject(nextProjectTitle);

        if (created) {
            setNextProjectTitle("");
        }
    }

    async function handleMigrationConfirm() {
        if (!pendingUiKitId) {
            return;
        }

        const success = await updateProject(pendingUiKitId);
        if (success) {
            setPendingUiKitId(null);
            setUiKitDialogOpen(false);
        }
    }

    const pendingUiKitTitle = pendingUiKitId
        ? (uiKitOptions.find((kit) => kit.id === pendingUiKitId)?.title ?? pendingUiKitId)
        : "";

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
                    <div className="space-y-3 rounded-xl border border-black/10 bg-white/80 p-3">
                        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                            <label className="flex flex-col gap-1 text-sm">
                                <span className="text-xs text-muted-foreground">Активный проект</span>
                                <select
                                    className="h-9 rounded-md border bg-background px-3 text-sm"
                                    value={project.id}
                                    disabled={createPending || projects.length === 0}
                                    onChange={(event) => void selectProject(event.target.value)}
                                >
                                    {projects.map((workspace) => (
                                        <option key={workspace.id} value={workspace.id}>
                                            {workspace.title}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <div className="rounded-md border border-dashed border-black/10 bg-background/70 px-3 py-2 text-xs text-muted-foreground">
                                <div>ID: <code>{project.id}</code></div>
                                <div className="mt-1">Обновлён: {formatProjectUpdatedAt(project.updatedAt)}</div>
                            </div>
                        </div>

                        <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
                            <label className="flex flex-col gap-1 text-sm">
                                <span className="text-xs text-muted-foreground">Новый проект</span>
                                <input
                                    className="h-9 rounded-md border bg-background px-3 text-sm"
                                    placeholder="Например, UI kit sandbox"
                                    value={nextProjectTitle}
                                    disabled={createPending}
                                    onChange={(event) => setNextProjectTitle(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") {
                                            event.preventDefault();
                                            void handleProjectCreate();
                                        }
                                    }}
                                />
                            </label>
                            <Button
                                className="md:self-end"
                                variant="outline"
                                disabled={createPending}
                                onClick={() => void handleProjectCreate()}
                            >
                                {createPending ? "Создаём…" : "Создать"}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-3 rounded-xl border border-black/10 bg-white/80 p-3">
                        <label className="flex flex-col gap-1 text-sm">
                            <span className="text-xs text-muted-foreground">UI kit</span>
                            <select
                                className="h-9 rounded-md border bg-background px-3 text-sm"
                                value={project.settings.uiKitId}
                                disabled={projectActionPending}
                                onChange={(event) => handleUiKitChange(event.target.value as Project["settings"]["uiKitId"])}
                            >
                                {uiKitOptions.map((kit) => <option key={kit.id} value={kit.id}>{kit.title}</option>)}
                            </select>
                        </label>
                        <div className="rounded-md border border-black/10 bg-background/70 px-3 py-2 text-xs text-muted-foreground">
                            Настройки предпросмотра берутся из настроек проекта, а состояние переключения сохраняется в самом проекте.
                        </div>
                    </div>
                </div>

                {projectActionError ? (
                    <pre className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive whitespace-pre-wrap">
                        {projectActionError}
                    </pre>
                ) : null}
                <AlertDialog open={uiKitDialogOpen} onOpenChange={setUiKitDialogOpen}>
                    <AlertDialogContent size="sm">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Переключить проект на другой UI kit?</AlertDialogTitle>
                            <AlertDialogDescription>
                                UI kit переключится на {pendingUiKitTitle}, а текущая работа вернётся к стартовому состоянию и потребует повторного прохождения.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                disabled={projectActionPending}
                                onClick={() => setPendingUiKitId(null)}
                            >
                                Отмена
                            </AlertDialogCancel>
                            <AlertDialogAction
                                disabled={projectActionPending}
                                onClick={(event) => {
                                    event.preventDefault();
                                    void handleMigrationConfirm();
                                }}
                            >
                                {projectActionPending ? "Переключаем UI kit…" : "Подтвердить переключение"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
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
