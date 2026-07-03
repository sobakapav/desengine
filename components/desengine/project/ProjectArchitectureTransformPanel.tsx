import type { ProjectHistoryDiagnosticsSnapshot } from "@/lib/project/history-diagnostics"
import type { ProjectWorkflowReadoutSnapshot } from "@/lib/project/workflow-readout"
import type { ProjectWorkspace } from "@/lib/project/runtime"

import { buildProjectArchitectureTransformModel } from "./projectArchitectureTransformSurface"

type ProjectArchitectureTransformPanelProps = {
  historyDiagnostics: ProjectHistoryDiagnosticsSnapshot
  isActive: boolean
  project: ProjectWorkspace
  workflowReadout: ProjectWorkflowReadoutSnapshot
}

function ProjectArchitectureTransformPanel({
  historyDiagnostics,
  isActive,
  project,
  workflowReadout,
}: ProjectArchitectureTransformPanelProps) {
  const model = buildProjectArchitectureTransformModel({
    historyDiagnostics,
    isActive,
    project,
    workflowReadout,
  })

  return (
    <section className="shell-section mt-6 border border-black bg-white p-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="shell-subtitle text-[clamp(2.2rem,4vw,3.5rem)]">{model.headline}</h2>
        <span className="shell-badge inline-flex items-center border border-black bg-white px-3 py-1 text-sm">
          project-facing слой
        </span>
      </div>

      <p className="mt-3 max-w-4xl text-lg text-black/75">{model.summary}</p>
      <p className="shell-callout mt-3 max-w-4xl border border-dashed border-black bg-white p-4 text-base text-black/80">
        {model.visionLabel}
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {model.attractors.map((attractor) => (
          <article key={attractor.id} className="shell-card border border-black bg-white p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-black/45">{attractor.id}</p>
            <h3 className="mt-2 text-2xl">{attractor.title}</h3>
            <p className="mt-3 text-sm text-black/70">{attractor.description}</p>
            <p className="mt-4 text-sm font-medium text-black/85">{attractor.projectSignal}</p>
          </article>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="shell-card border border-black bg-white p-5">
          <h3 className="text-2xl">Текущие ограничения рабочей модели</h3>
          <ul className="mt-4 space-y-3 text-base text-black/75">
            {model.constraints.map((constraint) => (
              <li key={constraint} className="border border-black bg-neutral-50 px-4 py-3">
                {constraint}
              </li>
            ))}
          </ul>
        </article>

        <article className="shell-card border border-black bg-white p-5">
          <h3 className="text-2xl">Ближайшие архитектурные волны</h3>
          <div className="mt-4 space-y-3">
            {model.nextWaves.map((wave) => (
              <div key={wave.title} className="border border-black bg-neutral-50 px-4 py-3">
                <p className="text-lg font-medium">{wave.title}</p>
                <p className="mt-1 text-sm text-black/70">{wave.summary}</p>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  )
}

export { ProjectArchitectureTransformPanel }
