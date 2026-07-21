"use client"

import type { ProjectSurfaceSummary } from "@/lib/project/client"

function ProjectSourcesHeader({ surface }: { surface: ProjectSurfaceSummary | null }) {
  const archiveFileCount = surface?.archiveGroups.reduce((sum, group) => sum + group.fileCount, 0) ?? 0

  return (
    <div className="grid gap-4 xl:grid-cols-4">
      <article className="shell-card border border-black bg-white p-4">
        <p className="text-sm uppercase tracking-wide text-black/50">Код проекта</p>
        <p className="mt-2 text-xl"><code>{surface?.metadata.code ?? "не прочитан"}</code></p>
      </article>
      <article className="shell-card border border-black bg-white p-4">
        <p className="text-sm uppercase tracking-wide text-black/50">Figma-файлы</p>
        <p className="mt-2 text-xl">{surface?.figmaFiles.length ?? 0}</p>
      </article>
      <article className="shell-card border border-black bg-white p-4">
        <p className="text-sm uppercase tracking-wide text-black/50">Структурные графы</p>
        <p className="mt-2 text-xl">
          {(surface?.componentGraph.storagePath ? 1 : 0) + (surface?.screenGraph.storagePath ? 1 : 0)} / 2
        </p>
      </article>
      <article className="shell-card border border-black bg-white p-4">
        <p className="text-sm uppercase tracking-wide text-black/50">Файлы архива</p>
        <p className="mt-2 text-xl">{archiveFileCount}</p>
      </article>
    </div>
  )
}

function ProjectFigmaFilesCard({ surface }: { surface: ProjectSurfaceSummary | null }) {
  return (
    <article className="shell-card border border-black bg-white p-5">
      <h3 className="text-2xl">Figma-файлы</h3>
      <p className="mt-2 text-sm text-black/70">
        В первой волне это project-owned registry источников, а не import/sync engine.
      </p>
      {surface?.figmaFiles.length ? (
        <div className="mt-4 grid gap-3">
          {surface.figmaFiles.map((file) => (
            <div key={file.id} className="shell-card-muted border border-black bg-neutral-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong>{file.title}</strong>
                <code>{file.id}</code>
              </div>
              <p className="mt-2 text-sm text-black/70">{file.url ?? "Canonical URL пока не указан."}</p>
              {file.status ? <p className="mt-2 text-sm text-black/65">Статус: {file.status}</p> : null}
              {file.notes ? <p className="mt-2 text-sm text-black/65">{file.notes}</p> : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-black/65">
          Figma-файлы пока не зафиксированы в источниках проекта.
        </p>
      )}
    </article>
  )
}

function GraphCard({
  description,
  graph,
  title,
}: {
  description: string
  graph: ProjectSurfaceSummary["componentGraph"]
  title: string
}) {
  return (
    <article className="shell-card border border-black bg-white p-5">
      <h3 className="text-2xl">{title}</h3>
      <p className="mt-2 text-sm text-black/70">{description}</p>
      <dl className="mt-4 grid gap-3 text-base">
        <div>
          <dt className="text-black/60">Узлы</dt>
          <dd>{graph.nodeCount}</dd>
        </div>
        <div>
          <dt className="text-black/60">Связи</dt>
          <dd>{graph.edgeCount}</dd>
        </div>
        <div>
          <dt className="text-black/60">Путь хранения</dt>
          <dd><code>{graph.storagePath ?? "ещё не зафиксирован"}</code></dd>
        </div>
      </dl>
    </article>
  )
}

function ProjectArchiveCard({ surface }: { surface: ProjectSurfaceSummary | null }) {
  return (
    <article className="shell-card border border-black bg-white p-5">
      <h3 className="text-2xl">Архив</h3>
      <p className="mt-2 text-sm text-black/70">
        Архив отделён от runtime/workflow artifacts и читается как project-owned набор файлов.
      </p>
      <div className="mt-4 grid gap-3">
        {(surface?.archiveGroups ?? []).map((group) => (
          <div key={group.id} className="shell-card-muted border border-black bg-neutral-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <strong>{group.title}</strong>
              <span className="text-sm text-black/65">{group.fileCount} файл(ов)</span>
            </div>
            <p className="mt-2 text-sm text-black/65">
              <code>{group.storagePath ?? `archive/${group.id}`}</code>
            </p>
            {group.files.length ? (
              <ul className="mt-3 grid gap-2 text-sm text-black/75">
                {group.files.slice(0, 5).map((file) => (
                  <li key={file.path}>
                    <code>{file.path}</code> — {file.title}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-black/65">Файлы в этой группе пока не добавлены.</p>
            )}
          </div>
        ))}
      </div>
    </article>
  )
}

function ProjectSourcesPanel({ surface }: { surface: ProjectSurfaceSummary | null }) {
  return (
    <section className="shell-section mt-6 border border-black bg-white p-6">
      <div>
        <p className="shell-eyebrow text-xs uppercase tracking-[0.22em]">Метаданные и источники</p>
        <h2 className="shell-subtitle mt-3 text-[clamp(2.2rem,4vw,3.5rem)]">Источники и структура проекта</h2>
        <p className="mt-2 max-w-4xl text-lg text-black/72">
          Здесь видны metadata и project-owned sources: code, design references, structure graphs и
          archive как часть контракта проекта, а не как побочный runtime output.
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <ProjectSourcesHeader surface={surface} />
        <div className="grid gap-4 xl:grid-cols-2">
          <ProjectFigmaFilesCard surface={surface} />
          <GraphCard
            description="Canonical карта компонентного состава проекта."
            graph={surface?.componentGraph ?? { edgeCount: 0, nodeCount: 0, storagePath: null }}
            title="Граф компонентов"
          />
          <GraphCard
            description="Structural slice экранов, совместимый с общей graph-моделью."
            graph={surface?.screenGraph ?? { edgeCount: 0, nodeCount: 0, storagePath: null }}
            title="Граф экранов"
          />
          <ProjectArchiveCard surface={surface} />
        </div>
      </div>
    </section>
  )
}

export { ProjectSourcesPanel }
