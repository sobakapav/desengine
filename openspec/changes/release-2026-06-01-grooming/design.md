## Контекст

`release-2026-06-01-grooming` не меняет код и не вводит новый продуктовый контракт. Его задача уже описана в `proposal.md`: выступать новой активной релизной меткой для текущей grooming-волны улучшения `test:integration`, пока historical night-wave от 25 мая архивируется.

Проблема текущего состояния в том, что active implement changes всё ещё ссылаются на старый release. Если архивировать его без замены, `release_ref` станет ссылкой на неизвестный change и сломает traceability.

## Решение

Нужно выполнить чистую смену релизной метки без расширения поведенческой области:

1. Создать новый active release `release-2026-06-01-grooming`.
2. Перевести active implement changes integration-wave на новый `release_ref`.
3. Сохранить тактическое подчинение `dispatcher-test-system` без изменений.
4. После перевода ссылок архивировать `release-2026-05-25-night` как исторический релизный срез.

## Границы

В этот change входит:

- создание новой release-метки;
- перепривязка active `release_ref` у integration-wave;
- сохранение читаемого delivery-среза и traceability-целостности.

В этот change не входит:

- изменение кода продукта;
- изменение стратегической иерархии downstream implement changes;
- изменение CLI-команд, ролей change или metadata-схемы.

## Риски и их контроль

- Риск: новый release начнут воспринимать как замену dispatcher-контексту.
  Контроль: в proposal/design/spec явно указано, что `parent_change` сохраняется, а release служит только релизной меткой.
- Риск: архив старого release снова сломает active traceability.
  Контроль: архивация выполняется только после перевода всех active `release_ref` на новый release.

## Проверка

- Уровень: static/contract.
- Команда для внешней проверки: `npm run test:traceability`.
- Что должно подтвердиться: новый release существует в active слое, downstream changes ссылаются на него через `release_ref`, а старый release может быть архивирован без broken references.
