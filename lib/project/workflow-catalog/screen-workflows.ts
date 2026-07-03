import type { WorkflowDefinition } from "./types"

const screenCompositionWorkflow = {
  id: "screen-composition",
  title: "Композиционная проработка экрана",
  summary: "Собирает экран из проектных компонентов, сценариев и структуры данных, а не изолированно от остальной системы.",
  operationFamily: "screen-composition",
  subjectKinds: ["screen", "screen-set"],
  inputRequirements: [
    {
      mode: "all-of",
      inputs: ["screen-structure", "component-selection"],
      summary: "Для композиции экрана нужны структура экрана и проектные компоненты.",
    },
    {
      mode: "optional",
      inputs: ["domain-schema"],
      summary: "Доменная схема усиливает экранную композицию, но не всегда обязательна на первом проходе.",
    },
  ],
  producedArtifacts: ["screen-layout", "state-coverage-note"],
  entrySurfaces: ["project-page", "screen-map"],
  followUpWorkflowIds: ["mock-data-and-loading-states"],
  stepDefinitions: [
    {
      id: "define-screen-role",
      title: "Определить роль экрана",
      summary: "Понять место экрана в пользовательском сценарии и его связь с соседними интерфейсами.",
      inputRequirements: [
        {
          mode: "all-of",
          inputs: ["screen-structure"],
          summary: "Экран должен иметь хотя бы базовое структурное описание.",
        },
      ],
    },
    {
      id: "compose-screen",
      title: "Собрать композицию экрана",
      summary: "Разложить экран на зоны, компоненты, данные и переходы между состояниями.",
      inputRequirements: [
        {
          mode: "all-of",
          inputs: ["component-selection"],
          summary: "Нужен набор компонентов для композиции экрана.",
        },
        {
          mode: "optional",
          inputs: ["domain-schema"],
          summary: "Доменная схема помогает точнее связать экран с данными.",
        },
      ],
      resultArtifacts: ["screen-layout"],
    },
    {
      id: "cover-states",
      title: "Покрыть состояния экрана",
      summary: "Зафиксировать пустые, граничные, загрузочные и насыщенные состояния экрана.",
      requiredArtifacts: ["screen-layout"],
      resultArtifacts: ["state-coverage-note"],
    },
  ],
} satisfies WorkflowDefinition

const screenWorkflows = [screenCompositionWorkflow] satisfies WorkflowDefinition[]

export { screenWorkflows }
