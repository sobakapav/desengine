"use client";

import {
    SandpackPreview,
    SandpackProvider,
} from "@codesandbox/sandpack-react/unstyled";
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";

import type { SandpackPreviewPayload } from "@/lib/lab/sandpack-preview.types";

import { mergePreviewRuntimeContractState, type PreviewRuntimeContractState } from "../preview-runtime-contract-state";
import { getPreviewCheckGuardMessage } from "../preview-runtime-contract-message";
import { resolvePreviewClientId } from "../preview-client-id";
import { usePreviewCheckButtonGuard, usePreviewRuntimeContract } from "./preview-runtime-contract";
import { SandpackRuntimeActivityBridge, SandpackRuntimeDiagnosticsNotice } from "./preview-runtime-activity";
import {
    getPreviewRuntimeSupport,
    PreviewCheckGuardNotice,
    PreviewRuntimeContractErrorNotice,
    PreviewSecureContextNotice,
    PreviewStyleContractNotice,
    ProjectCompatibilityNotice,
    ProjectMigrationNotice,
} from "./preview-runtime-notices";

type SandpackPreviewRef = {
    clientId: string;
};

function useSandpackPreviewClientId(moduleUrl: string) {
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

    return { handlePreviewRef, previewClientId };
}

function useSandpackPreviewFrameModel({
    moduleUrl,
    previewPayload,
    previewSessionId,
}: {
    moduleUrl: string;
    previewPayload: SandpackPreviewPayload;
    previewSessionId: string;
}) {
    const compatibility = previewPayload.project.compatibility;
    const previewRootRef = useRef<HTMLDivElement | null>(null);
    const { contractState: runtimeContract, setRuntimeContractState } = usePreviewRuntimeContract({
        moduleUrl,
        previewSessionId,
        mode: compatibility.status === "compatible" ? "enabled" : "disabled",
        previewRootRef,
    });
    const { handlePreviewRef, previewClientId } = useSandpackPreviewClientId(moduleUrl);
    const handleRuntimeContractChange = useCallback((next: PreviewRuntimeContractState) => {
        setRuntimeContractState((current) => mergePreviewRuntimeContractState(current, next));
    }, [setRuntimeContractState]);
    const previewCheckGuardMessage = useMemo(() => getPreviewCheckGuardMessage(runtimeContract), [runtimeContract]);

    usePreviewCheckButtonGuard(previewCheckGuardMessage);

    return {
        compatibility,
        handlePreviewRef,
        handleRuntimeContractChange,
        previewCheckGuardMessage,
        previewClientId,
        previewRootRef,
        runtimeContract,
    };
}

function PreviewRuntimeSurface({
    handlePreviewRef,
    handleRuntimeContractChange,
    moduleUrl,
    previewCheckGuardMessage,
    previewClientId,
    previewPayload,
    previewRootRef,
    runtimeContract,
}: {
    handlePreviewRef: (value: SandpackPreviewRef | null) => void;
    handleRuntimeContractChange: (next: PreviewRuntimeContractState) => void;
    moduleUrl: string;
    previewCheckGuardMessage: string | null;
    previewClientId: string | null;
    previewPayload: SandpackPreviewPayload;
    previewRootRef: RefObject<HTMLDivElement | null>;
    runtimeContract: PreviewRuntimeContractState;
}) {
    return (
        <div className="w-full" ref={previewRootRef}>
            <PreviewRuntimeNotices
                previewCheckGuardMessage={previewCheckGuardMessage}
                runtimeContract={runtimeContract}
            />
            <SandpackProviderSurface
                handlePreviewRef={handlePreviewRef}
                handleRuntimeContractChange={handleRuntimeContractChange}
                moduleUrl={moduleUrl}
                previewClientId={previewClientId}
                previewPayload={previewPayload}
            />
        </div>
    );
}

function PreviewRuntimeNotices({
    previewCheckGuardMessage,
    runtimeContract,
}: {
    previewCheckGuardMessage: string | null;
    runtimeContract: PreviewRuntimeContractState;
}) {
    return (
        <>
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
            {previewCheckGuardMessage ? <PreviewCheckGuardNotice message={previewCheckGuardMessage} /> : null}
        </>
    );
}

function SandpackProviderSurface({
    handlePreviewRef,
    handleRuntimeContractChange,
    moduleUrl,
    previewClientId,
    previewPayload,
}: {
    handlePreviewRef: (value: SandpackPreviewRef | null) => void;
    handleRuntimeContractChange: (next: PreviewRuntimeContractState) => void;
    moduleUrl: string;
    previewClientId: string | null;
    previewPayload: SandpackPreviewPayload;
}) {
    return (
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
    );
}

/**
 * @example
 * ```tsx
 * <SandpackPreviewFrame moduleUrl={moduleUrl} previewPayload={payload} previewSessionId={sessionId} />
 * ```
 */
export function SandpackPreviewFrame({ moduleUrl, previewPayload, previewSessionId }: {
    moduleUrl: string;
    previewPayload: SandpackPreviewPayload;
    previewSessionId: string;
}) {
    const {
        compatibility,
        handlePreviewRef,
        handleRuntimeContractChange,
        previewCheckGuardMessage,
        previewClientId,
        previewRootRef,
        runtimeContract,
    } = useSandpackPreviewFrameModel({ moduleUrl, previewPayload, previewSessionId });
    const previewRuntimeSupport = getPreviewRuntimeSupport();

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
        <PreviewRuntimeSurface
            handlePreviewRef={handlePreviewRef}
            handleRuntimeContractChange={handleRuntimeContractChange}
            moduleUrl={moduleUrl}
            previewCheckGuardMessage={previewCheckGuardMessage}
            previewClientId={previewClientId}
            previewPayload={previewPayload}
            previewRootRef={previewRootRef}
            runtimeContract={runtimeContract}
        />
    );
}
