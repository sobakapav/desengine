"use client";

import { type KeyboardEvent as ReactKeyboardEvent, useState } from "react";
import type { Project } from "@/lib/project/runtime";
import type { IterateTaskSuccessBody } from "@/lib/task/actions/types";

import type { WorkbenchProps } from "./props";
import { buildWorkbenchActionNetworkMessage, fetchWorkbenchActionJson } from "./actionTimeout";

function resolvePromptRunSuccessState(data: Pick<IterateTaskSuccessBody, "message" | "resultKind">) {
    return {
        status: data.message,
        clearPrompt: data.resultKind === "applied",
        refreshPreview: data.resultKind === "applied",
    };
}

type PromptRunOutcome = {
    kind: "success";
    promptText: string;
    data: IterateTaskSuccessBody;
} | {
    kind: "error";
    error: string;
};

async function postPrompt(taskId: string, prompt: string, project: Project, activeScreen?: string | null) {
    return fetchWorkbenchActionJson<IterateTaskSuccessBody>({
        url: `/api/tasks/${taskId}/iterate`,
        actionLabel: "Уточнение",
        fallbackError: "Ошибка запуска итерации",
        init: {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ prompt, project, activeScreen }),
        },
    });
}

async function runPromptSubmission(args: {
    saveBeforeAction: () => Promise<boolean>;
    taskId: string;
    project: Project;
    promptText: string;
    currentLevelStarted: boolean;
    activeScreen?: string | null;
    setPromptPending: (pending: boolean) => void;
    setPromptStatus: (status: string) => void;
    setPromptError: (error: string) => void;
    postPromptImpl?: typeof postPrompt;
}): Promise<PromptRunOutcome | null> {
    if (!(await args.saveBeforeAction())) return null;

    args.setPromptStatus("");
    args.setPromptError("");

    if (!args.currentLevelStarted) {
        args.setPromptError("Сначала начните workflow-сессию");
        return null;
    }

    if (!args.promptText.trim()) {
        args.setPromptError("Введите уточняющий промпт");
        return null;
    }

    args.setPromptPending(true);

    try {
        const postPromptImpl = args.postPromptImpl ?? postPrompt;
        const data = await postPromptImpl(args.taskId, args.promptText, args.project, args.activeScreen);

        if (!data?.ok) {
            args.setPromptError(data?.error || "Ошибка запуска итерации");
            return { kind: "error", error: data?.error || "Ошибка запуска итерации" };
        }

        return {
            kind: "success",
            promptText: args.promptText,
            data,
        };
    } catch {
        const error = buildWorkbenchActionNetworkMessage("Ошибка запуска итерации");
        args.setPromptError(error);
        return { kind: "error", error };
    } finally {
        args.setPromptPending(false);
    }
}

function usePromptController(
    props: WorkbenchProps,
    project: Project,
    saveBeforeAction: () => Promise<boolean>,
    replaceTaskData: (taskData: WorkbenchProps["taskData"]) => void,
) {
    const [promptText, setPromptText] = useState("");
    const [promptStatus, setPromptStatus] = useState("");
    const [promptError, setPromptError] = useState("");
    const [promptPending, setPromptPending] = useState(false);

    async function handlePromptRun() {
        const outcome = await runPromptSubmission({
            saveBeforeAction,
            taskId: props.taskItem.id,
            project,
            promptText,
            currentLevelStarted: props.taskItem.progress.currentLevelStarted,
            activeScreen: props.screenEvent.payload.activeScreen,
            setPromptPending,
            setPromptStatus,
            setPromptError,
        });

        if (!outcome || outcome.kind !== "success") return;

        props.onTaskItemChange(outcome.data.taskItem ?? null);
        replaceTaskData(outcome.data.taskData);
        props.onTransition(outcome.data.transition ?? null);
        const nextState = resolvePromptRunSuccessState(outcome.data);
        if (nextState.clearPrompt) {
            setPromptText("");
        }
        setPromptStatus(nextState.status);
    }

    return { handlePromptRun, promptError, promptPending, promptStatus, promptText, setPromptError, setPromptStatus, setPromptText };
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

export { postPrompt, resolvePromptRunSuccessState, runPromptSubmission, usePromptController, usePromptInput };
