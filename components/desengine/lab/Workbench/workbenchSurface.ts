"use client";

import { taskWorkbenchFiles } from "@/lib/system/config/client";
import type { ProjectWorkspace } from "@/lib/project/runtime";
import { buildTaskWorkflowArtifactProjection, listImageComponentWorkflowPoints, resolveWorkflowStepTitle } from "@/lib/task/projection";
import type { WorkflowStepInstanceStatus } from "@/lib/task/model";
import type { TaskData, TaskListItem } from "@/lib/task/types";
import { getWorkbenchDefinition, labWorkbenchRegistry } from "@/lib/workbench";

export type WorkbenchWorkflowPointSnapshot = {
    id: string;
    title: string;
    status: WorkflowStepInstanceStatus;
    statusLabel: string;
    artifactCount: number;
    artifactCountLabel: string;
    relatedFileIds: string[];
    relatedFileNames: string[];
    primaryFileId: string | null;
    primaryFileName: string | null;
    isSelectable: boolean;
    selectionLabel: string;
    isFocus: boolean;
    isSelected: boolean;
};

export type WorkbenchSurfaceSnapshot = {
    projectId: string;
    projectTitle: string;
    taskId: string;
    workflowInstanceId: string;
    workflowStepId: string;
    workflowStepKind: string;
    workflowStepTitle: string;
    headline: string;
    outcomeLabel: string;
    sessionStatusLabel: string;
    renderCenterTitle: string;
    renderCenterDescription: string;
    workflowPoints: WorkbenchWorkflowPointSnapshot[];
    selectedWorkflowPointId: string | null;
    selectedWorkflowPointTitle: string | null;
    workbenchInstanceId: string;
    workbenchDefinitionId: string;
    workbenchDefinitionTitle: string;
    workbenchProfileId: string;
};

function resolveWorkflowStepStatusLabel(status: WorkflowStepInstanceStatus) {
    switch (status) {
        case "completed":
            return "Готово";
        case "failed":
            return "Нужна доработка";
        case "in_progress":
            return "В работе";
        case "not_started":
        default:
            return "Ещё не проявлено";
    }
}

function resolveArtifactCountLabel(count: number) {
    if (count === 0) {
        return "Артефакты ещё не проявлены";
    }

    if (count === 1) {
        return "1 связанный артефакт";
    }

    if (count < 5) {
        return `${count} связанных артефакта`;
    }

    return `${count} связанных артефактов`;
}

function buildWorkflowPointsSnapshot(args: {
    projection: ReturnType<typeof buildTaskWorkflowArtifactProjection>;
    taskData: TaskData;
    taskItem: TaskListItem;
    activeFileId: string | null;
}) {
    const editableFileIds = args.taskData.labContext?.editableFileIds ?? [];
    const configuredFilesById = new Map(taskWorkbenchFiles.map((file) => [file.id, file] as const));
    const pointDefinitionsByKind = new Map(listImageComponentWorkflowPoints().map((point) => [point.kind, point] as const));
    const workflowPoints = args.projection.workflow.stepInstances.filter(
        (step) => step.id !== args.projection.workflow.currentStepId,
    );
    const selectedPointId = workflowPoints.find((step) => {
        const pointDefinition = pointDefinitionsByKind.get(step.kind);
        return pointDefinition ? pointDefinition.fileIds.includes(args.activeFileId ?? "") : false;
    })?.id ?? null;
    const focusPointId = selectedPointId ?? workflowPoints.find((step) => step.status === "in_progress")?.id ?? workflowPoints[0]?.id;

    return workflowPoints.map((step) => {
        const pointDefinition = pointDefinitionsByKind.get(step.kind);
        const relatedFileIds = (pointDefinition?.fileIds ?? []).filter((fileId) => editableFileIds.includes(fileId));
        const relatedFiles = relatedFileIds
            .map((fileId) => configuredFilesById.get(fileId))
            .filter((file): file is NonNullable<typeof file> => Boolean(file));
        const primaryFile = relatedFiles[0] ?? null;

        return {
            id: step.id,
            title: resolveWorkflowStepTitle({
                taskId: args.projection.task.id,
                stepId: step.id,
                stepKind: step.kind,
                taskData: args.taskData,
                taskItem: args.taskItem,
            }),
            status: step.status,
            statusLabel: resolveWorkflowStepStatusLabel(step.status),
            artifactCount: step.outputArtifactIds.length,
            artifactCountLabel: resolveArtifactCountLabel(step.outputArtifactIds.length),
            relatedFileIds,
            relatedFileNames: relatedFiles.map((file) => file.fileName),
            primaryFileId: primaryFile?.id ?? null,
            primaryFileName: primaryFile?.fileName ?? null,
            isSelectable: Boolean(primaryFile),
            selectionLabel: primaryFile
                ? `Открыть ${primaryFile.fileName}`
                : "Файл станет доступен на следующем runtime-этапе",
            isFocus: step.id === focusPointId,
            isSelected: step.id === selectedPointId,
        };
    });
}

