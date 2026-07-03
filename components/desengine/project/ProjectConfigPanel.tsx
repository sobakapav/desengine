"use client"

import type { ProjectWorkspace } from "@/lib/project/runtime"

import { ProjectConfigEditor, ProjectConfigSidebar } from "./projectConfigPanelParts"
import { useProjectConfigController } from "./useProjectConfigController"

type ProjectConfigPanelProps = {
  project: ProjectWorkspace
  onProjectSaved: (project: ProjectWorkspace) => void
}

function ProjectConfigPanel({
  project,
  onProjectSaved,
}: ProjectConfigPanelProps) {
  const controller = useProjectConfigController({ onProjectSaved, project })

  return (
    <section className="shell-section mt-6 border border-black bg-white p-6">
      <div>
        <p className="shell-eyebrow text-xs uppercase tracking-[0.22em]">Project config</p>
        <h2 className="shell-subtitle mt-3 text-[clamp(2.2rem,4vw,3.5rem)]">Конфигурация проекта</h2>
        <p className="mt-2 max-w-4xl text-lg text-black/72">
          Здесь настраиваются основные пользовательские поля проекта: название, идентификатор и
          выбранный UI kit.
        </p>
      </div>

      <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <ProjectConfigEditor
          draft={controller.draft}
          message={controller.message}
          saveState={controller.saveState}
          uiKitOptions={controller.uiKitOptions}
          validationMessage={controller.validationMessage}
          validationOk={controller.validatedDraft.ok}
          onReset={controller.handleReset}
          onSave={() => void controller.handleSave()}
          onUpdate={controller.updateDraft}
        />
        <ProjectConfigSidebar
          contract={controller.contract}
          draftProject={controller.draftProject}
          uiKitOptions={controller.uiKitOptions}
        />
      </div>
    </section>
  )
}

export { ProjectConfigPanel }
