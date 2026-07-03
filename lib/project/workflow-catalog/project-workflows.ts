import type { WorkflowDefinition } from "./types"

const uiKitMigrationWorkflow = {
  id: "ui-kit-migration",
  title: "Миграция проекта между UI kit",
  summary: "Готовит понятный проектный переход между UI kit или дизайн-системами без потери наблюдаемости.",
  operationFamily: "ui-kit-migration",
  subjectKinds: ["project", "design-system-migration"],
  inputRequirements: [
    {
      mode: "all-of",
      inputs: ["ui-kit-target"],
      summary: "Нужен целевой UI kit или дизайн-система.",
    },
    {
      mode: "optional",
      inputs: ["component-selection"],
      summary: "Можно ограничить migration выбранным набором компонентов, а можно мигрировать весь проект.",
    },
  ],
  producedArtifacts: ["migration-plan"],
  entrySurfaces: ["project-page", "project-settings"],
  followUpWorkflowIds: ["component-composition", "screen-composition"],
  stepDefinitions: [
    {
      id: "scope-migration",
      title: "Определить границы миграции",
      summary: "Понять, какие компоненты, экраны и стили входят в текущую волну перехода.",
      inputRequirements: [
        {
          mode: "all-of",
          inputs: ["ui-kit-target"],
          summary: "Целевой UI kit обязателен для старта migration.",
        },
        {
          mode: "optional",
          inputs: ["component-selection"],
          summary: "Выбор компонентов нужен только если migration ограничена частью проекта.",
        },
      ],
    },
    {
      id: "detect-risk-zones",
      title: "Выявить зоны риска",
      summary: "Зафиксировать несовместимости, точки ручной доработки и места возможного визуального дрейфа.",
      resultArtifacts: ["migration-plan"],
    },
    {
      id: "plan-replay",
      title: "Спланировать replay проектного слоя",
      summary: "Подготовить порядок пересборки компонентов и экранов после переключения UI kit.",
      requiredArtifacts: ["migration-plan"],
    },
  ],
} satisfies WorkflowDefinition

const projectWorkflows = [uiKitMigrationWorkflow] satisfies WorkflowDefinition[]

export { projectWorkflows }
