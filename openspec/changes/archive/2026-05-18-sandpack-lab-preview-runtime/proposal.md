## Why

Текущий предпросмотр лаборатории исполняет пользовательский `Component.tsx` через самодельный CommonJS-runtime и HTML-заглушки для `@/components/ui/*`. Из-за этого параметры настоящих UI-компонентов, например `variant="ghost"` у `Badge`, сохраняются в коде, но не превращаются в реальные классы и визуально ничего не меняют.

## What Changes

- Runtime предпросмотра лаборатории заменяется на встроенную React-песочницу Sandpack для рендера пользовательского компонента.
- Предпросмотр получает настоящий набор файлов UI-компонентов, которые импортирует пользовательский код, вместо HTML-заглушек.
- Tailwind CSS и базовые глобальные стили подключаются внутри preview-песочницы, чтобы классы из `className` и `class-variance-authority` работали в рендере.
- Редактор Monaco, сохранение файлов, промпты, история, проверка уровня и текущий workbench-flow остаются без полной миграции.
- Старый endpoint/runtime предпросмотра удаляется или перестаёт использоваться после успешной замены.
- Добавляется проверка на сценарий `mp-inspector-divider-vks`: `<Badge variant="ghost">` должен рендериться как настоящий `Badge`, а не как простой `span`.

## Capabilities

### New Capabilities

- Нет.

### Modified Capabilities

- `level-labs`: лаборатория должна рендерить результат через preview runtime, который исполняет настоящие UI-компоненты и применяет Tailwind CSS.
- `ui-foundation`: рискованный пользовательский render-островок лаборатории должен оставаться изолированным и показывать управляемую ошибку при сбое runtime.

## Impact

- Затронуты компоненты предпросмотра лаборатории `components/desengine/lab/InOut/OutRender/**`.
- Затронут или удаляется API-слой `app/api/tasks/[taskId]/module/route.ts`, который сейчас генерирует самодельный runtime.
- Добавляется зависимость `@codesandbox/sandpack-react`; install-critical стек `Node.js`, `Next.js`, `Turbopack` и сборщик проекта не меняются.
- Может потребоваться слой подготовки виртуальных Sandpack-файлов для `Component.tsx`, `styles.ts`, `mock.ts`, `props.ts`, `components/ui/**`, `lib/system/utils.ts` и CSS.
- Обновляется общий слой тестирования: unit/contract для сборки preview-файлов и browser/e2e smoke для настоящего рендера `Badge variant`.
