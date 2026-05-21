# Roadmap: Architecture Transformation

## Владелец

`focus-tech` владеет этим roadmap и использует его для `producer-architecture-transformation` и связанных dispatcher changes технической линии.

## Что считается целью

- уменьшать архитектурный риск перед новыми feature-wave changes;
- выстраивать порядок foundation, active и cleanup steps;
- защищать текущий lab UX от преждевременных platform changes.

## Какие изменения должен порождать roadmap

- `producer-*` для решений по sourcing, event boundaries и архитектурным prerequisites с собственным roadmap;
- `dispatcher-*` для крупных тактических контуров, где нужен отдельный operational backlog;
- `implement-*` и `fix-*` только после явного readiness decision.

## Критерии допуска downstream implementation

- зависимость описана как prerequisite, а не как «сделаем по пути»;
- есть понятный test level и команда запуска;
- change не меняет install-critical стек без отдельного разрешения;
- roadmap объясняет, почему выбранный порядок снижает риск, а не просто перечисляет темы.
