## Why

Сейчас product-shell интерфейс собирается из нескольких визуальных языков одновременно:

- navigation живёт по одному контракту;
- project/workflow/workbench surfaces читаются по другому;
- help/system/tasks/levels страницы используют собственные page/card treatments;
- общая архитектурная волна уже вывела в продукт путь `проект -> workflow -> работа`, но визуально этот путь ещё не ощущается как одна система.

Из-за этого даже правильно реализованные пользовательские слои выглядят как набор соседних экранов, а не как единый продукт. Для релизной подготовки нужен не локальный cosmetic-polish, а общий visual contract, который быстро делает архитектурную волну читаемой для пользователя.

Референс задаёт понятное направление: paper-like фон, монохромный контраст, тонкие рамки, крупная serif-типографика, воздушный ритм, outlined tabs/surfaces и инвертированный active-state.

## What Changes

- Зафиксировать единый editorial visual language для product-shell интерфейса.
- Ввести канонический набор shell-паттернов:
  - page frame;
  - section frame;
  - eyebrow/meta label;
  - display title;
  - outlined tab/button rows;
  - inset/callout block;
  - primary action с инверсией active-state.
- Перевести на этот контракт ключевые product-shell поверхности:
  - `Navigation`;
  - project pages;
  - workflow/workbench chrome;
  - help/system/tasks/levels экраны.
- Явно ограничить scope:
  - входит product-shell слой в `app/**` и `components/desengine/**`;
  - не входит пользовательский preview, iframe runtime, генерируемые файлы и учебный контент, если он не является частью product-shell оболочки.

## Capabilities

### Modified Capabilities
- `ui-foundation`: product-shell интерфейс получает единый editorial visual contract вместо смешанных локальных паттернов.
- `navigation`: глобальная навигация переходит от компактного чёрного бара к editorial navigation surface с outlined items и inversion-based active-state.

## Impact

- Пользователь начнёт читать project/workflow/workbench путь как один продуктовый маршрут, а не как склейку внутренних экранов.
- Команда получит явные visual primitives для дальнейших user-facing waves вместо ad-hoc page-level стилизации.
- Понадобится browser/component evidence, потому что change меняет наблюдаемый shell-контракт, а не только структуру кода.
