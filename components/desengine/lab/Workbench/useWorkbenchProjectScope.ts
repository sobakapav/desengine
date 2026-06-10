"use client";

import { useEffect, useMemo, useState } from "react";

import { sandpackUiKitsConfig } from "@/lib/lab/sandpack-ui-kits.config";
import {
    completeProjectUiKitMigration,
    createProjectWorkspace,
    failProjectUiKitMigration,
    getProjectMigrationTarget,
    normalizeProject,
    projectNeedsUiKitMigration,
    startProjectUiKitMigration,
    type Project,
} from "@/lib/project/runtime";
import { createBrowserProjectStorage } from "@/lib/project/storage";

import type { WorkbenchProps } from "./props";
import { postProjectMigration } from "./useWorkbenchTaskActions";
import { changeLabTaskScreenEventInput, readLabTaskScreenEventActiveScreen } from "../LabScreen/screen-event";

function createProjectPlaceholder(taskId: string) {
    return normalizeProject({
        id: `task-${taskId}`,
        title: `Проект ${taskId}`,
        createdAt: "1970-01-01T00:00:00.000Z",
        updatedAt: "1970-01-01T00:00:00.000Z",
        settings: {
            uiKitId: "none",
            uiMode: "html-tags",
        },
    });
}

function createLabProjectDraft(taskId: string, title = `Проект ${taskId}`) {
    return {
        id: `task-${taskId}`,
        title,
    };
}

function createFallbackProject(taskId: string, title?: string) {
    if (!title) {
        return createProjectPlaceholder(taskId);
    }

    return normalizeProject({
        ...createProjectWorkspace(createLabProjectDraft(taskId, title)),
        createdAt: "1970-01-01T00:00:00.000Z",
        updatedAt: "1970-01-01T00:00:00.000Z",
        settings: {
            uiKitId: "none",
            uiMode: "html-tags",
        },
    });
}

function mergeProjects(currentProjects: Project[], nextProject: Project) {
    const existingIndex = currentProjects.findIndex((project) => project.id === nextProject.id);

    if (existingIndex < 0) {
        return [...currentProjects, nextProject];
    }

    return currentProjects.map((project, index) => index === existingIndex ? nextProject : project);
}

function buildTaskScopeUrl(taskId: string, project: Project) {
    const params = new URLSearchParams({
        projectId: project.id,
        projectTitle: project.title,
        uiKitId: project.settings.uiKitId,
        uiMode: project.settings.uiMode,
    });

    return `/api/tasks/${encodeURIComponent(taskId)}?${params.toString()}`;
}

async function fetchTaskScopeSnapshot(taskId: string, project: Project) {
    const res = await fetch(buildTaskScopeUrl(taskId, project), { method: "GET" });
    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.ok || !data.taskItem || !data.taskData) {
        throw new Error(data?.error || "Не удалось перезагрузить данные задачи для выбранного проекта.");
    }

    return data as {
        ok: true;
        taskItem: WorkbenchProps["taskItem"];
        taskData: WorkbenchProps["taskData"];
    };
}

/**
 * @example
 * ```ts
 * const projectState = useProjectController(taskId)
 * if (projectState.projectReady) console.log(projectState.project.settings.uiKitId)
 * ```
 */
