import type { ProjectHistoryDiagnosticsSnapshot } from "@/lib/project/history-diagnostics"
import type { ProjectWorkflowReadoutSnapshot } from "@/lib/project/workflow-readout"
import type { ProjectWorkspace } from "@/lib/project/runtime"

type ProjectArchitectureTransformModel = {
  headline: string
  summary: string
  visionLabel: string
  attractors: Array<{
    id: "code" | "llm" | "budget" | "design"
    title: string
    description: string
    projectSignal: string
  }>
  constraints: string[]
  nextWaves: Array<{
    title: string
    summary: string
  }>
}

function buildProjectSignalSummary(args: {
  isActive: boolean
  project: ProjectWorkspace
  historyDiagnostics: ProjectHistoryDiagnosticsSnapshot
  workflowReadout: ProjectWorkflowReadoutSnapshot
}) {
  const eventCount = args.historyDiagnostics.summary.eventCount
  const createdComponentCount = args.historyDiagnostics.summary.createdComponentCount
  const completedComponentCount = args.historyDiagnostics.summary.completedComponentCount
  const workflowComponentCount = args.workflowReadout.entries.length

  return {
    code: createdComponentCount > 0
      ? `Проект уже проявил ${createdComponentCount} компонент(ов) как code-facing сущности внутри project-scoped контура.`
      : "Кодовой контур ещё не накопил project-scoped компоненты, но boundary уже выделен.",
    llm: eventCount > 0
      ? `LLM- и prompt-след уже читается через ${eventCount} project-level событий рабочей истории.`
      : "LLM-контур ещё не накопил историю, но project boundary уже готов принять prompt/runtime след.",
    budget: workflowComponentCount > 0
      ? `Workflow readout уже даёт наблюдаемость нагрузки и объёма delivery-контуров для ${workflowComponentCount} компонентов проекта.`
      : "Бюджетный и artifact-контур пока описан рамкой линии и ждёт следующего operational насыщения.",
    design: args.isActive && completedComponentCount > 0
      ? `Активный проект ${args.project.title} уже materialize'ит выбранный UI kit и собирает готовые компоненты в архитектурную поверхность.`
      : args.isActive
      ? `Активный проект ${args.project.title} уже materialize'ит выбранный UI kit как часть архитектурной поверхности.`
      : `Проект ${args.project.title} уже читает design-контур через project settings, даже вне active статуса.`,
  }
}

function buildProjectArchitectureTransformModel(args: {
  isActive: boolean
  project: ProjectWorkspace
  historyDiagnostics: ProjectHistoryDiagnosticsSnapshot
  workflowReadout: ProjectWorkflowReadoutSnapshot
}): ProjectArchitectureTransformModel {
  const signalSummary = buildProjectSignalSummary(args)

  return {
    headline: "Architecture transform",
    summary: `Проект ${args.project.title} показывает, что архитектурная линия уже влияет на рабочее место пользователя: project boundary, workflow readout и diagnostics читаются как части одного product-facing контейнера.`,
    visionLabel: "AI-трансформация здесь работает как vision-рамка изменения способа работы, а не как отдельная сущность проекта.",
    attractors: [
      {
        id: "code",
        title: "Код",
        description: "Важные сущности должны иметь явное место в коде, а не жить в скрытых локальных shape'ах.",
        projectSignal: signalSummary.code,
      },
      {
        id: "llm",
        title: "LLM",
        description: "Prompt/runtime контур должен читаться как отдельная архитектурная линия, а не как случайный побочный эффект старого flow.",
        projectSignal: signalSummary.llm,
      },
      {
        id: "budget",
        title: "Бюджет",
        description: "Нагрузка, объём artifacts и стоимость следующей волны должны быть наблюдаемыми, а не оставаться догадкой.",
        projectSignal: signalSummary.budget,
      },
      {
        id: "design",
        title: "Дизайн",
        description: "Design surface проекта должен быть проявлен как явный boundary через project settings, preview и UI kit.",
        projectSignal: signalSummary.design,
      },
    ],
    constraints: [
      "Сессия работы пока остаётся частью рабочего места и не вынесена в отдельный слой.",
      "Workbench не считается автоматически равным одному workflow-шагу.",
      "Новые сквозные сущности не добавляются ad hoc поверх текущей четвёрки.",
      "Архитектурная граница считается принятой только тогда, когда у неё есть явное место в коде и verification layer.",
    ],
    nextWaves: [
      {
        title: "Wave 2. Кодовое проявление сущностей",
        summary: "Выделить крупные сущности в изолированные модули и показать, где именно они живут в коде.",
      },
      {
        title: "Wave 3. Сквозные линии кода и LLM",
        summary: "Укрепить кодовый и LLM-контур как самостоятельные архитектурные линии поверх уже проявленного рабочего места.",
      },
      {
        title: "Wave 4. Cleanup и выравнивание",
        summary: "Убрать старые именования и обходные пути, которые спорят с новой архитектурной картой.",
      },
    ],
  }
}

export { buildProjectArchitectureTransformModel }
export type { ProjectArchitectureTransformModel }
