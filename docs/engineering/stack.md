# Технический стек

## Принятое направление

На старте desengine строится как локальное desktop-приложение с отдельным Figma plugin.

Базовый стек, принятый как направление:

- Electron Forge
- Webpack
- TypeScript
- React
- Tailwind CSS
- shadcn/ui
- lucide-icons
- Zustand
- Motion
- @xyflow/react
- elkjs
- Figma plugin
- shared protocol package
- `desengine://` для запуска и pairing
- local endpoint для передачи данных

Уже установлены Electron, React, Zustand, Motion, lucide-icons, `@xyflow/react`, `elkjs`, TypeScript, `zod`, Tailwind CSS, shadcn/ui CLI-зависимости, Playwright и базовые React typings.

Tailwind CSS подключён к существующему Webpack renderer через PostCSS. shadcn/ui используется как compatible source-layer: `components.json`, `cn` helper и локальные компоненты живут внутри `apps/desktop`, без смены Electron Forge/Webpack рамки.

## Desktop shell

Electron отвечает за desktop shell, локальное окно, доступ к OS API, локальное хранение, deep links и packaging.

Electron Forge используется как стартовая обвязка для разработки, сборки установщиков и будущей публикации артефактов.

Webpack + TypeScript выбран как более консервативный старт, чем Vite. Скорость dev-loop важна, но на этом этапе надёжность и предсказуемость важнее.

## UI

React отвечает за renderer-интерфейс.

Минимальный desktop renderer baseline показывает рабочий экран `desengine` и версию `@desengine/protocol`. Полная структура пользовательского workflow пока не строится.

Tailwind CSS используется как низкоуровневый styling layer.

shadcn/ui используется как набор копируемых компонентов на Radix UI + Tailwind CSS. Это не внешний тяжёлый UI kit, а исходный материал для собственных минималистичных компонентов.

lucide-icons используются для инструментальных действий и компактных controls.

Zustand используется для локального состояния player/workbench без тяжёлой state-management архитектуры.

Motion используется для playback, scrub, переходов, вариантов и временной шкалы.

## Схемы

@xyflow/react и elkjs остаются частью стека.

@xyflow/react рисует интерактивные схемы поведения.

elkjs считает автоматическую раскладку графа: позиции узлов, направление, связи, порты и layered layout.

D3.js пока не входит в базовый стек. Его стоит добавить только если появится задача кастомной визуализации данных или графики, которую неудобно выразить через React Flow, SVG/CSS и собственные canvas/DOM-слои.

## Figma plugin

Figma plugin отвечает за действие со стороны Figma: пользователь выбирает компонент или variant set и отправляет нужный snapshot в desktop-приложение.

Plugin и desktop-приложение должны говорить через общий typed protocol. Нельзя дублировать формат сообщений вручную в двух местах.

Текущий Figma plugin слой реализован как минимальный TypeScript dev handoff smoke. Он отправляет selection ping в desktop app на `127.0.0.1:37645`; полноценный snapshot, pairing и продуктовый workflow добавляются позже.

## Open questions

- первый workflow пользователя;
- локальная модель проекта;
- формат Figma snapshot;
- формат behavior model;
- pairing между plugin и desktop app;
- fallback, если desktop app не установлен или недоступен;
- release/signing/auto-update.
