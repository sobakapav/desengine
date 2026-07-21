"use client"

import Link from "next/link"

import { getProjectUrl } from "@/lib/project/navigation"

import type { ProjectSurfaceModel } from "./projectSurface"

type ProjectCardProps = {
  project: ProjectSurfaceModel
}

function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="shell-card border border-black bg-white p-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-3xl">{project.title}</h2>
        {project.isActive ? (
          <span className="shell-badge-invert inline-flex items-center border border-black bg-black px-3 py-1 text-sm text-white">
            активный проект
          </span>
        ) : null}
      </div>

      <p className="mt-2 text-sm text-black/70">
        <code>{project.id}</code>
      </p>

      <dl className="mt-4 grid gap-2 text-base">
        <div>
          <dt className="text-black/60">Код проекта</dt>
          <dd><code>{project.code}</code></dd>
        </div>
        <div>
          <dt className="text-black/60">UI kit</dt>
          <dd>{project.uiKitTitle}</dd>
        </div>
        <div>
          <dt className="text-black/60">Figma-файлы</dt>
          <dd>{project.figmaFilesCountLabel}</dd>
        </div>
        <div>
          <dt className="text-black/60">Граф компонентов</dt>
          <dd>{project.componentGraphLabel}</dd>
        </div>
        <div>
          <dt className="text-black/60">Граф экранов</dt>
          <dd>{project.screenGraphLabel}</dd>
        </div>
        <div>
          <dt className="text-black/60">Архив</dt>
          <dd>{project.archiveSummaryLabel}</dd>
        </div>
        <div>
          <dt className="text-black/60">Хранение</dt>
          <dd>{project.storageLabel}</dd>
        </div>
        <div>
          <dt className="text-black/60">Server path</dt>
          <dd className="font-mono text-sm">{project.rootPathLabel}</dd>
        </div>
        <div>
          <dt className="text-black/60">Обновлён</dt>
          <dd>{project.updatedAtLabel}</dd>
        </div>
      </dl>

      <Link
        className="shell-button-secondary mt-5 inline-flex items-center border border-black bg-white px-4 py-2 no-underline"
        href={getProjectUrl(project.id)}
      >
        Открыть проект
      </Link>
    </article>
  )
}

export { ProjectCard }
