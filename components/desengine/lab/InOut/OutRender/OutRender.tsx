"use client";

import { SandpackPreview, SandpackProvider } from "@codesandbox/sandpack-react/unstyled";
import { useEffect, useMemo, useState } from "react";

import type { SandpackPreviewPayload } from "@/lib/lab/sandpack-preview";
import { createDefaultProject } from "@/lib/project/runtime";

import { OutRenderProps } from "./props";

function getErrorMessage(error: unknown, fallbackMessage: string) {
    return error instanceof Error && error.message ? error.message : fallbackMessage;
}

function PreviewErrorNotice({ message }: { message: string }) {
    return (
        <div className="space-y-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
            <p className="font-medium text-destructive">Не удалось показать превью компонента.</p>
            <pre className="text-destructive whitespace-pre-wrap break-words">{message}</pre>
        </div>
    );
}

function ProjectCompatibilityNotice({ payload }: { payload: SandpackPreviewPayload }) {
    const compatibility = payload.project.compatibility;

    if (compatibility.status !== "incompatible") {
        return null;
    }

    return (
        <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            <p className="font-medium">
                Project UI: {payload.project.uiKitId}, режим {payload.project.uiMode}
                {payload.project.effectiveUiKitId !== payload.project.uiKitId ? `, runtime ${payload.project.effectiveUiKitId}` : ""}
            </p>
            <p className="mt-1">{compatibility.message}</p>
        </div>
    );
}

function OutRender({ task, started, reloadKey, startStatus, project }: OutRenderProps) {
    const previewProject = project ?? createDefaultProject(`task-${task}`);
    const [error, setError] = useState<string>("");
    const [previewPayload, setPreviewPayload] = useState<SandpackPreviewPayload | null>(null);

    const moduleUrl = useMemo(
        () => {
            const params = new URLSearchParams({
                v: String(reloadKey),
                projectId: previewProject.id,
                projectTitle: previewProject.title,
                uiKitId: previewProject.uiKitId,
                uiMode: previewProject.uiMode,
            });
            return `/api/tasks/${task}/sandpack?${params.toString()}`;
        },
        [previewProject.id, previewProject.title, previewProject.uiKitId, previewProject.uiMode, task, reloadKey],
    );

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setError("");
            setPreviewPayload(null);

            if (!started) return;

            try {
                const res = await fetch(moduleUrl, { method: "GET", cache: "no-store" });
                const data = await res.json().catch(() => null);

                if (!res.ok || !data?.ok) {
                    throw new Error(data?.error || "Ошибка загрузки предпросмотра");
                }

                if (cancelled) return;
                setPreviewPayload(data as SandpackPreviewPayload);
            } catch (e) {
                if (cancelled) return;
                setError(getErrorMessage(e, "Ошибка загрузки превью"));
            }
        }

        load();
        return () => { cancelled = true; };
    }, [moduleUrl, started]);

    return (
        <div className="min-w-0">
            {!started ? (
                <div className="space-y-2 py-2">
                    <p className="text-muted-foreground">
                        Превью станет доступно после старта уровня.
                    </p>
                    {startStatus === "starting" && <p className="text-muted-foreground">Генерация файлов…</p>}
                </div>
            ) : (
                <div className="min-h-32 overflow-hidden">
                    {error ? (
                        <PreviewErrorNotice message={error} />
                    ) : previewPayload ? (
                        <div className="w-full">
                            <ProjectCompatibilityNotice payload={previewPayload} />
                            <SandpackProvider
                                key={moduleUrl}
                                template="react-ts"
                                theme={{
                                    colors: {
                                        surface1: "#ffffff",
                                        surface2: "#ffffff",
                                        surface3: "#ffffff",
                                    },
                                }}
                                files={previewPayload.files}
                                customSetup={previewPayload.customSetup}
                                options={{
                                    ...previewPayload.options,
                                    autorun: true,
                                    autoReload: true,
                                    bundlerTimeOut: 180000,
                                    initMode: "immediate",
                                    recompileMode: "immediate",
                                }}
                            >
                                <SandpackPreview
                                    showNavigator={false}
                                    showOpenInCodeSandbox={false}
                                    showOpenNewtab={false}
                                    showRefreshButton={false}
                                    showRestartButton={false}
                                    showSandpackErrorOverlay
                                    style={{
                                        minHeight: 128,
                                        overflow: "hidden",
                                        background: "#ffffff",
                                        height: "100%",
                                        width: "100%",
                                    }}
                                />
                            </SandpackProvider>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">Загрузка рендера…</p>
                    )}
                </div>
            )}
        </div>
    );
}

export {
    OutRender,
}
