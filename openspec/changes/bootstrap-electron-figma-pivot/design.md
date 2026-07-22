# Design

## Goals

- Сделать локально проверяемую основу проекта.
- Оставить SSH-friendly dev-loop без обязательного Electron package на локальной машине.
- Зафиксировать desktop app, Figma plugin и shared protocol как отдельные части системы.
- Подготовить CI для проверки чистой установки.

## Non-goals

- Не проектировать полный пользовательский workflow до отдельного обсуждения.
- Не делать release signing, notarization и auto-update.
- Не публиковать Figma plugin.
- Не менять выбранный Electron Forge + Webpack стек.
- Не добавлять D3.js без конкретной визуализационной задачи.

## Decisions

Electron desktop app является основным shell. Renderer должен быть React-приложением.

Минимальный renderer baseline не вводит полноценную структуру продукта. Он нужен только для проверки, что desktop app уже рендерит React UI, использует shared protocol package и готов к подключению первого workflow.

Tailwind CSS и shadcn/ui-compatible компоненты подключаются поверх существующего Electron Forge + Webpack стека. Смена сборщика не входит в scope.

Figma plugin должен отправлять JSON snapshot выбранного компонента или variant set в desktop app. Figma остаётся источником истины.

До утверждения первого workflow Figma plugin не строится даже как рабочая заготовка. Manifest, сборка plugin и payload shape добавляются отдельным шагом, когда будет понятен первый пользовательский сценарий.

`desengine://` используется для запуска приложения и pairing, а не как канал для больших payload.

Local endpoint принимает данные только на loopback и только после pairing. Все payload проходят schema validation.

Shared protocol сейчас содержит только версию и минимальный status/error-контракт. Snapshot-схемы добавляются позже, до реализации payload transfer, чтобы plugin и desktop не дублировали формат вручную.

Схемы поведения остаются secondary mode. Primary mode - player поведения компонента.

## Risks

- Локальный Electron package на SSH-машине может зависеть от сети и кэша Electron runtime.
- Figma Desktop MCP и Figma plugin local endpoint могут иметь разные ограничения по окружению.
- До проектирования первого workflow легко преждевременно построить лишнюю структуру приложения.
- Playwright Electron automation остаётся отдельным smoke-слоем и может требовать packaged executable или специального тестового режима запуска.

## Open Questions

- Как выглядит первый пользовательский workflow?
- Какие данные входят в минимальный Figma snapshot?
- Где хранится локальный проект desengine?
- Как выглядит pairing между plugin и desktop app?
- Какие smoke-проверки нужны до первого release?
