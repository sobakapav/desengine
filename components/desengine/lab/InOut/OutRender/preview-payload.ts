"use client";

import { useEffect, useRef, useState } from "react";

import type { SandpackPreviewPayload } from "@/lib/lab/sandpack-preview.types";

const PREVIEW_FETCH_TIMEOUT_MS = 12_000;

function getErrorMessage(error: unknown, fallbackMessage: string) {
    return error instanceof Error && error.message ? error.message : fallbackMessage;
}

/**
 * @example
 * ```tsx
 * const { error, loading, previewPayload } = usePreviewPayload({ moduleUrl, started })
 * ```
 */
export function usePreviewPayload({ moduleUrl, started }: { moduleUrl: string; started: boolean }) {
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

            setPreviewPayload(null);

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
