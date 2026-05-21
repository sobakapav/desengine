# Roadmap: OpenSpec Layer

## Владелец

`focus-workflow` владеет этим roadmap и поддерживает его для `dispatcher-openspec` и всех downstream changes OpenSpec-контура.

## Что направляет roadmap

- развитие product-oriented metadata-схемы;
- workflow команд `openspec:new`, `os:begin`, `os:dispatch`, `os:ctx`, `os:close`, `os:rename`;
- правила handoff, preflight, release-матрицы и каскада закрытия;
- traceability и человеко-понятный тестовый слой для behavior-change.

## Когда порождать downstream changes

- `producer-*`: когда нужен продюсерский слой для нового governance-механизма, модели артефактов или собственного roadmap;
- `dispatcher-*`: когда появляется отдельный долгоживущий тактический контур OpenSpec;
- `implement-*` или `fix-*`: когда правило уже определено и нужен код в tooling или проверках.

## Жёсткие инварианты

- roadmap принадлежит стратегическому change, а не dispatcher;
- dispatcher обязан ссылаться на roadmap стратегического владельца и не держать локальный `roadmaps/`;
- любой behavior-change в OpenSpec-контуре фиксирует capability/scenarios, уровень проверки, команду запуска и данные запуска или причину отсрочки;
- изменения workflow не считаются завершёнными без обновления traceability-слоя и документации команд.

## Ближайшие направления

- стабилизация roadmap-наследования между strategy changes и dispatcher;
- развитие схемы metadata без потери обратной совместимости;
- усиление preflight/close команд до уровня реального operational gate;
- улучшение связности между OpenSpec, GitHub issues и фактической реализацией.
