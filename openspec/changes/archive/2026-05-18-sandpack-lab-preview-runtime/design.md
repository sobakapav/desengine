## Context

Сейчас лабораторный предпросмотр загружает `/api/tasks/:taskId/module`, получает строку JavaScript и исполняет её в браузере через `new Function`. Этот endpoint транспилирует пользовательские файлы и подменяет импорты `@/components/ui/*` на простые HTML-заглушки. Такой подход даёт быстрый preview, но ломает смысл UI-библиотеки: `Badge`, `Button`, `Select` и другие компоненты не исполняют собственные variant/helper-функции, а Tailwind-классы из настоящих компонентов не участвуют в результате.

Требуемая миграция узкая: заменить только runtime предпросмотра результата. Workbench, Monaco, сохранение файлов, prompt-flow, история и проверка уровня остаются текущими.

## Goals / Non-Goals

**Goals:**

- Рендерить пользовательский `Component.tsx` через Sandpack с настоящим React/TypeScript bundling.
- Подкладывать в Sandpack виртуальные файлы текущей задачи: `Component.tsx`, `styles.ts`, `mock.ts`, `props.ts`.
- Подкладывать в Sandpack реальные локальные зависимости, необходимые для `@/components/ui/badge` и соседних UI-компонентов.
- Подключить Tailwind CSS внутри preview, чтобы классы из пользовательского `className` и из `class-variance-authority` применялись визуально.
- Сохранить управляемое состояние загрузки и ошибки preview внутри `OutRender`.
- Покрыть дефект `mp-inspector-divider-vks`: `variant="ghost"` у `Badge` должен проходить через настоящий `badgeVariants`.

**Non-Goals:**

- Не переносить Monaco Editor в Sandpack.
- Не менять API сохранения файлов, prompt-flow, check-flow и структуру user/onboarding данных.
- Не запускать полноценный Vite/Next dev-server внутри браузера на первом этапе.
- Не менять Node.js, Next.js, Turbopack или install-critical инфраструктуру.
- Не поддерживать произвольный импорт всего репозитория в Sandpack; сначала подключается минимальный набор UI/runtime-файлов, нужный лабораторным задачам.

## Decisions

1. Использовать `@codesandbox/sandpack-react` как первый промышленный preview-runtime.
   - Причина: Sandpack даёт embedded React-песочницу, bundling, npm dependencies, виртуальные файлы и preview iframe без запуска отдельного dev-server.
   - Альтернатива: StackBlitz WebContainers. Они мощнее, но требуют браузерный Node-runtime, Service Worker/storage-условия и тяжелее для локальной лаборатории.
   - Альтернатива: `react-live`/`react-runner`. Они легче, но потребуют вручную поддерживать import-map/scope для UI-библиотеки и вернут нас к самодельному runtime.

2. Sandpack заменяет только result-preview.
   - `CodeList`, Monaco, dirty-state, autosave, явное сохранение и prompt composer остаются в текущем React workbench.
   - Причина: минимальный blast radius и понятная проверка дефекта.

3. Создать отдельный адаптер подготовки Sandpack-файлов.
   - Адаптер принимает `contentByFileId` задачи и возвращает объект виртуальных файлов.
   - Виртуальный `/App.tsx` импортирует пользовательский компонент и mock props, затем рендерит `<Component {...mockProps} />`.
   - Пользовательские файлы в редакторе сохраняют привычные импорты `@/...`; адаптер переписывает их на относительные пути только внутри виртуального Sandpack-проекта.
   - Причина: `OutRender` остаётся UI-компонентом, правила состава preview-проекта можно тестировать unit/contract тестом, а Sandpack client bundler не зависит от Vite alias.

4. Tailwind CSS подключается как часть виртуального Sandpack-проекта.
   - В preview добавляется готовый `styles.css` с базовыми CSS tokens и utility-правилами, нужными для текущих UI-компонентов.
   - Входной `index.tsx` импортирует этот CSS.
   - Причина: стили должны применяться внутри iframe Sandpack, а не зависеть от CSS внешнего приложения. Попытка компилировать Tailwind v4 в route потребовала бы менять install-critical сборочный слой, поэтому первый шаг использует проверяемый CSS-срез для preview.

5. Настоящие UI-компоненты подключаются постепенно, начиная с `Badge`.
   - Для первого шага достаточно `components/ui/badge.tsx`, `lib/system/utils.ts` и npm-зависимостей `class-variance-authority`, `clsx`, `tailwind-merge`, `@radix-ui/react-slot`.
   - Общий адаптер должен позволять добавлять другие `components/ui/**` без возврата к HTML-заглушкам.

## Risks / Trade-offs

- [Risk] Tailwind v4 внутри Sandpack может потребовать дополнительный runtime/bundler plugin и не заработать через простой CSS import. → Mitigation: сначала проверить smoke на `Badge variant`; если Sandpack client template не собирает Tailwind напрямую, fallback — генерировать CSS через уже установленный Tailwind в основном приложении или добавить минимальный preview CSS для токенов/utility-классов, зафиксировав ограничение в задачах.
- [Risk] Не все `@/components/ui/*` сразу будут доступны в Sandpack. → Mitigation: начать с реально используемых лабораторных компонентов и сделать явный тест/ошибку для неподдержанного импорта, вместо молчаливой HTML-заглушки.
- [Risk] Sandpack увеличит bundle лаборатории. → Mitigation: лениво грузить Sandpack только в `OutRender` и не переносить туда редактор.
- [Risk] Preview iframe может иметь визуальные отличия из-за отсутствующих CSS variables. → Mitigation: добавить в preview CSS базовые `:root` tokens из `app/globals.css` и проверять дефект через DOM-классы и визуальный smoke.

## Migration Plan

1. Добавить зависимость `@codesandbox/sandpack-react`.
2. Реализовать адаптер Sandpack-файлов и unit/contract тест на состав проекта.
3. Переключить `OutRender` на `SandpackProvider` + `SandpackPreview`, сохранив текущие состояния загрузки/ошибки насколько позволяет API.
4. Проверить `mp-inspector-divider-vks` локально: `Badge variant="ghost"` получает классы настоящего `Badge`.
5. После успешной проверки удалить или оставить неиспользуемый `/api/tasks/:taskId/module` только если он больше не нужен другим сценариям.
