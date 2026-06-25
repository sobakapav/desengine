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
    <section className="mt-6 rounded-3xl border border-emerald-200 bg-[linear-gradient(135deg,rgba(214,255,230,0.8),rgba(247,255,250,0.98))] p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-3xl">{model.headline}</h2>
        <span className="rounded-full border border-emerald-400/60 bg-white/80 px-3 py-1 text-sm">
          project-facing слой
        </span>
      </div>

      <p className="mt-3 max-w-4xl text-lg text-black/75">{model.summary}</p>
      <p className="mt-3 max-w-4xl rounded-2xl border border-emerald-300/70 bg-white/75 p-4 text-base text-black/80">
        {model.visionLabel}
      </p>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {model.attractors.map((attractor) => (
          <article key={attractor.id} className="rounded-2xl border border-black/10 bg-white/85 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-black/45">{attractor.id}</p>
            <h3 className="mt-2 text-2xl">{attractor.title}</h3>
            <p className="mt-3 text-sm text-black/70">{attractor.description}</p>
            <p className="mt-4 text-sm font-medium text-black/85">{attractor.projectSignal}</p>
          </article>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-2xl border border-black/10 bg-white/80 p-5">
          <h3 className="text-2xl">Текущие ограничения рабочей модели</h3>
          <ul className="mt-4 space-y-3 text-base text-black/75">
            {model.constraints.map((constraint) => (
              <li key={constraint} className="rounded-2xl bg-black/[0.03] px-4 py-3">
                {constraint}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-black/10 bg-white/80 p-5">
          <h3 className="text-2xl">Ближайшие архитектурные волны</h3>
          <div className="mt-4 space-y-3">
            {model.nextWaves.map((wave) => (
              <div key={wave.title} className="rounded-2xl bg-black/[0.03] px-4 py-3">
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
