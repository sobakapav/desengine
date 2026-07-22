# Design

## Goals

- Сделать локально проверяемую основу проекта.
- Оставить SSH-friendly dev-loop без обязательного Electron package на локальной машине.
- Зафиксировать desktop app, Figma plugin и shared protocol как отдельные части системы.
- Подготовить CI для проверки чистой установки.

## Non-goals

- Не проектировать полноценную semantic model и production workflow шире текущего visual exploded frame MVP.
- Не делать release signing, notarization и auto-update.
- Не публиковать Figma plugin.
- Не менять выбранный Electron Forge + Webpack стек.
- Не добавлять D3.js без конкретной визуализационной задачи.

## Decisions

Electron desktop app является основным shell. Renderer должен быть React-приложением.

Минимальный renderer baseline не вводит полноценную структуру продукта. Он нужен только для проверки, что desktop app уже рендерит React UI, использует shared protocol package и готов к подключению первого workflow.

Tailwind CSS и shadcn/ui-compatible компоненты подключаются поверх существующего Electron Forge + Webpack стека. Смена сборщика не входит в scope.

Figma plugin должен отправлять JSON snapshot выбранного компонента или variant set в desktop app. Figma остаётся источником истины.

Первый пользовательский workflow выбран как визуальная взрыв-схема auto-layout Frame. TypeScript plugin читает первый выбранный auto-layout Frame, рекурсивно раскрывает вложенные auto-layout Frame до глубины 4, останавливается на instance, не-auto-layout frame или не-frame node, экспортирует до 100 PNG leaf-элементов и отправляет exploded frame snapshot в desktop app. Это всё ещё visual snapshot, а не полноценная semantic model.

`desengine://` используется для запуска приложения и pairing, а не как канал для больших payload.

Local endpoint принимает данные только на loopback и только после pairing. Все payload проходят schema validation.

Shared protocol сейчас содержит версию, минимальный status/error-контракт, dev selection ping, visual snapshot для PNG preview и exploded frame snapshot для первого visual workflow. Semantic snapshot-схемы, source binding и обратные запросы Figma plugin -> desengine добавляются позже, чтобы plugin и desktop не дублировали формат вручную.

Схемы поведения остаются secondary mode. Primary mode - player поведения компонента.

## Risks

- Локальный Electron package на SSH-машине может зависеть от сети и кэша Electron runtime.
- Figma Desktop MCP и Figma plugin local endpoint могут иметь разные ограничения по окружению.
- После первого visual workflow легко преждевременно построить лишнюю semantic model; следующий slice должен оставаться узким и проверяемым.
- Playwright Electron automation остаётся отдельным smoke-слоем и может требовать packaged executable или специального тестового режима запуска.
- Dev token в Figma handoff нужен только для smoke. Production pairing должен быть отдельным решением.

## Open Questions

- Как связать Figma node и desengine object через source binding?
- Как Figma plugin должен запрашивать у desengine JSON-данные для генерации вариантов?
- Какие данные входят в минимальный semantic Figma snapshot?
- Где хранится локальный проект desengine?
- Как выглядит pairing между plugin и desktop app?
- Какие smoke-проверки нужны до первого release?
