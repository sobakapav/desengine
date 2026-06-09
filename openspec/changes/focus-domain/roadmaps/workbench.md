# Roadmap: Workbench

## Владелец

`focus-domain` владеет roadmap сущности Workbench и поддерживает его для `producer-workbench` и `dispatcher-workbench`.

## Что задаёт roadmap

- рамку для сущности верстака как first-class части продукта;
- закрепление Workbench как главной рабочей поверхности продукта;
- связь Workbench с task и workflow доменом;
- включение tool families вроде layout/space и image-inspector внутрь одной общей workbench-линии;
- последовательность между исследованием контракта, UX-поведения и runtime-реализацией.

## Downstream-правила

- сначала уточняется общий контракт Workbench и жизненный цикл его состояния;
- затем отдельные changes могут менять workflow, layout, image tools и navigation только как частные случаи Workbench;
- любые изменения верстака обязаны фиксировать capability/scenarios и тестовый уровень.
