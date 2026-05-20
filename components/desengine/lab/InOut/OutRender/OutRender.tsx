"use client";

import { SandpackPreview, SandpackProvider, useSandpack } from "@codesandbox/sandpack-react/unstyled";
import { useEffect, useMemo, useState } from "react";

import type { SandpackPreviewPayload } from "@/lib/lab/sandpack-preview";
import { createDefaultProject } from "@/lib/project/runtime";

import { OutRenderProps } from "./props";
const SANDBOX_RUNTIME_VERSION = "2026-05-20-ant-shim-v3";

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

function getSandpackRuntimeDiagnosticMessage(error: unknown) {
    if (!error) return "";
    if (error instanceof Error) return error.message;
    if (typeof error === "object" && "message" in error) {
        const message = (error as { message?: unknown }).message;
        return typeof message === "string" ? message : "";
    }
    return "";
}

function SandpackRuntimeDiagnosticsNotice({ payload }: { payload: SandpackPreviewPayload }) {
    const { sandpack } = useSandpack();
    const message = getSandpackRuntimeDiagnosticMessage(sandpack.error);

    if (!message) {
        return null;
    }

    return (
        <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            <p className="font-medium">
                Sandpack runtime: {payload.project.uiKitId}, режим {payload.project.uiMode}
            </p>
            <p className="mt-1 whitespace-pre-wrap break-words">{message}</p>
            {payload.debug ? (
                <details className="mt-2">
                    <summary className="cursor-pointer text-xs font-medium">Sandpack debug payload</summary>
                    <pre className="mt-2 whitespace-pre-wrap break-words text-xs">
                        {JSON.stringify(payload.debug, null, 2)}
                    </pre>
                </details>
            ) : null}
        </div>
    );
}

function usePreviewPayload({ moduleUrl, started }: { moduleUrl: string; started: boolean }) {
    const [error, setError] = useState<string>("");
    const [previewPayload, setPreviewPayload] = useState<SandpackPreviewPayload | null>(null);

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

        void load();
        return () => { cancelled = true; };
    }, [moduleUrl, started]);

    return { error, previewPayload };
}

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

function SandpackPreviewFrame({ moduleUrl, previewPayload }: {
    moduleUrl: string;
    previewPayload: SandpackPreviewPayload;
}) {
    return (
        <div className="w-full">
            <ProjectCompatibilityNotice payload={previewPayload} />
            <SandpackProvider
                key={`${moduleUrl}:${previewPayload.debug?.shimVersion ?? "no-debug"}`}
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
                <SandpackRuntimeDiagnosticsNotice payload={previewPayload} />
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
    );
}

function PreviewContent({ error, moduleUrl, previewPayload }: {
    error: string;
    moduleUrl: string;
    previewPayload: SandpackPreviewPayload | null;
}) {
    return (
        <div className="min-h-32 overflow-hidden">
            {error ? (
                <PreviewErrorNotice message={error} />
            ) : previewPayload ? (
                <SandpackPreviewFrame moduleUrl={moduleUrl} previewPayload={previewPayload} />
            ) : (
                <p className="text-muted-foreground">Загрузка рендера…</p>
            )}
        </div>
    );
}

function OutRender({ task, started, reloadKey, startStatus, project }: OutRenderProps) {
    const previewProject = project ?? createDefaultProject(`task-${task}`);
    const moduleUrl = useMemo(
        () => {
            const params = new URLSearchParams({
                v: String(reloadKey),
                runtimeVersion: SANDBOX_RUNTIME_VERSION,
                projectId: previewProject.id,
                projectTitle: previewProject.title,
                uiKitId: previewProject.uiKitId,
                uiMode: previewProject.uiMode,
            });
            return `/api/tasks/${task}/sandpack?${params.toString()}`;
        },
        [previewProject.id, previewProject.title, previewProject.uiKitId, previewProject.uiMode, task, reloadKey],
    );
    const { error, previewPayload } = usePreviewPayload({ moduleUrl, started });

    return (
        <div className="min-w-0">
            {!started ? (
                <IdlePreviewNotice startStatus={startStatus} />
            ) : (
                <PreviewContent error={error} moduleUrl={moduleUrl} previewPayload={previewPayload} />
            )}
        </div>
    );
}

export {
    OutRender,
}
