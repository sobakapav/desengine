"use client"

import Link from "next/link"

import { getProjectUrl } from "@/lib/project/navigation"

import type { ProjectSurfaceModel } from "./projectSurface"

type ProjectCardProps = {
  project: ProjectSurfaceModel
}

function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-3xl">{project.title}</h2>
        {project.isActive ? (
          <span className="rounded-full bg-black px-3 py-1 text-sm text-white">
            активный проект
          </span>
        ) : null}
      </div>

      <p className="mt-2 text-sm text-black/70">
        <code>{project.id}</code>
      </p>

      <dl className="mt-4 grid gap-2 text-base">
        <div>
          <dt className="text-black/60">UI kit</dt>
          <dd>{project.uiKitTitle}</dd>
        </div>
        <div>
          <dt className="text-black/60">Хранение</dt>
          <dd>{project.storageLabel}</dd>
        </div>
        <div>
          <dt className="text-black/60">Обновлён</dt>
          <dd>{project.updatedAtLabel}</dd>
        </div>
      </dl>

      <Link
        className="mt-5 inline-flex rounded-full border border-black px-4 py-2"
        href={getProjectUrl(project.id)}
      >
        Открыть проект
      </Link>
    </article>
  )
}

export { ProjectCard }