export function useProjectController(taskId: string) {
    const fallbackProject = createFallbackProject(taskId);

    const [previewVersion, setPreviewVersion] = useState(0);
    const [project, setProject] = useState<Project>(fallbackProject);
    const [projects, setProjects] = useState<Project[]>([fallbackProject]);
    const [projectReady, setProjectReady] = useState(false);
    const [projectActionPending, setProjectActionPending] = useState(false);
    const [projectActionError, setProjectActionError] = useState("");
    const projectStorage = useMemo(() => {
        if (typeof window === "undefined") return null;
        return createBrowserProjectStorage({ storage: window.localStorage, taskId });
    }, [taskId]);
    const uiKitOptions = useMemo(() => Object.values(sandpackUiKitsConfig), []);

    async function refreshProjectState(preferredProjectId?: string, options?: { commit?: boolean }) {
        const shouldCommit = options?.commit ?? true;

        if (!projectStorage) {
            const nextFallbackProject = createFallbackProject(taskId);
            if (shouldCommit) {
                setProject(nextFallbackProject);
                setProjects([nextFallbackProject]);
            }
            return nextFallbackProject;
        }

        const nextProjects = await projectStorage.listProjects();
        const candidateProject = preferredProjectId
            ? await projectStorage.getProject(preferredProjectId)
            : await projectStorage.getActiveProject();

        const nextProject = candidateProject
            ?? nextProjects[0]
            ?? await projectStorage.createProject(createLabProjectDraft(taskId));

        await projectStorage.setActiveProjectId(nextProject.id);
        const resolvedProjects = await projectStorage.listProjects();

        if (shouldCommit) {
            setProject(nextProject);
            setProjects(resolvedProjects);
        }
        return nextProject;
    }

    useEffect(() => {
        let cancelled = false;

        async function loadProject() {
            const nextFallbackProject = createFallbackProject(taskId);

            setProjectReady(false);
            setProject(nextFallbackProject);
            setProjects([nextFallbackProject]);

            if (!projectStorage) {
                const runtimeProject = createProjectWorkspace(createLabProjectDraft(taskId));
                setProject(runtimeProject);
                setProjects([runtimeProject]);
                setProjectReady(true);
                return;
            }

            try {
                const nextProject = await refreshProjectState(undefined, { commit: false });
                if (!cancelled) {
                    setProject(nextProject);
                    setProjects(await projectStorage.listProjects());
                    setProjectReady(true);
                }
            } catch {
                if (!cancelled) {
                    const runtimeProject = createProjectWorkspace(createLabProjectDraft(taskId));
                    setProject(runtimeProject);
                    setProjects([runtimeProject]);
                    setProjectReady(true);
                }
            }
        }

        void loadProject();
        return () => { cancelled = true; };
    }, [projectStorage, taskId]);

    function persistProject(nextProject: Project, options?: { bumpPreview?: boolean }) {
        const normalized = normalizeProject(nextProject);
        setProject(normalized);
        setProjects((currentProjects) => mergeProjects(currentProjects, normalized));
        setProjectActionError("");
        if (options?.bumpPreview !== false) {
            setPreviewVersion((value) => value + 1);
        }

        void projectStorage?.saveProject(normalized)
            .then(() => projectStorage.setActiveProjectId(normalized.id))
            .catch(() => {
                // localStorage может быть недоступен в приватном режиме; runtime продолжит работать в памяти страницы.
            });

        return normalized;
    }

    async function createProject(title: string) {
        const normalizedTitle = title.trim();

        if (!normalizedTitle) {
            setProjectActionError("Укажите название проекта, чтобы создать новый workspace.");
            return null;
        }

        setProjectActionPending(true);
        setProjectActionError("");

        try {
            if (!projectStorage) {
                const nextFallbackProject = createFallbackProject(taskId, normalizedTitle);
                setProject(nextFallbackProject);
                setProjects([nextFallbackProject]);
                setPreviewVersion((value) => value + 1);
                return nextFallbackProject;
            }

            const createdProject = await projectStorage.createProject({ title: normalizedTitle });
            await projectStorage.setActiveProjectId(createdProject.id);
            await refreshProjectState(createdProject.id);
            setPreviewVersion((value) => value + 1);
            return createdProject;
        } catch {
            setProjectActionError("Не удалось создать проект. Проверьте localStorage и попробуйте снова.");
            return null;
        } finally {
            setProjectActionPending(false);
        }
    }

    async function selectProject(projectId: string) {
        if (project.id === projectId) {
            return project;
        }

        setProjectActionPending(true);
        setProjectActionError("");

        try {
            if (!projectStorage) {
                return null;
            }

            await projectStorage.setActiveProjectId(projectId);
            const nextProject = await refreshProjectState(projectId);
            if (nextProject.id !== project.id) {
                setPreviewVersion((value) => value + 1);
            }
            return nextProject;
        } catch {
            setProjectActionError("Не удалось переключить active project.");
            return null;
        } finally {
            setProjectActionPending(false);
        }
    }

    return {
        project,
        projectActionError,
        projectActionPending,
        projectReady,
        projects,
        previewVersion,
        persistProject,
        setProjectActionError,
        setProjectActionPending,
        setPreviewVersion,
        uiKitOptions,
        createProject,
        selectProject,
    };
}

