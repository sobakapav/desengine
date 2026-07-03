import type { WorkflowDefinition } from "./types"

const mockDataAndLoadingStatesWorkflow = {
  id: "mock-data-and-loading-states",
  title: "Mock-данные и состояния постепенной загрузки",
  summary: "Готовит данные, задержки и граничные состояния, чтобы дизайн проверялся на живом поведении, а не на пустых заглушках.",
  operationFamily: "data-generation",
  subjectKinds: ["component", "screen", "data-set"],
  inputRequirements: [
    {
      mode: "all-of",
      inputs: ["domain-schema", "mock-data-constraints"],
      summary: "Нужна предметная схема и ограничения для mock-данных.",
    },
    {
      mode: "optional",
      inputs: ["loading-state-profile"],
      summary: "Профиль задержек и прогрузки может быть добавлен поверх базовой data-волны.",
    },
  ],
  producedArtifacts: ["mock-data-set", "loading-state-demo", "state-coverage-note"],
  entrySurfaces: ["project-page", "component-card", "data-layer"],
  followUpWorkflowIds: ["screen-composition"],
  stepDefinitions: [
    {
      id: "define-data-boundaries",
      title: "Определить границы данных",
      summary: "Понять, какие сущности, крайние значения и ошибки нужны для честной проработки интерфейса.",
      inputRequirements: [
        {
          mode: "all-of",
          inputs: ["domain-schema", "mock-data-constraints"],
          summary: "Для честной генерации нужен предметный каркас и ограничения данных.",
        },
      ],
    },
    {
      id: "generate-mocks",
      title: "Сгенерировать набор mock-данных",
      summary: "Подготовить рабочий набор реалистичных и граничных данных для компонента или экрана.",
      resultArtifacts: ["mock-data-set"],
    },
    {
      id: "simulate-loading",
      title: "Смоделировать прогрузку и задержки",
      summary: "Добавить загрузочные и переходные состояния, чтобы увидеть поведение интерфейса во времени.",
      inputRequirements: [
        {
          mode: "optional",
          inputs: ["loading-state-profile"],
          summary: "Профиль загрузки может быть задан явно или использоваться из проектного пресета.",
        },
      ],
      requiredArtifacts: ["mock-data-set"],
      resultArtifacts: ["loading-state-demo", "state-coverage-note"],
    },
  ],
} satisfies WorkflowDefinition

const dataWorkflows = [mockDataAndLoadingStatesWorkflow] satisfies WorkflowDefinition[]

export { dataWorkflows }
