import type { WorkflowDefinition } from "./types"

const componentCreationWorkflow = {
  id: "component-from-image-or-figma",
  title: "Компонент из изображения или Figma JSON",
  summary: "Собирает базовый React-компонент из визуального источника и сразу готовит его к жизни внутри проекта.",
  operationFamily: "component-creation",
  subjectKinds: ["component"],
  inputRequirements: [
    {
      mode: "one-of",
      inputs: ["image", "figma-json"],
      summary: "Нужен хотя бы один визуальный источник: изображение или Figma JSON.",
    },
  ],
  producedArtifacts: ["react-component", "state-coverage-note"],
  entrySurfaces: ["project-page", "component-card"],
  followUpWorkflowIds: ["mock-data-and-loading-states", "component-composition"],
  stepDefinitions: [
    {
      id: "capture-source",
      title: "Зафиксировать визуальный источник",
      summary: "Понять, что именно считается каноническим входом: картинка, Figma JSON или оба входа вместе.",
      inputRequirements: [
        {
          mode: "one-of",
          inputs: ["image", "figma-json"],
          summary: "Для старта нужен хотя бы один из визуальных входов.",
        },
      ],
    },
    {
      id: "extract-structure",
      title: "Выделить структуру компонента",
      summary: "Разложить визуальный источник на блоки, слоты и ожидаемые состояния.",
      resultArtifacts: ["state-coverage-note"],
    },
    {
      id: "build-component",
      title: "Собрать React-компонент",
      summary: "Подготовить базовую реализацию на текущем UI kit проекта.",
      resultArtifacts: ["react-component"],
    },
  ],
} satisfies WorkflowDefinition

const componentCompositionWorkflow = {
  id: "component-composition",
  title: "Сборка сложного компонента из простых",
  summary: "Собирает compound React-компонент из существующих проектных компонентов и определяет точки композиции.",
  operationFamily: "component-composition",
  subjectKinds: ["component-set", "component"],
  inputRequirements: [
    {
      mode: "all-of",
      inputs: ["component-selection"],
      summary: "Нужен явный набор компонентов, из которых строится сложный компонент.",
    },
  ],
  producedArtifacts: ["component-composition-plan", "react-component"],
  entrySurfaces: ["project-page", "component-set-panel"],
  followUpWorkflowIds: ["mock-data-and-loading-states", "screen-composition"],
  stepDefinitions: [
    {
      id: "select-building-blocks",
      title: "Выбрать строительные блоки",
      summary: "Определить, какие существующие компоненты войдут в состав нового сложного компонента.",
      inputRequirements: [
        {
          mode: "all-of",
          inputs: ["component-selection"],
          summary: "Выбор компонентов обязателен для композиции.",
        },
      ],
    },
    {
      id: "define-composition",
      title: "Определить композицию",
      summary: "Выявить слоты, контейнеры, повторяющиеся участки и точки параметризации.",
      resultArtifacts: ["component-composition-plan"],
    },
    {
      id: "materialize-compound-component",
      title: "Материализовать compound-компонент",
      summary: "Собрать новый компонент так, чтобы он переиспользовал существующие части, а не копировал их.",
      requiredArtifacts: ["component-composition-plan"],
      resultArtifacts: ["react-component"],
    },
  ],
} satisfies WorkflowDefinition

const componentWorkflows = [
  componentCreationWorkflow,
  componentCompositionWorkflow,
] satisfies WorkflowDefinition[]

export { componentWorkflows }
