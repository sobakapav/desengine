"use client";

import {
    SandpackPreview,
    SandpackProvider,
    useLoadingOverlayState,
    useSandpack,
    useSandpackPreviewProgress,
} from "@codesandbox/sandpack-react/unstyled";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { SandpackPreviewPayload } from "@/lib/lab/sandpack-preview";
import { createDefaultProject } from "@/lib/project/runtime";

import { OutRenderProps } from "./props";
import {
    mergePreviewRuntimeContractState,
    type PreviewRuntimeContractState,
    type PreviewRuntimeContractStatus,
} from "../preview-runtime-contract-state";
import { resolvePreviewClientId } from "../preview-client-id";
const SANDBOX_RUNTIME_VERSION = "2026-05-20-ant-shim-v3";
const PREVIEW_RUNTIME_CONTRACT_TIMEOUT_MS = 12_000;
const PREVIEW_FETCH_TIMEOUT_MS = 12_000;

type SandpackPreviewRef = {
    clientId: string;
};

type PreviewRuntimeContractMessage = {
    source: "desengine-sandpack-preview";
    type: "contract";
    status: Exclude<PreviewRuntimeContractStatus, "idle">;
    message?: string;
};

function isPreviewRuntimeContractMessage(value: unknown): value is PreviewRuntimeContractMessage {
    if (typeof value !== "object" || value === null) return false;

    return (value as PreviewRuntimeContractMessage).source === "desengine-sandpack-preview"
        && (value as PreviewRuntimeContractMessage).type === "contract";
}

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

function PreviewStyleContractNotice({ message }: { message: string }) {
    return (
        <div className="mb-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
            <p className="font-medium">Preview отрисовал DOM без подтверждённого style contract.</p>
            <p className="mt-1 whitespace-pre-wrap break-words">{message}</p>
        </div>
    );
}

