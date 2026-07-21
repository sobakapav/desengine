# implement-project-storage-browser-local-disk-backed-storage-json

Перевести project storage с browser-local на disk-backed storage на машине сервера: пользователь задаёт путь при создании проекта, может подключить внешний проект с диска, сохранение идёт фоном-автоматом, проект хранится в читаемых JSON-файлах и каталогах без БД; одновременно убрать legacy runtime-следы из active project materials и active OpenSpec changes.
