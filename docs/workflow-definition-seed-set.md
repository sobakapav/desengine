# Workflow Definition Seed Set

Этот файл фиксирует первый минимальный набор `WorkflowDefinition`, который стоит положить в foundation продукта до более широкой реализации workflow catalog.

## Зачем именно этот набор

Он покрывает пять разных семейств работы:

1. создание компонента;
2. сборка сложного компонента;
3. композиция экрана;
4. migration между UI kit;
5. данные, mock-состояния и постепенная загрузка.

То есть это уже не “пять вариаций одного и того же component flow”, а сжатый срез разных осей продукта.

## Набор definitions

### 1. `component-from-image-or-figma`

- Operation family: `component-creation`
- Subject kinds: `component`
- Entry surfaces:
  - `project-page`
  - `component-card`
- Inputs:
  - `image` или `figma-json`
- Outputs:
  - `react-component`
  - `state-coverage-note`

### 2. `component-composition`

- Operation family: `component-composition`
- Subject kinds:
  - `component`
  - `component-set`
- Entry surfaces:
  - `project-page`
  - `component-set-panel`
- Inputs:
  - `component-selection`
- Outputs:
  - `component-composition-plan`
  - `react-component`

### 3. `screen-composition`

- Operation family: `screen-composition`
- Subject kinds:
  - `screen`
  - `screen-set`
- Entry surfaces:
  - `project-page`
  - `screen-map`
- Inputs:
  - `screen-structure`
  - `component-selection`
  - `domain-schema`
- Outputs:
  - `screen-layout`
  - `state-coverage-note`

### 4. `ui-kit-migration`

- Operation family: `ui-kit-migration`
- Subject kinds:
  - `project`
  - `design-system-migration`
- Entry surfaces:
  - `project-page`
  - `project-settings`
- Inputs:
  - обязательный `ui-kit-target`
  - опциональный `component-selection`
- Outputs:
  - `migration-plan`

### 5. `mock-data-and-loading-states`

- Operation family: `data-generation`
- Subject kinds:
  - `component`
  - `screen`
  - `data-set`
- Entry surfaces:
  - `project-page`
  - `component-card`
  - `data-layer`
- Inputs:
  - обязательные `domain-schema` и `mock-data-constraints`
  - опциональный `loading-state-profile`
- Outputs:
  - `mock-data-set`
  - `loading-state-demo`
  - `state-coverage-note`

## Почему это хороший первый срез

- Он уже выводит workflow за пределы одного `component workflow`.
- Он вводит экранный слой.
- Он вводит data/domain слой.
- Он вводит системную migration-операцию.
- Он показывает, что один и тот же каталог должен поддерживать разные `subjectKinds` и `entrySurfaces`.

## Что это значит для следующей реализации

Следующая foundation-волна уже может не гадать, “какие workflow вообще нужны”, а опираться на этот seed set:

- хранить definitions в registry;
- выбирать definition по surface и subject;
- строить project-facing launch UI;
- постепенно мигрировать текущий `project-design-workflow` в один из vertical slices, а не считать его вечной глобальной схемой.

## Что уже пришлось усилить в модели

Даже этот первый seed set показал, что workflow не может жить только со списком обязательных inputs.

Поэтому в foundation-контракте уже нужна семантика:

- `all-of`;
- `one-of`;
- `optional`.

Иначе каталог сразу ломается на кейсах вроде:

- `image` или `figma-json` как альтернативные входы;
- project-wide migration без `component-selection`;
- data workflow, где loading profile может подключаться позже, а не быть обязательным всегда.
