"use client";

import {
    SandpackPreview,
    SandpackProvider,
    useLoadingOverlayState,
    useSandpack,
    useSandpackPreviewProgress,
} from "@codesandbox/sandpack-react/unstyled";
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";

import type { SandpackPreviewPayload } from "@/lib/lab/sandpack-preview.types";
import { createDefaultProject } from "@/lib/project/runtime";

import { OutRenderProps } from "./props";
import {
    mergePreviewRuntimeContractState,
    type PreviewRuntimeContractState,
} from "../preview-runtime-contract-state";
import { getPreviewCheckGuardMessage, readPreviewRuntimeContractMessage } from "../preview-runtime-contract-message";
import { resolvePreviewClientId } from "../preview-client-id";
import {
    getPreviewRuntimeSupport,
    PreviewCheckGuardNotice,
    PreviewErrorNotice,
    PreviewRuntimeContractErrorNotice,
    PreviewSecureContextNotice,
    PreviewStyleContractNotice,
    ProjectCompatibilityNotice,
    ProjectMigrationNotice,
} from "./preview-runtime-notices";
const SANDBOX_RUNTIME_VERSION = "2026-05-20-ant-shim-v3";
const PREVIEW_RUNTIME_CONTRACT_TIMEOUT_MS = 12_000;
const PREVIEW_FETCH_TIMEOUT_MS = 12_000;
const CHECK_BUTTON_LABEL = "Отправить решение на проверку";
const PREVIEW_RUNTIME_CONTRACT_ATTR = "data-desengine-preview-contract";
const PREVIEW_RUNTIME_CONTRACT_MESSAGE_ATTR = "data-desengine-preview-contract-message";
const PREVIEW_RUNTIME_RENDER_ERROR_ATTR = "data-desengine-preview-render-error";

type SandpackPreviewRef = {
    clientId: string;
};

