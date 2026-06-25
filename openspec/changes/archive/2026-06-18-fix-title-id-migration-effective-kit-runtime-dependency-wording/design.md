## Контекст

- `dispatcher-project` уже сделал project page самостоятельной точкой входа в продукт.
- Предыдущие волны проявили project registry, config surface, component registry и workflow readout.
- Пользовательская ревизия показала, что часть этих поверхностей пока отражает внутреннюю инженерную лексику, а не рабочий путь пользователя.

## Решение

1. Перевести project config с внутреннего JSON/settings readout на простую форму:
   - `title`;
   - `id`;
   - `uiKitId`.
2. Явно показать место хранения проекта как локальное browser storage.
3. Убрать из project-facing surfaces:
   - migration labels и messages;
   - effective UI kit как вторую пользовательскую сущность;
   - runtime dependency wording;
   - architecture-transform блок.
4. Сохранить component create-flow, но переписать пользовательские формулировки:
   - создание компонента только создаёт project-scoped сущность;
   - workflow стартует по кнопке `Работать над компонентом`.
5. Подчистить prompt-context contract проекта до одного выбранного UI kit без отдельного effective-поля.

## Границы

- Входит:
  - project registry/page/config user surface;
  - сохранение проекта при редактировании `id`;
  - project-facing copy и metadata;
  - prompt-context project contract без effective-поля.
- Не входит:
  - полный демонтаж workbench-side механики project ui kit switching;
  - переход с browser storage на файловый путь;
  - новый storage backend;
  - новая модель workflow execution.

## Проверяемые последствия

- Пользователь может создать проект с явным `id` и потом изменить `title`, `id` и `uiKitId`.
- Project page не показывает migration/effective/architecture-transform noise.
- Пользователь видит, что проект хранится локально в браузере.
- Создание компонента не обещает несуществующий автозапуск workflow.
