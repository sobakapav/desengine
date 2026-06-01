function resolvePreviewClientId(current: string | null, next: string | null) {
    if (!next) {
        return current;
    }

    return current === next ? current : next;
}

export {
    resolvePreviewClientId,
}
