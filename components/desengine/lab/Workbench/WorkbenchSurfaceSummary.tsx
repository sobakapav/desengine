"use client";

import type { WorkbenchSurfaceSnapshot } from "./workbenchSurface";

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

/**
 * @example
 * ```tsx
 * <WorkbenchSurfaceSummary surface={surface} />
 * ```
 */
export function WorkbenchSurfaceSummary({
    surface,
}: {
    surface: WorkbenchSurfaceSnapshot;
}) {
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
                <SurfaceFact label="Task" value={surface.taskId} />
                <SurfaceFact label="Workflow step" value={surface.workflowStepTitle} />
                <SurfaceFact label="Workbench" value={surface.workbenchDefinitionTitle} />
            </div>

            <div className="grid gap-2 md:grid-cols-3">
                <SurfaceFact label="Definition" value={surface.workbenchDefinitionId} />
                <SurfaceFact label="Profile" value={surface.workbenchProfileId} />
                <SurfaceFact label="Instance" value={surface.workbenchInstanceId} />
            </div>
        </div>
    );
}
