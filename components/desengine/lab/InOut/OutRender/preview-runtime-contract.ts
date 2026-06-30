"use client";

import { useEffect, useState, type RefObject } from "react";

import {
    mergePreviewRuntimeContractState,
    type PreviewRuntimeContractState,
} from "../preview-runtime-contract-state";
import { readPreviewRuntimeContractMessage } from "../preview-runtime-contract-message";

const PREVIEW_RUNTIME_CONTRACT_TIMEOUT_MS = 12_000;
const CHECK_BUTTON_LABEL = "Отправить решение на проверку";
const PREVIEW_RUNTIME_CONTRACT_ATTR = "data-desengine-preview-contract";
const PREVIEW_RUNTIME_CONTRACT_MESSAGE_ATTR = "data-desengine-preview-contract-message";
const PREVIEW_RUNTIME_RENDER_ERROR_ATTR = "data-desengine-preview-render-error";

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

/**
 * @example
 * ```tsx
 * usePreviewCheckButtonGuard(message)
 * ```
 */
export function usePreviewCheckButtonGuard(message: string | null) {
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

/**
 * @example
 * ```tsx
 * const { contractState } = usePreviewRuntimeContract({
 *   moduleUrl,
 *   previewSessionId,
 *   mode: "enabled",
 *   previewRootRef,
 * })
 * ```
 */
export function usePreviewRuntimeContract({
    moduleUrl,
    previewSessionId,
    mode,
    previewRootRef,
}: {
    moduleUrl: string;
    previewSessionId: string;
    mode: "enabled" | "disabled";
    previewRootRef: RefObject<HTMLDivElement | null>;
}) {
    const [contractState, setContractState] = useState<PreviewRuntimeContractState>({
        status: "idle",
        message: "",
    });

    useEffect(() => {
        setContractState({ status: "idle", message: "" });

        if (mode === "disabled") return;

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
    }, [mode, moduleUrl, previewRootRef, previewSessionId]);

    return {
        contractState,
        setRuntimeContractState: setContractState,
    };
}