function PreviewRuntimeContractErrorNotice({ message }: { message: string }) {
    return (
        <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            <p className="font-medium">Компонент не удалось отрендерить в preview.</p>
            <p className="mt-1 whitespace-pre-wrap break-words">{message}</p>
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
                Project UI: {payload.project.settings.uiKitId}, режим {payload.project.settings.uiMode}
                {payload.project.effectiveUiKitId !== payload.project.settings.uiKitId ? `, runtime ${payload.project.effectiveUiKitId}` : ""}
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
                Sandpack runtime: {payload.project.settings.uiKitId}, режим {payload.project.settings.uiMode}
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

function usePreviewRuntimeContract(moduleUrl: string, enabled: boolean) {
    const [contractState, setContractState] = useState<PreviewRuntimeContractState>({
        status: "idle",
        message: "",
    });

    useEffect(() => {
        setContractState({ status: "idle", message: "" });

        if (!enabled) return;

        function handleMessage(event: MessageEvent) {
            if (!isPreviewRuntimeContractMessage(event.data)) {
                return;
            }

            setContractState({
                status: event.data.status,
                message: event.data.message ?? "",
            });
        }

        const timeoutId = window.setTimeout(() => {
            setContractState((current) => (
                current.status === "idle"
                    ? {
                        status: "render-error",
                        message:
                            "Sandpack runtime не подтвердил загрузку превью. Возможно, внешний bundler недоступен или отдал challenge-страницу вместо preview.",
                    }
                    : current
            ));
        }, PREVIEW_RUNTIME_CONTRACT_TIMEOUT_MS);

        window.addEventListener("message", handleMessage);
        return () => {
            window.clearTimeout(timeoutId);
            window.removeEventListener("message", handleMessage);
        };
    }, [enabled, moduleUrl]);

    return {
        contractState,
        setRuntimeContractState: setContractState,
    };
}

function SandpackRuntimeActivityBridge({
    clientId,
    onRuntimeContractChange,
}: {
    clientId: string | null;
    onRuntimeContractChange: (next: PreviewRuntimeContractState) => void;
}) {
    const { sandpack } = useSandpack();
    const progressMessage = useSandpackPreviewProgress(clientId ? { clientId } : undefined);
    const loadingOverlayState = useLoadingOverlayState(clientId ?? undefined, false);

    useEffect(() => {
        if (!clientId) {
            return;
        }

        if (sandpack.status === "timeout") {
            onRuntimeContractChange({
                status: "render-error",
                message: "Sandpack runtime превысил внутренний timeout загрузки preview.",
            });
            return;
        }

        const runtimeErrorMessage = getSandpackRuntimeDiagnosticMessage(sandpack.error);
        if (runtimeErrorMessage) {
            onRuntimeContractChange({
                status: "render-error",
                message: runtimeErrorMessage,
            });
            return;
        }

        const isLoading = loadingOverlayState !== "HIDDEN" || Boolean(progressMessage);
        if (isLoading) {
            onRuntimeContractChange({
                status: "loading",
                message: progressMessage ?? "Sandpack runtime загружает preview.",
            });
        }
    }, [clientId, loadingOverlayState, onRuntimeContractChange, progressMessage, sandpack.error, sandpack.status]);

    return null;
}

function usePreviewPayload({ moduleUrl, started }: { moduleUrl: string; started: boolean }) {
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [previewPayload, setPreviewPayload] = useState<SandpackPreviewPayload | null>(null);
    const requestIdRef = useRef(0);

    useEffect(() => {
        const requestId = requestIdRef.current + 1;
        requestIdRef.current = requestId;
        const controller = new AbortController();

        function isCurrentRequest() {
            return requestIdRef.current === requestId;
        }

        function createTimeoutError() {
            return new Error("preview-fetch-timeout");
        }

        async function withTimeout<T>(promise: Promise<T>) {
            return await new Promise<T>((resolve, reject) => {
                const timeoutId = window.setTimeout(() => {
                    controller.abort("preview-fetch-timeout");
                    reject(createTimeoutError());
                }, PREVIEW_FETCH_TIMEOUT_MS);

                promise.then(
                    (value) => {
                        window.clearTimeout(timeoutId);
                        resolve(value);
                    },
                    (reason) => {
                        window.clearTimeout(timeoutId);
                        reject(reason);
                    },
                );
            });
        }

        async function load() {
            setError("");
            setLoading(started);

            if (!started) {
                setPreviewPayload(null);
                return;
            }

            try {
                const res = await withTimeout(fetch(moduleUrl, {
                    method: "GET",
                    cache: "no-store",
                    signal: controller.signal,
                }));
                const data = await withTimeout(res.json().catch(() => null));

                if (!res.ok || !data?.ok) {
                    throw new Error(data?.error || "Ошибка загрузки предпросмотра");
                }

                if (!isCurrentRequest()) return;
                setPreviewPayload(data as SandpackPreviewPayload);
            } catch (e) {
                if (!isCurrentRequest()) return;
                if ((e instanceof DOMException && e.name === "AbortError") || (e instanceof Error && e.message === "preview-fetch-timeout")) {
                    setError("Загрузка превью превысила лимит ожидания. Проверьте route /api/tasks/*/sandpack и повторите попытку.");
                    return;
                }

                setError(getErrorMessage(e, "Ошибка загрузки превью"));
            } finally {
                if (isCurrentRequest()) {
                    setLoading(false);
                }
            }
        }

        void load();
        return () => {
            controller.abort("preview-fetch-cancelled");
        };
    }, [moduleUrl, started]);

    return { error, loading, previewPayload };
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
    const compatibility = previewPayload.project.compatibility;
    const {
        contractState: runtimeContract,
        setRuntimeContractState,
    } = usePreviewRuntimeContract(
        moduleUrl,
        compatibility.status === "compatible",
    );
    const [previewClientId, setPreviewClientId] = useState<string | null>(null);
    const previewClientIdRef = useRef<string | null>(null);

    useEffect(() => {
        previewClientIdRef.current = null;
        setPreviewClientId(null);
    }, [moduleUrl]);

    const handlePreviewRef = useCallback((value: SandpackPreviewRef | null) => {
        const nextClientId = value?.clientId ?? null;
        const resolvedClientId = resolvePreviewClientId(previewClientIdRef.current, nextClientId);

        if (resolvedClientId === previewClientIdRef.current) {
            return;
        }

        previewClientIdRef.current = resolvedClientId;
        setPreviewClientId(resolvedClientId);
    }, []);

    const handleRuntimeContractChange = useCallback((next: PreviewRuntimeContractState) => {
        setRuntimeContractState((current) => mergePreviewRuntimeContractState(current, next));
    }, [setRuntimeContractState]);

    if (compatibility.status === "incompatible") {
        return (
            <div className="w-full">
                <ProjectCompatibilityNotice payload={previewPayload} />
            </div>
        );
    }

    return (
        <div className="w-full">
            {runtimeContract.status === "unstyled-dom" ? (
                <PreviewStyleContractNotice
                    message={runtimeContract.message || "Sandpack runtime не подтвердил применение preview CSS/Tailwind."}
                />
            ) : null}
            {runtimeContract.status === "render-error" ? (
                <PreviewRuntimeContractErrorNotice
                    message={runtimeContract.message || "Sandpack runtime сообщил об ошибке рендера компонента."}
                />
            ) : null}
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
                <SandpackRuntimeActivityBridge
                    clientId={previewClientId}
                    onRuntimeContractChange={handleRuntimeContractChange}
                />
                <SandpackRuntimeDiagnosticsNotice payload={previewPayload} />
                <SandpackPreview
                    ref={handlePreviewRef}
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

function PreviewContent({ error, loading, moduleUrl, previewPayload }: {
    error: string;
    loading: boolean;
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
                <p className="text-muted-foreground">{loading ? "Загрузка рендера…" : "Превью ожидает следующей загрузки."}</p>
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
                uiKitId: previewProject.settings.uiKitId,
                uiMode: previewProject.settings.uiMode,
            });
            return `/api/tasks/${task}/sandpack?${params.toString()}`;
        },
        [previewProject.id, previewProject.title, previewProject.settings.uiKitId, previewProject.settings.uiMode, task, reloadKey],
    );
    const { error, loading, previewPayload } = usePreviewPayload({ moduleUrl, started });

    return (
        <div className="min-w-0">
            {!started ? (
                <IdlePreviewNotice startStatus={startStatus} />
            ) : (
                <PreviewContent error={error} loading={loading} moduleUrl={moduleUrl} previewPayload={previewPayload} />
            )}
        </div>
    );
}

export {
    OutRender,
}
