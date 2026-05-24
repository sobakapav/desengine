# Roadmap: Workbench

## Владелец

`focus-features` владеет roadmap сущности Workbench и поддерживает его для `dispatcher-workbench`.

## Что задаёт roadmap

- рамку для сущности верстака как first-class части продукта;
- связь Workbench с task и workflow доменом;
- последовательность между исследованием контракта, UX-поведения и runtime-реализацией.

## Downstream-правила

- сначала уточняется общий контракт Workbench и жизненный цикл его состояния;
- затем отдельные changes могут менять workflow, layout, tools и navigation только как частные случаи Workbench;
- любые изменения верстака обязаны фиксировать capability/scenarios и тестовый уровень.
