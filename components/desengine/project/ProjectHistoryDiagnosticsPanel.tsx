"use client"

import type { ProjectHistoryDiagnosticsSnapshot } from "@/lib/project/history-diagnostics"

import { buildProjectHistoryDiagnosticsModel } from "./projectSurface"

type ProjectHistoryDiagnosticsPanelProps = {
  historyDiagnostics: ProjectHistoryDiagnosticsSnapshot
}

function EmptyHistoryState() {
  return (
    <p className="mt-4 text-lg text-black/70">
      У этого проекта пока нет проявленного runtime-следа. Как только пользователь начнёт или
      продолжит задачу в контексте проекта, здесь появятся prompt history, check-result и reset
      diagnostics.
    </p>
  )
}

function ProjectHistoryDiagnosticsPanel({
  historyDiagnostics,
}: ProjectHistoryDiagnosticsPanelProps) {
  const model = buildProjectHistoryDiagnosticsModel(historyDiagnostics)

  return (
    <section className="mt-6 rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl">История и диагностика проекта</h2>
          <p className="mt-2 max-w-4xl text-lg text-black/70">
            Этот read-only surface показывает project-scoped след без перехода к сырым runtime-файлам:
            prompts, проверки, reset snapshots и рабочий контекст задач.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <article className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <p className="text-sm uppercase tracking-wide text-black/50">Связанные задачи</p>
          <p className="mt-2 text-2xl">{model.summary.taskCountLabel}</p>
        </article>
        <article className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <p className="text-sm uppercase tracking-wide text-black/50">Prompt history</p>
          <p className="mt-2 text-2xl">{model.summary.promptCountLabel}</p>
        </article>
        <article className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <p className="text-sm uppercase tracking-wide text-black/50">Check results</p>
          <p className="mt-2 text-2xl">{model.summary.checkResultCountLabel}</p>
        </article>
        <article className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <p className="text-sm uppercase tracking-wide text-black/50">Reset snapshots</p>
          <p className="mt-2 text-2xl">{model.summary.resetSnapshotCountLabel}</p>
        </article>
        <article className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <p className="text-sm uppercase tracking-wide text-black/50">Runtime-файлы</p>
          <p className="mt-2 text-2xl">{model.summary.runtimeFileCountLabel}</p>
        </article>
        <article className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <p className="text-sm uppercase tracking-wide text-black/50">Последняя активность</p>
          <p className="mt-2 text-base">{model.summary.lastActivityLabel}</p>
        </article>
      </div>

      <div className="mt-6 rounded-3xl border border-black/10 bg-[#f8f4ea] p-5">
        <h3 className="text-2xl">Reset snapshots</h3>

        {model.resetSnapshots.length > 0 ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {model.resetSnapshots.map((snapshot) => (
              <article key={`${snapshot.taskId}:${snapshot.levelLabel}`} className="rounded-2xl border border-black/10 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong>{snapshot.taskId}</strong>
                  <span className="text-sm text-black/60">{snapshot.levelLabel}</span>
                </div>
                <p className="mt-2 text-sm text-black/70">{snapshot.editableFilesLabel}</p>
                <p className="mt-1 text-sm text-black/70">{snapshot.capturedFilesLabel}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-black/70">
            Reset snapshots для этого проекта пока не сохранены.
          </p>
        )}
      </div>

      {historyDiagnostics.summary.taskCount === 0 ? (
        <EmptyHistoryState />
      ) : (
        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-black/10 bg-white p-5">
              <h3 className="text-2xl">Prompt history</h3>
              <div className="mt-4 grid gap-3">
                {model.prompts.slice(0, 6).map((prompt) => (
                  <article key={`${prompt.taskId}:${prompt.createdAtLabel}:${prompt.textPreview}`} className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <strong>{prompt.taskId}</strong>
                      <span className="text-sm text-black/60">{prompt.createdAtLabel}</span>
                    </div>
                    <p className="mt-2 text-sm text-black/60">{prompt.levelLabel}</p>
                    <p className="mt-3 text-base">{prompt.textPreview}</p>
                    <p className="mt-3 text-sm text-black/70">Изменённые файлы: {prompt.changedFilesLabel}</p>
                    <p className="mt-1 text-sm text-black/70">LLM provider: {prompt.providerLabel}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-black/10 bg-white p-5">
              <h3 className="text-2xl">Check-result след</h3>
              {model.checkResults.length > 0 ? (
                <div className="mt-4 grid gap-3">
                  {model.checkResults.map((checkResult) => (
                    <article key={`${checkResult.taskId}:${checkResult.createdAtLabel}`} className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <strong>{checkResult.taskId}</strong>
                        <span className="text-sm text-black/60">{checkResult.createdAtLabel}</span>
                      </div>
                      <p className="mt-2 text-sm text-black/60">{checkResult.levelLabel}</p>
                      <p className="mt-3 text-base">{checkResult.statusLabel}</p>
                      <p className="mt-2 text-sm text-black/70">{checkResult.messagePreview}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-black/70">
                  Check-result след для этого проекта пока не накоплен.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-black/10 bg-white p-5">
              <h3 className="text-2xl">Рабочий контекст проекта</h3>
              <div className="mt-4 grid gap-3">
                {model.runtimeContexts.map((context) => (
                  <article key={context.taskId} className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <strong>{context.taskId}</strong>
                      <span className="text-sm text-black/60">{context.lastActivityLabel}</span>
                    </div>
                    <p className="mt-2 text-sm text-black/70">{context.promptCountLabel}</p>
                    <p className="mt-1 text-sm text-black/70">{context.checkResultLabel}</p>
                    <p className="mt-1 text-sm text-black/70">{context.resetSnapshotLabel}</p>
                    <p className="mt-1 text-sm text-black/70">{context.runtimeFilesLabel}</p>
                    <p className="mt-2 text-sm text-black/75">{context.runtimeFilesPreview}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-black/10 bg-black/[0.03] p-5">
              <h3 className="text-2xl">Что означает этот слой</h3>
              <p className="mt-3 text-sm leading-6 text-black/75">
                Здесь показан уже накопленный project-scoped след. Он помогает понять, какие task
                runtime-данные уже живут внутри проекта, не превращая project page в файловый
                браузер и не смешивая этот экран с workflow readout следующей волны.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export { ProjectHistoryDiagnosticsPanel }
