"use client";

import {
    useLoadingOverlayState,
    useSandpack,
    useSandpackPreviewProgress,
} from "@codesandbox/sandpack-react/unstyled";
import { useEffect } from "react";

import type { SandpackPreviewPayload } from "@/lib/lab/sandpack-preview.types";

import type { PreviewRuntimeContractState } from "../preview-runtime-contract-state";

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

/**
 * @example
 * ```tsx
 * <SandpackRuntimeDiagnosticsNotice payload={previewPayload} />
 * ```
 */
export function SandpackRuntimeDiagnosticsNotice({ payload }: { payload: SandpackPreviewPayload }) {
    const { sandpack } = useSandpack();
    const message = getSandpackRuntimeDiagnosticMessage(sandpack.error);

    if (!message) {
        return null;
    }

    return (
        <div className="mb-3 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            <p className="font-medium">
                Sandpack runtime: {payload.project.settings.uiKitId}
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

/**
 * @example
 * ```tsx
 * <SandpackRuntimeActivityBridge clientId={previewClientId} onRuntimeContractChange={setState} />
 * ```
 */
export function SandpackRuntimeActivityBridge({
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
