# Roadmap: UI Kit

## Владелец

`focus-features` владеет этим roadmap и предоставляет его `dispatcher-ui-kit` и `dispatcher-image-inspector`.

## Основные линии

- выбор и интеграция UI kit / component sourcing решений;
- согласованность визуального и runtime-контракта workbench-экрана;
- поддержка downstream feature changes, которые зависят от устойчивого UI foundation.

## Когда порождать child change

- `producer-*`: если нужен сравнительный анализ kit, sourcing или interaction model вместе с собственным roadmap ожиданий;
- `dispatcher-*`: если формируется отдельная подлиния работы, например inspector или workbench area;
- `implement-*`: если решение уже выбрано и нужен конкретный код.

## Инварианты

- roadmap не подменяет архитектурные prerequisites;
- компонентный выбор должен иметь тестовый след и критерии совместимости;
- UI вопросы, влияющие на runtime behavior, не остаются на уровне визуальной заметки.
