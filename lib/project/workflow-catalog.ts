type WorkflowSubjectKind =
  | "project"
  | "component"
  | "component-set"
  | "screen"
  | "screen-set"
  | "data-set"
  | "domain-model"
  | "storybook-layer"
  | "prototype"
  | "reference-pack"
  | "design-system-migration"

type WorkflowOperationFamily =
  | "component-creation"
  | "component-composition"
  | "screen-composition"
  | "ui-kit-migration"
  | "data-generation"

type WorkflowEntrySurface =
  | "project-page"
  | "component-card"
  | "component-set-panel"
  | "screen-map"
  | "data-layer"
  | "project-settings"

type WorkflowInputKind =
  | "image"
  | "figma-json"
  | "component-selection"
  | "screen-structure"
  | "ui-kit-target"
  | "domain-schema"
  | "mock-data-constraints"
  | "loading-state-profile"

type WorkflowArtifactKind =
  | "react-component"
  | "component-composition-plan"
  | "screen-layout"
  | "migration-plan"
  | "mock-data-set"
  | "loading-state-demo"
  | "state-coverage-note"

type WorkflowInputRequirementMode = "all-of" | "one-of" | "optional"

type WorkflowInputRequirement = {
  mode: WorkflowInputRequirementMode
  inputs: WorkflowInputKind[]
  summary: string
}

type WorkflowDefinitionStep = {
  id: string
  title: string
  summary: string
  inputRequirements?: WorkflowInputRequirement[]
  requiredArtifacts?: WorkflowArtifactKind[]
  resultArtifacts?: WorkflowArtifactKind[]
}

type WorkflowDefinition = {
  id: string
  title: string
  summary: string
  operationFamily: WorkflowOperationFamily
  subjectKinds: WorkflowSubjectKind[]
  inputRequirements: WorkflowInputRequirement[]
  producedArtifacts: WorkflowArtifactKind[]
  entrySurfaces: WorkflowEntrySurface[]
  followUpWorkflowIds: string[]
  stepDefinitions: WorkflowDefinitionStep[]
}

const workflowCatalogSeed = [
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
] satisfies WorkflowDefinition[]

/**
 * @example
 * ```ts
 * const definitions = listWorkflowCatalogSeed()
 * ```
 */
function listWorkflowCatalogSeed() {
  return workflowCatalogSeed
}

/**
 * @example
 * ```ts
 * const definition = getWorkflowDefinition("screen-composition")
 * ```
 */
function getWorkflowDefinition(definitionId: string) {
  return workflowCatalogSeed.find((definition) => definition.id === definitionId) ?? null
}

/**
 * @example
 * ```ts
 * const componentFlows = listWorkflowDefinitionsForSubjectKind("component")
 * ```
 */
function listWorkflowDefinitionsForSubjectKind(subjectKind: WorkflowSubjectKind) {
  return workflowCatalogSeed.filter((definition) => definition.subjectKinds.includes(subjectKind))
}

export {
  getWorkflowDefinition,
  listWorkflowCatalogSeed,
  listWorkflowDefinitionsForSubjectKind,
}

export type {
  WorkflowArtifactKind,
  WorkflowDefinition,
  WorkflowDefinitionStep,
  WorkflowEntrySurface,
  WorkflowInputRequirement,
  WorkflowInputRequirementMode,
  WorkflowInputKind,
  WorkflowOperationFamily,
  WorkflowSubjectKind,
}
