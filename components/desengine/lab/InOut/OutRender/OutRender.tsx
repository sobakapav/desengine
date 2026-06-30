"use client";

import { useMemo } from "react";
import { createDefaultProject } from "@/lib/project/runtime";

import { OutRenderProps } from "./props";
import { PreviewErrorNotice } from "./preview-runtime-notices";
import { usePreviewPayload } from "./preview-payload";
import { SandpackPreviewFrame } from "./preview-runtime-bridge";

const SANDBOX_RUNTIME_VERSION = "2026-05-20-ant-shim-v3";
function IdlePreviewNotice({ startStatus }: { startStatus: string }) {
    return (
        <div className="space-y-2 py-2">
            <p className="text-muted-foreground">
                Превью станет доступно после старта уровня.
            </p>
            {startStatus === "starting" && <p className="text-muted-foreground">Генерация файлов…</p>}
        </div>
    );
}

function PreviewContent({ error, loading, moduleUrl, previewPayload, previewSessionId }: {
    error: string;
    loading: boolean;
    moduleUrl: string;
    previewPayload: ReturnType<typeof usePreviewPayload>["previewPayload"];
    previewSessionId: string;
}) {
    return (
        <div className="min-h-32 overflow-hidden">
            {error ? (
                <PreviewErrorNotice message={error} />
            ) : previewPayload ? (
                <SandpackPreviewFrame moduleUrl={moduleUrl} previewPayload={previewPayload} previewSessionId={previewSessionId} />
            ) : (
                <p className="text-muted-foreground">{loading ? "Загрузка рендера…" : "Превью ожидает следующей загрузки."}</p>
            )}
        </div>
    );
}

function OutRender({ task, started, reloadKey, startStatus, project }: OutRenderProps) {
    const previewProject = project ?? createDefaultProject(`task-${task}`);
    const previewSessionId = useMemo(
        () => `task:${task}:reload:${reloadKey}:project:${previewProject.id}:ui:${previewProject.settings.uiKitId}`,
        [previewProject.id, previewProject.settings.uiKitId, reloadKey, task],
    );
    const moduleUrl = useMemo(
        () => {
            const params = new URLSearchParams({
                v: String(reloadKey),
                runtimeVersion: SANDBOX_RUNTIME_VERSION,
                projectId: previewProject.id,
                projectTitle: previewProject.title,
                uiKitId: previewProject.settings.uiKitId,
                previewSessionId,
            });
            return `/api/tasks/${task}/sandpack?${params.toString()}`;
        },
        [previewProject.id, previewProject.title, previewProject.settings.uiKitId, previewSessionId, task, reloadKey],
    );
    const { error, loading, previewPayload } = usePreviewPayload({ moduleUrl, started });

    return (
        <div className="min-w-0">
            {!started ? (
                <IdlePreviewNotice startStatus={startStatus} />
            ) : (
                <PreviewContent
                    error={error}
                    loading={loading}
                    moduleUrl={moduleUrl}
                    previewPayload={previewPayload}
                    previewSessionId={previewSessionId}
                />
            )}
        </div>
    );
}

export {
    OutRender,
}
