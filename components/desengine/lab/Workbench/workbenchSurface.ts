"use client";

import { taskWorkbenchFiles } from "@/lib/system/config/client";
import type { ProjectWorkspace } from "@/lib/project/runtime";
import { buildTaskWorkflowArtifactProjection } from "@/lib/task/projection";
import type { TaskData, TaskListItem } from "@/lib/task/types";
import { getWorkbenchDefinition, labWorkbenchRegistry } from "@/lib/workbench";

export type WorkbenchSurfaceSnapshot = {
    projectId: string;
    projectTitle: string;
    taskId: string;
    workflowInstanceId: string;
    workflowStepId: string;
    workflowStepKind: string;
    workflowStepTitle: string;
    workbenchInstanceId: string;
    workbenchDefinitionId: string;
    workbenchDefinitionTitle: string;
    workbenchProfileId: string;
};

function buildWorkflowStepTitle(taskData: TaskData, taskItem: TaskListItem, stepKind: string) {
    const levelNumber = taskItem.progress.currentLevel ?? taskData.labContext?.levelNumber;

    if (stepKind === "level-lab" && levelNumber) {
        return `Шаг workflow: уровень ${levelNumber}`;
    }

    return `Шаг workflow: ${stepKind}`;
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

    return {
        projectId: projection.task.projectId,
        projectTitle: args.project.title,
        taskId: projection.task.id,
        workflowInstanceId: projection.workflow.id,
        workflowStepId: workflowStep.id,
        workflowStepKind: workflowStep.kind,
        workflowStepTitle: buildWorkflowStepTitle(args.taskData, args.taskItem, workflowStep.kind),
        workbenchInstanceId: workbenchInstance.id,
        workbenchDefinitionId: workbenchDefinition.id,
        workbenchDefinitionTitle: workbenchDefinition.title,
        workbenchProfileId: workbenchDefinition.profileId,
    } satisfies WorkbenchSurfaceSnapshot;
}
