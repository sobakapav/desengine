# dispatcher-doc

Диспетчер документационного контура внутри `focus-public`.

Этот change удерживает внешний и инженерный documentation contract как управляемую линию: синхронизирует `README.md`, `docs/**`, локальные developer-инструкции и тестовые guidance с наблюдаемым поведением системы, а contract drift направляет в downstream `fix-*` / `implement-*` / `producer-*` changes.
