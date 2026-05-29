# dispatcher-bugfix

Управляющий no-code change для потока багов в контуре `focus-quality`.

Назначение change:

- собирать и маршрутизировать воспроизводимые дефекты;
- отделять локальные bugfix-задачи от feature/redesign changes;
- задавать требования к воспроизведению, доказательству исправления и тестированию на уровне downstream `fix-*` changes.

Сам `dispatcher-bugfix` не меняет runtime-код и не заменяет отдельные исполнительские fix-change.