/**
 * @example
 * ```ts
 * const projectScope = useWorkbenchProjectScope({ projectState, props, replaceTaskData, saveBeforeAction })
 * await projectScope.handleProjectSelect("project-2")
 * ```
 */
export function useWorkbenchProjectScope(args: {
    projectState: ReturnType<typeof useProjectController>;
    props: Pick<WorkbenchProps, "onScreenEventChange" | "onTaskItemChange" | "screenEvent" | "taskItem">;
    replaceTaskData: (taskData: WorkbenchProps["taskData"]) => void;
    saveBeforeAction: (targetFileIds?: string[]) => Promise<boolean>;
}) {
    const { projectState, props, replaceTaskData, saveBeforeAction } = args;

    async function rehydrateTaskScope(nextProject: Project, previousProjectId?: string) {
        try {
            const data = await fetchTaskScopeSnapshot(props.taskItem.id, nextProject);
            replaceTaskData(data.taskData);
            props.onTaskItemChange(data.taskItem);
            props.onScreenEventChange(changeLabTaskScreenEventInput({
                taskId: props.screenEvent.scope.taskId,
                activeScreen: readLabTaskScreenEventActiveScreen(props.screenEvent),
            }, "component"));
            return true;
        } catch (error) {
            if (previousProjectId && previousProjectId !== nextProject.id) {
                await projectState.selectProject(previousProjectId);
            }

            projectState.setProjectActionError(
                error instanceof Error
                    ? error.message
                    : "Не удалось переключить project scope без смешивания данных задачи.",
            );
            return false;
        }
    }

    async function handleProjectSelect(projectId: string) {
        if (projectState.project.id === projectId) {
            return;
        }

        const previousProjectId = projectState.project.id;
        if (!(await saveBeforeAction())) {
            return;
        }

        const switchedProject = await projectState.selectProject(projectId);
        if (!switchedProject || switchedProject.id === previousProjectId) {
            return;
        }

        await rehydrateTaskScope(switchedProject, previousProjectId);
    }

    async function handleProjectCreate(title: string) {
        const previousProjectId = projectState.project.id;
        if (!(await saveBeforeAction())) {
            return false;
        }

        const createdProject = await projectState.createProject(title);
        if (!createdProject) {
            return false;
        }

        return rehydrateTaskScope(createdProject, previousProjectId);
    }

    async function migrateProjectUiKit(nextUiKitId: Project["settings"]["uiKitId"]) {
        const target = getProjectMigrationTarget(nextUiKitId);
        if (!projectNeedsUiKitMigration(projectState.project, target)) {
            projectState.persistProject(normalizeProject({
                ...projectState.project,
                migration: undefined,
            }), { bumpPreview: false });
            return true;
        }

        const pendingProject = projectState.persistProject(
            startProjectUiKitMigration(projectState.project, target),
            { bumpPreview: false },
        );
        projectState.setProjectActionPending(true);
        projectState.setProjectActionError("");

        try {
            const data = await postProjectMigration(props.taskItem.id, pendingProject, target);
            if (!data?.ok || !data.taskItem || !data.taskData) {
                throw new Error(!data?.ok ? data.error : "Не удалось выполнить migration проекта");
            }

            replaceTaskData(data.taskData);
            props.onTaskItemChange(data.taskItem);
            projectState.persistProject(completeProjectUiKitMigration(pendingProject, target, {
                invalidationScope: "current-level",
                requiresReplay: true,
                message: `Migration проекта завершена: UI kit переключён на ${target.uiKitId}, текущий уровень нужно пройти заново.`,
            }));
            return true;
        } catch (error) {
            projectState.persistProject(failProjectUiKitMigration(
                pendingProject,
                target,
                error instanceof Error ? error.message : "Не удалось выполнить migration проекта",
            ), { bumpPreview: false });
            projectState.setProjectActionError(error instanceof Error ? error.message : "Не удалось выполнить migration проекта");
            return false;
        } finally {
            projectState.setProjectActionPending(false);
        }
    }

    return {
        ...projectState,
        handleProjectCreate,
        handleProjectSelect,
        migrateProjectUiKit,
    };
}
