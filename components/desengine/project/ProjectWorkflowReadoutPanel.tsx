"use client"

import type { ProjectWorkflowReadoutSnapshot } from "@/lib/project/workflow-readout"
import { WorkflowReadoutContent } from "./ProjectWorkflowReadoutContent"

type ProjectWorkflowReadoutPanelProps = {
  workflowReadout: ProjectWorkflowReadoutSnapshot
}

function ProjectWorkflowReadoutPanel({
  workflowReadout,
}: ProjectWorkflowReadoutPanelProps) {
  return (
    <section className="shell-section mt-6 border border-black bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="shell-eyebrow text-xs uppercase tracking-[0.22em]">Workflow readout</p>
          <h2 className="shell-subtitle mt-3 text-[clamp(2.2rem,4vw,3.5rem)]">Как проект держит рабочий контур</h2>
          <p className="mt-2 max-w-4xl text-lg text-black/72">
            Этот слой показывает не скрытый runtime и не служебные контейнеры, а реальную проектную работу:
            компоненты, активные линии и положение каждой рабочей части внутри project-workflow.
          </p>
        </div>
      </div>

      <WorkflowReadoutContent workflowReadout={workflowReadout} />
    </section>
  )
}

export { ProjectWorkflowReadoutPanel }
