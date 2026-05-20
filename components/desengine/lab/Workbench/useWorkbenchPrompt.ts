"use client";

import { type KeyboardEvent as ReactKeyboardEvent, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import type { WorkbenchProps } from "./props";

function usePromptController(
    props: WorkbenchProps,
    saveBeforeAction: () => Promise<boolean>,
    replaceTaskData: (taskData: WorkbenchProps["taskData"]) => void,
    setPreviewVersion: Dispatch<SetStateAction<number>>,
) {
    const [promptText, setPromptText] = useState("");
    const [promptStatus, setPromptStatus] = useState("");
    const [promptError, setPromptError] = useState("");
    const [promptPending, setPromptPending] = useState(false);

    async function handlePromptRun() {
        if (!(await saveBeforeAction())) return;
        setPromptStatus("");
        setPromptError("");
        if (!props.taskItem.progress.currentLevelStarted) return setPromptError("Сначала начните текущий уровень");
        if (!promptText.trim()) return setPromptError("Введите уточняющий промпт");
        setPromptPending(true);
        const data = await postPrompt(props.taskItem.id, promptText);
        setPromptPending(false);
        if (!data?.ok) return setPromptError(data?.error || "Ошибка запуска итерации");
        props.onTaskItemChange(data.taskItem ?? null);
        replaceTaskData(data.taskData);
        props.onTransition(data.transition ?? null);
        setPreviewVersion((current) => current + 1);
        setPromptText("");
        setPromptStatus("Уточнение применено");
    }

    return { handlePromptRun, promptError, promptPending, promptStatus, promptText, setPromptError, setPromptStatus, setPromptText };
}

async function postPrompt(taskId: string, prompt: string) {
    const res = await fetch(`/api/tasks/${taskId}/iterate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt }),
    });
    const data = await res.json().catch(() => null);
    return res.ok ? data : { ok: false, error: data?.error };
}

function usePromptInput(prompt: ReturnType<typeof usePromptController>) {
    function handlePromptKeyDown(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
        if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
        event.preventDefault();
        if (!prompt.promptPending) void prompt.handlePromptRun();
    }

    function handlePromptChange(nextValue: string) {
        prompt.setPromptText(nextValue);
        if (prompt.promptStatus) prompt.setPromptStatus("");
        if (prompt.promptError) prompt.setPromptError("");
    }

    return { handlePromptChange, handlePromptKeyDown };
}

export { usePromptController, usePromptInput };
