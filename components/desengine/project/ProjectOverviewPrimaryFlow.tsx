"use client"

import Link from "next/link"

import type { ProjectComponent } from "@/lib/project/component-runtime"
import type { ProjectSession } from "@/lib/project/workspace-session"
import { getProjectsRootUrl } from "@/lib/project/navigation"

function buildPrimaryFlowModel(args: {
  activeComponent: ProjectComponent | null
  componentCount: number
  session: ProjectSession | null
}) {
  if (args.componentCount === 0) {
    return {
      stepLabel: "Сейчас важно",
      title: "Добавьте первый компонент",
      description: "Проект уже открыт. Следующее полезное действие одно: добавить первую рабочую часть, с которой проект сможет реально работать дальше.",
      bullets: [
        "Нажмите «Добавить компонент» ниже.",
        "После создания сразу сделайте его фокусом проекта.",
      ],
    }
  }

  if (!args.activeComponent) {
    return {
      stepLabel: "Сейчас важно",
      title: "Выберите рабочий фокус",
      description: "Компоненты уже есть, но проект ещё не работает через один конкретный компонент. Зафиксируйте текущий фокус, чтобы работа стала однозначной.",
      bullets: [
        "Найдите нужный компонент в списке.",
        "Нажмите «Сделать фокусом проекта».",
      ],
    }
  }

  if (args.session?.status === "completed") {
    return {
      stepLabel: "Текущее состояние",
      title: `Проект собран вокруг «${args.activeComponent.title}»`,
      description: "Главный маршрут уже пройден: у проекта есть состав компонентов и текущий рабочий фокус. Теперь можно отмечать готовые части и переключать фокус по мере развития проекта.",
      bullets: [
        "Отмечайте готовые компоненты прямо в списке.",
        "Если нужно, переведите проект на другой компонент без ухода со страницы.",
      ],
    }
  }

  return {
    stepLabel: "Сейчас важно",
    title: `Продолжайте работу через «${args.activeComponent.title}»`,
    description: "Проект уже перешёл в рабочий режим. Дальше всё должно происходить прямо на этой странице: фокус, статус компонентов и наблюдение за workflow.",
    bullets: [
      "Продолжайте работу над текущим компонентом.",
      "Когда компонент готов, отметьте его как готовый в проекте.",
    ],
  }
}

/**
 * @example
 * ```tsx
 * <ProjectOverviewPrimaryFlow
 *   activeComponent={null}
 *   componentCount={0}
 *   session={null}
 * />
 * ```
 */
function ProjectOverviewPrimaryFlow({
  activeComponent,
  componentCount,
  session,
}: {
  activeComponent: ProjectComponent | null
  componentCount: number
  session: ProjectSession | null
}) {
  const model = buildPrimaryFlowModel({
    activeComponent,
    componentCount,
    session,
  })

  return (
    <section className="mt-6 rounded-[2rem] border border-black/10 bg-[linear-gradient(135deg,#f6efe4_0%,#fffdf8_55%,#f0f4ea_100%)] p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-4xl">
          <p className="text-sm uppercase tracking-[0.18em] text-black/45">{model.stepLabel}</p>
          <h2 className="mt-3 text-4xl">{model.title}</h2>
          <p className="mt-4 text-lg text-black/70">{model.description}</p>
        </div>

        <Link className="rounded-full border border-black/15 bg-white px-4 py-2 text-sm" href={getProjectsRootUrl()}>
          Все проекты
        </Link>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {model.bullets.map((bullet) => (
          <div key={bullet} className="rounded-2xl border border-black/10 bg-white/80 p-4 text-base text-black/80">
            {bullet}
          </div>
        ))}
      </div>
    </section>
  )
}

export { ProjectOverviewPrimaryFlow }
