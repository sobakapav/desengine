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
    <section className="mt-6 rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl">Как проект держит рабочий контур</h2>
          <p className="mt-2 max-w-4xl text-lg text-black/70">
            Этот слой показывает не задачи и не скрытый runtime, а реальную проектную работу:
            компоненты, текущий фокус и положение каждой рабочей части внутри project-workflow.
          </p>
        </div>
      </div>

      <WorkflowReadoutContent workflowReadout={workflowReadout} />
    </section>
  )
}

export { ProjectWorkflowReadoutPanel }
