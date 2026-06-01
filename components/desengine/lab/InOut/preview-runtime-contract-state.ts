type PreviewRuntimeContractStatus = "idle" | "loading" | "ready" | "unstyled-dom" | "render-error";

type PreviewRuntimeContractState = {
    status: PreviewRuntimeContractStatus;
    message: string;
};

function mergePreviewRuntimeContractState(
    current: PreviewRuntimeContractState,
    next: PreviewRuntimeContractState,
) {
    if (current.status === next.status && current.message === next.message) {
        return current;
    }

    if (next.status === "loading") {
        return current.status === "idle" || current.status === "loading" ? next : current;
    }

    if (next.status === "render-error" && current.status === "ready") {
        return current;
    }

    return next;
}

export {
    mergePreviewRuntimeContractState,
};
export type {
    PreviewRuntimeContractState,
    PreviewRuntimeContractStatus,
};
