"use client";

import { useState } from "react";

import { type Project } from "@/lib/project/runtime";

type UseWorkbenchProjectSettingsControllerArgs = {
    onCreateProject: (title: string) => Promise<boolean>;
    project: Project;
    uiKitOptions: Array<{ id: Project["settings"]["uiKitId"]; title: string }>;
    updateProject: (uiKitId: Project["settings"]["uiKitId"]) => Promise<boolean>;
}

function useWorkbenchProjectSettingsController({
    onCreateProject,
    project,
    uiKitOptions,
    updateProject,
}: UseWorkbenchProjectSettingsControllerArgs) {
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

    return {
        handleMigrationConfirm,
        handleProjectCreate,
        handleUiKitChange,
        nextProjectTitle,
        pendingUiKitTitle,
        setNextProjectTitle,
        setPendingUiKitId,
        setUiKitDialogOpen,
        uiKitDialogOpen,
    };
}

export { useWorkbenchProjectSettingsController };