/**
 * @example
 * ```ts
 * const surface = buildWorkbenchSurfaceSnapshot({
 *   project,
 *   taskData,
 *   taskItem,
 * })
 * ```
 */
export function buildWorkbenchSurfaceSnapshot(args: {
    project: ProjectWorkspace;
    taskData: TaskData;
    taskItem: TaskListItem;
    activeFileId?: string | null;
}) {
    const projection = buildTaskWorkflowArtifactProjection({
        taskData: args.taskData,
        project: args.project,
        taskItem: args.taskItem,
        workbenchFiles: taskWorkbenchFiles,
    });

    const workflowStep = projection.workflow.stepInstances.find(
        (step) => step.id === projection.workflow.currentStepId,
    ) ?? projection.workflow.stepInstances[0];
    const workbenchInstanceId = workflowStep?.runtimeBindings?.primaryWorkbenchInstanceId
        ?? workflowStep?.runtimeBindings?.workbenchInstanceIds[0]
        ?? projection.workbenchInstances[0]?.id;
    const workbenchInstance = projection.workbenchInstances.find(
        (instance) => instance.id === workbenchInstanceId,
    ) ?? projection.workbenchInstances[0];

    if (!workflowStep || !workbenchInstance) {
        return null;
    }

    const workbenchDefinition = getWorkbenchDefinition(
        labWorkbenchRegistry,
        workbenchInstance.definitionId,
    );

    if (!workbenchDefinition) {
        return null;
    }

    const workflowPoints = buildWorkflowPointsSnapshot({
        projection,
        taskData: args.taskData,
        taskItem: args.taskItem,
        activeFileId: args.activeFileId ?? null,
    });
    const selectedWorkflowPoint = workflowPoints.find((point) => point.isSelected) ?? null;

    return {
        projectId: projection.task.projectId,
        projectTitle: args.project.title,
        taskId: projection.task.id,
        workflowInstanceId: projection.workflow.id,
        workflowStepId: workflowStep.id,
        workflowStepKind: workflowStep.kind,
        workflowStepTitle: resolveWorkflowStepTitle({
            taskId: projection.task.id,
            stepId: workflowStep.id,
            stepKind: workflowStep.kind,
            taskData: args.taskData,
            taskItem: args.taskItem,
        }),
        headline: "Работаем над workflow",
        outcomeLabel: "Главный outcome этой сессии: собрать компонент, проявить ключевые артефакты и довести результат до состояния «Проверка пройдена».",
        sessionStatusLabel: resolveWorkflowStepStatusLabel(workflowStep.status),
        renderCenterTitle: "Главный рендер результата",
        renderCenterDescription: "Preview показывает текущее состояние итогового компонента, а workflow-пункты, код, примеры и project settings работают вокруг этого render-center.",
        workflowPoints,
        selectedWorkflowPointId: selectedWorkflowPoint?.id ?? null,
        selectedWorkflowPointTitle: selectedWorkflowPoint?.title ?? null,
        workbenchInstanceId: workbenchInstance.id,
        workbenchDefinitionId: workbenchDefinition.id,
        workbenchDefinitionTitle: workbenchDefinition.title,
        workbenchProfileId: workbenchDefinition.profileId,
    } satisfies WorkbenchSurfaceSnapshot;
}
