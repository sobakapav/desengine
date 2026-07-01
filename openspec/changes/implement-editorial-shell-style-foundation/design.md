## Context

Архитектурная релизная волна уже вывела в пользовательский мир:

- самостоятельный раздел проектов;
- project-aware workflow/readout surfaces;
- workbench как отдельную рабочую поверхность;
- project-aware config и navigation.

Но visual layer остался фрагментированным. Пользователь по-прежнему перескакивает между разными page rhythms, разной плотностью элементов и разными трактовками active-state. Это ослабляет сам смысл архитектурной волны: путь появился, но не ощущается как цельный.

## Goals

- Сделать product-shell визуально цельным на уровне общих паттернов, а не отдельных page-level fixes.
- Внедрить editorial language по референсу: светлый paper background, тонкие тёмные границы, крупные serif-заголовки, uppercase eyebrow labels, спокойные отступы и чёрно-белую инверсию для активных элементов.
- Оставить user preview и контент внутри рабочей области независимыми от shell-стиля.
- Подготовить change к поэтапному внедрению: сначала primitives, затем ключевые surfaces, затем оставшийся shell.

## Non-Goals

- Не создавать новый UI kit для пользовательского preview.
- Не переопределять стили внутри Sandpack iframe, пользовательских компонентов и генерируемых файлов.
- Не превращать change в общий rebrand публичного маркетингового контура, если он не живёт внутри product-shell.
- Не менять install-critical стек.

## Visual Contract

- Палитра:
  - светлый paper-like фон и почти чёрный текст/границы;
  - цвет используется экономно, базовый контракт остаётся монохромным;
  - active-state строится на инверсии `тёмная заливка + светлый текст`, а не на случайных accent-кнопках.
- Типографика:
  - display/headline-уровень использует выразительную serif-гарнитуру;
  - eyebrow/meta labels используют uppercase + tracking;
  - body/caption остаются спокойными и читабельными.
- Геометрия:
  - поверхности строятся на тонкой рамке, крупном внутреннем воздухе и прямоугольной карточной сетке;
  - dashed inset допускается как secondary emphasis для поясняющих или review-блоков.
- Навигация и выбор:
  - top-level navigation, step rows и tab-like выборы используют единый outlined treatment;
  - только один активный элемент на уровне группы получает инверсию.

## Rollout Strategy

1. Зафиксировать primitives и общий contract в `ui-foundation` и `navigation`.
2. Перевести базовую оболочку:
   - page frame;
   - navigation;
   - section/card/callout/button primitives.
3. Перевести surfaces, критичные для архитектурного релиза:
   - `/projects`;
   - `/projects/[projectId]`;
   - workflow/workbench chrome;
   - task-facing shell around work area.
4. Довести оставшиеся product-shell страницы (`/help`, `/system`, `/tasks`, `/levels`) до того же контракта.

## Review Rules

- Нельзя чинить отдельные экраны разрозненными заплатками вида “только здесь другая кнопка/рамка/заголовок”, если тот же паттерн уже существует в shell.
- Если паттерн переиспользуется хотя бы на двух surfaces, он должен жить как общий shell primitive.
- Если изменение заходит в user preview или учебный контент, исполнитель должен отдельно доказать, почему это всё ещё product-shell, а не вторжение в пользовательскую рабочую область.

## Verification Strategy

- `static/contract`: проверить согласованность OpenSpec delta и release lineage.
- `unit`: допустим для style helpers/primitives, если они выделяются как отдельный API.
- `component/browser`: обязателен для `Navigation` и хотя бы одного project/workflow surface, потому что change наблюдаемый и визуальный.
- `e2e smoke`: нужен, если rollout затрагивает ключевой маршрут `project -> workflow -> работа`.
- Если полный browser evidence откладывается, это должно быть явно зафиксировано в `coverage-plan` с owner и этапом закрытия.
