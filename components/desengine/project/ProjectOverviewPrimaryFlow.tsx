"use client"

import Link from "next/link"

import type { ProjectSession } from "@/lib/project/workspace-session"
import { getProjectsRootUrl } from "@/lib/project/navigation"

function buildPrimaryFlowModel(args: {
  componentCount: number
  inProgressComponentCount: number
  session: ProjectSession | null
}) {
  if (args.componentCount === 0) {
    return {
      stepLabel: "Сейчас важно",
      title: "Добавьте первый компонент",
      description: "Проект уже открыт. Следующее полезное действие одно: добавить первую рабочую часть, с которой проект сможет реально работать дальше.",
      bullets: [
        "Нажмите «Добавить компонент» ниже.",
        "После создания запустите по нему первую рабочую линию.",
      ],
    }
  }

  if (args.inProgressComponentCount === 0) {
    return {
      stepLabel: "Сейчас важно",
      title: "Запустите первую линию работы",
      description: "Компоненты уже есть, но проект ещё не ведёт ни один из них в активной работе. Запустите первую линию прямо из карточки компонента.",
      bullets: [
        "Найдите нужный компонент в списке.",
        "Нажмите «Взять в работу».",
      ],
    }
  }

  if (args.session?.status === "completed") {
    return {
      stepLabel: "Текущее состояние",
      title: "Проект собран в согласованную систему",
      description: "Главный маршрут уже пройден: у проекта есть состав компонентов и рабочие линии. Теперь можно отмечать готовые части и при необходимости возвращать их в работу.",
      bullets: [
        "Отмечайте готовые компоненты прямо в списке.",
        "Если нужно, возвращайте нужные компоненты в работу без ухода со страницы.",
      ],
    }
  }

  return {
    stepLabel: "Сейчас важно",
    title: "Продолжайте активные линии работы",
    description: "Проект уже перешёл в рабочий режим. Дальше всё должно происходить прямо на этой странице: статусы компонентов, запуск новых линий и наблюдение за workflow.",
    bullets: [
      "Продолжайте работу над нужными компонентами.",
      "Когда компонент готов, отметьте его как готовый в проекте.",
    ],
  }
}

/**
 * @example
 * ```tsx
 * <ProjectOverviewPrimaryFlow
 *   componentCount={0}
 *   inProgressComponentCount={0}
 *   session={null}
 * />
 * ```
 */
function ProjectOverviewPrimaryFlow({
  componentCount,
  inProgressComponentCount,
  session,
}: {
  componentCount: number
  inProgressComponentCount: number
  session: ProjectSession | null
}) {
  const model = buildPrimaryFlowModel({
    componentCount,
    inProgressComponentCount,
    session,
  })

  return (
    <section className="shell-section mt-6 border border-black bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-4xl">
          <p className="shell-eyebrow text-xs uppercase tracking-[0.22em]">{model.stepLabel}</p>
          <h2 className="shell-subtitle mt-3 text-[clamp(2.2rem,4vw,3.5rem)]">{model.title}</h2>
          <p className="mt-4 text-lg text-black/72">{model.description}</p>
        </div>

        <Link className="shell-button-secondary inline-flex items-center border border-black bg-white px-4 py-2 no-underline" href={getProjectsRootUrl()}>
          Все проекты
        </Link>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {model.bullets.map((bullet) => (
          <div key={bullet} className="shell-callout border border-dashed border-black bg-white p-4 text-base text-black/80">
            {bullet}
          </div>
        ))}
      </div>
    </section>
  )
}

export { ProjectOverviewPrimaryFlow }
