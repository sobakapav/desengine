"use client";

import type { WorkbenchSurfaceSnapshot, WorkbenchWorkflowPointSnapshot } from "./workbenchSurface";

function SurfaceFact({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-xl border border-black/10 bg-white/85 px-3 py-2">
            <p className="text-[11px] uppercase tracking-[0.16em] text-black/45">{label}</p>
            <p className="mt-1 text-sm font-medium text-black">{value}</p>
        </div>
    );
}

function WorkflowPointCard({ point }: { point: WorkbenchWorkflowPointSnapshot }) {
    return (
        <div className={`rounded-xl border px-3 py-3 ${point.isSelected ? "border-black bg-white" : point.isFocus ? "border-black/20 bg-white" : "border-black/10 bg-white/75"}`}>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-black">{point.title}</p>
                    <p className="mt-1 text-xs text-black/55">{point.artifactCountLabel}</p>
                    <p className="mt-2 text-[11px] text-black/50">{point.selectionLabel}</p>
                </div>
                <span className="rounded-full border border-black/10 bg-[#f6f2ea] px-2 py-1 text-[11px] font-medium text-black/70">
                    {point.statusLabel}
                </span>
            </div>
        </div>
    );
}

/**
 * @example
 * ```tsx
 * <WorkbenchSurfaceSummary surface={surface} />
 * ```
 */
export function WorkbenchSurfaceSummary({
    componentTitle,
    onSelectWorkflowPoint,
    surface,
}: {
    componentTitle?: string | null;
    onSelectWorkflowPoint?: (pointId: string) => void;
    surface: WorkbenchSurfaceSnapshot;
}) {
    const taskSurfaceValue = componentTitle
        ? `внутренний runtime для компонента «${componentTitle}»`
        : surface.taskId;

    return (
        <div className="mt-3 space-y-3 rounded-2xl border border-black/10 bg-[#f6f2ea] p-3 shadow-sm">
            <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">Workbench surface</p>
                <p className="text-sm text-black/75">
                    Текущая рабочая поверхность materializes связку <code>project -&gt; task -&gt; workflow step -&gt; workbench</code> и
                    показывает, в каком product-контуре вы сейчас работаете.
                </p>
            </div>

            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                <SurfaceFact label="Project" value={`${surface.projectTitle} (${surface.projectId})`} />
                <SurfaceFact label="Task" value={taskSurfaceValue} />
                <SurfaceFact label="Workflow step" value={surface.workflowStepTitle} />
                <SurfaceFact label="Workbench" value={surface.workbenchDefinitionTitle} />
            </div>

            <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">Пункты workflow</p>
                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                    {surface.workflowPoints.map((point) => (
                        <button
                            key={point.id}
                            className="text-left disabled:cursor-default"
                            disabled={!point.isSelectable}
                            onClick={() => onSelectWorkflowPoint?.(point.id)}
                            type="button"
                        >
                            <WorkflowPointCard point={point} />
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid gap-2 md:grid-cols-3">
                <SurfaceFact label="Definition" value={surface.workbenchDefinitionId} />
                <SurfaceFact label="Profile" value={surface.workbenchProfileId} />
                <SurfaceFact label="Instance" value={surface.workbenchInstanceId} />
            </div>
        </div>
    );
}