function getErrorMessage(error: unknown, fallbackMessage: string) {
    return error instanceof Error && error.message ? error.message : fallbackMessage;
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

function readPreviewIframeContractState(
    previewRootRef: RefObject<HTMLDivElement | null>,
): PreviewRuntimeContractState | null {
    const iframe = previewRootRef.current?.querySelector<HTMLIFrameElement>("iframe.sp-preview-iframe");
    if (!(iframe instanceof HTMLIFrameElement)) {
        return null;
    }

    try {
        const document = iframe.contentWindow?.document;
        const html = document?.documentElement;
        const status = html?.getAttribute(PREVIEW_RUNTIME_CONTRACT_ATTR);

        if (
            status !== "loading"
            && status !== "ready"
            && status !== "unstyled-dom"
            && status !== "render-error"
        ) {
            const renderErrorRoot = document?.querySelector<HTMLElement>(`[${PREVIEW_RUNTIME_RENDER_ERROR_ATTR}="true"]`);
            if (!renderErrorRoot) {
                return null;
            }

            return {
                status: "render-error",
                message:
                    renderErrorRoot.querySelector<HTMLElement>(`[${PREVIEW_RUNTIME_CONTRACT_MESSAGE_ATTR}]`)?.getAttribute(PREVIEW_RUNTIME_CONTRACT_MESSAGE_ATTR)
                    ?? renderErrorRoot.textContent?.trim()
                    ?? "",
            };
        }

        return {
            status,
            message: html?.getAttribute(PREVIEW_RUNTIME_CONTRACT_MESSAGE_ATTR) ?? "",
        };
    } catch {
        return null;
    }
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

function usePreviewRuntimeContract(
    moduleUrl: string,
    previewSessionId: string,
    enabled: boolean,
    previewRootRef: RefObject<HTMLDivElement | null>,
) {
    const [contractState, setContractState] = useState<PreviewRuntimeContractState>({
        status: "idle",
        message: "",
    });

    useEffect(() => {
        setContractState({ status: "idle", message: "" });

        if (!enabled) return;

        function handleMessage(event: MessageEvent) {
            const contractMessage = readPreviewRuntimeContractMessage(event.data, previewSessionId);
            if (!contractMessage) {
                return;
            }

            setContractState({
                status: contractMessage.status,
                message: contractMessage.message ?? "",
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

        const iframeContractPollId = window.setInterval(() => {
            const iframeContractState = readPreviewIframeContractState(previewRootRef);
            if (!iframeContractState) {
                return;
            }

            setContractState((current) => mergePreviewRuntimeContractState(current, iframeContractState));
        }, 100);

        window.addEventListener("message", handleMessage);
        return () => {
            window.clearTimeout(timeoutId);
            window.clearInterval(iframeContractPollId);
            window.removeEventListener("message", handleMessage);
        };
    }, [enabled, moduleUrl, previewRootRef, previewSessionId]);

    return {
        contractState,
        setRuntimeContractState: setContractState,
    };
}

function findCheckButton() {
    return Array.from(document.querySelectorAll("button"))
        .find((node) => node.textContent?.trim() === CHECK_BUTTON_LABEL) ?? null;
}

function applyCheckButtonGuard(button: HTMLButtonElement, message: string) {
    if (!("previewCheckGuardOriginalDisabled" in button.dataset)) {
        button.dataset.previewCheckGuardOriginalDisabled = String(button.disabled);
    }

    if (!("previewCheckGuardOriginalTitle" in button.dataset)) {
        button.dataset.previewCheckGuardOriginalTitle = button.getAttribute("title") ?? "";
    }

    button.dataset.previewCheckGuard = "true";
    button.disabled = true;
    button.setAttribute("aria-disabled", "true");
    button.setAttribute("title", message);
}

function clearCheckButtonGuard(button: HTMLButtonElement) {
    if (button.dataset.previewCheckGuard !== "true") {
        return;
    }

    button.disabled = button.dataset.previewCheckGuardOriginalDisabled === "true";

    const originalTitle = button.dataset.previewCheckGuardOriginalTitle ?? "";
    if (originalTitle) {
        button.setAttribute("title", originalTitle);
    } else {
        button.removeAttribute("title");
    }

    delete button.dataset.previewCheckGuard;
    delete button.dataset.previewCheckGuardOriginalDisabled;
    delete button.dataset.previewCheckGuardOriginalTitle;
}

function usePreviewCheckButtonGuard(message: string | null) {
    useEffect(() => {
        if (typeof document === "undefined") {
            return;
        }

        const sync = () => {
            const guardedButtons = document.querySelectorAll<HTMLButtonElement>('button[data-preview-check-guard="true"]');
            for (const button of guardedButtons) {
                clearCheckButtonGuard(button);
            }

            if (!message) {
                return;
            }

            const button = findCheckButton();
            if (button instanceof HTMLButtonElement) {
                applyCheckButtonGuard(button, message);
            }
        };

        sync();

        if (!message) {
            return;
        }

        const observer = new MutationObserver(sync);
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        return () => {
            observer.disconnect();
            const guardedButtons = document.querySelectorAll<HTMLButtonElement>('button[data-preview-check-guard="true"]');
            for (const button of guardedButtons) {
                clearCheckButtonGuard(button);
            }
        };
    }, [message]);
}

function SandpackRuntimeActivityBridge({
    clientId,
    onRuntimeContractChange,
}: {
    clientId: string | null;
    onRuntimeContractChange: (next: PreviewRuntimeContractState) => void;
}) {
    const { sandpack, listen } = useSandpack();
    const progressMessage = useSandpackPreviewProgress(clientId ? { clientId } : undefined);
    const loadingOverlayState = useLoadingOverlayState(clientId ?? undefined, false);

    useEffect(() => {
        if (!clientId) {
            return;
        }

        return listen((message) => {
            if (message.type === "action" && message.action === "show-error") {
                onRuntimeContractChange({
                    status: "render-error",
                    message: getErrorMessage((message as { message?: unknown }).message, "Sandpack runtime сообщил об ошибке рендера компонента."),
                });
                return;
            }

            if (message.type === "action" && message.action === "notification" && message.notificationType === "error") {
                onRuntimeContractChange({
                    status: "render-error",
                    message: getErrorMessage((message as { title?: unknown }).title, "Sandpack runtime сообщил об ошибке рендера компонента."),
                });
            }
        }, clientId);
    }, [clientId, listen, onRuntimeContractChange]);

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

                void promise.then(
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

function SandpackRuntimeSurface({
    handlePreviewRef,
    moduleUrl,
    onRuntimeContractChange,
    previewClientId,
    previewPayload,
    runtimeContract,
    previewCheckGuardMessage,
    previewRootRef,
}: {
    handlePreviewRef: (value: SandpackPreviewRef | null) => void;
    moduleUrl: string;
    onRuntimeContractChange: (next: PreviewRuntimeContractState) => void;
    previewClientId: string | null;
    previewPayload: SandpackPreviewPayload;
    runtimeContract: PreviewRuntimeContractState;
    previewCheckGuardMessage: string | null;
    previewRootRef: RefObject<HTMLDivElement | null>;
}) {
    return (
        <div className="w-full" ref={previewRootRef}>
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
            {previewCheckGuardMessage ? (
                <PreviewCheckGuardNotice message={previewCheckGuardMessage} />
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
                    onRuntimeContractChange={onRuntimeContractChange}
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

function SandpackPreviewFrame({ moduleUrl, previewPayload, previewSessionId }: {
    moduleUrl: string;
    previewPayload: SandpackPreviewPayload;
    previewSessionId: string;
}) {
    const compatibility = previewPayload.project.compatibility;
    const previewRootRef = useRef<HTMLDivElement | null>(null);
    const {
        contractState: runtimeContract,
        setRuntimeContractState,
    } = usePreviewRuntimeContract(
        moduleUrl,
        previewSessionId,
        compatibility.status === "compatible",
        previewRootRef,
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
    const previewCheckGuardMessage = useMemo(() => getPreviewCheckGuardMessage(runtimeContract), [runtimeContract]);
    const previewRuntimeSupport = getPreviewRuntimeSupport();

    usePreviewCheckButtonGuard(previewCheckGuardMessage);

    if (compatibility.status === "incompatible") {
        return (
            <div className="w-full">
                <ProjectMigrationNotice payload={previewPayload} />
                <ProjectCompatibilityNotice payload={previewPayload} />
            </div>
        );
    }

    if (!previewRuntimeSupport.supported) {
        return (
            <div className="w-full">
                <PreviewSecureContextNotice message={previewRuntimeSupport.message} />
            </div>
        );
    }

    return (
        <SandpackRuntimeSurface
            handlePreviewRef={handlePreviewRef}
            moduleUrl={moduleUrl}
            onRuntimeContractChange={handleRuntimeContractChange}
            previewCheckGuardMessage={previewCheckGuardMessage}
            previewClientId={previewClientId}
            previewPayload={previewPayload}
            previewRootRef={previewRootRef}
            runtimeContract={runtimeContract}
        />
    );
}

function PreviewContent({ error, loading, moduleUrl, previewPayload, previewSessionId }: {
    error: string;
    loading: boolean;
    moduleUrl: string;
    previewPayload: SandpackPreviewPayload | null;
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
        () => `task:${task}:reload:${reloadKey}:project:${previewProject.id}:ui:${previewProject.settings.uiKitId}:${previewProject.settings.uiMode}`,
        [previewProject.id, previewProject.settings.uiKitId, previewProject.settings.uiMode, reloadKey, task],
    );
    const moduleUrl = useMemo(
        () => {
            const params = new URLSearchParams({
                v: String(reloadKey),
                runtimeVersion: SANDBOX_RUNTIME_VERSION,
                projectId: previewProject.id,
                projectTitle: previewProject.title,
                uiKitId: previewProject.settings.uiKitId,
                uiMode: previewProject.settings.uiMode,
                previewSessionId,
            });
            return `/api/tasks/${task}/sandpack?${params.toString()}`;
        },
        [previewProject.id, previewProject.title, previewProject.settings.uiKitId, previewProject.settings.uiMode, previewSessionId, task, reloadKey],
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
