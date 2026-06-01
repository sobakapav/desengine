## Варианты архитектуры запуска

Нужно выбрать и обосновать один из вариантов (MVP):

1) **Встроенный Next/HTTP сервер** внутри Electron + renderer как браузер.
2) **Статическая сборка** UI + локальный API слой (если применимо).
3) **Гибрид**: UI статикой, но с локальным сервисом для хранения/операций.

Критерии выбора:

- время запуска;
- простота обновлений;
- безопасность (nodeIntegration/contextIsolation);
- доступ к файловой системе (строго контролируемый).

## Хранилище данных

MVP требования:

- проекты/задачи/артефакты должны сохраняться локально;
- должна быть возможность экспорта/импорта;
- миграции данных должны быть версионируемыми.

## Readiness-ограничения до implementation

Пока packaging не является актуальной delivery-линией, readiness остаётся частью planning-контекста, а не отдельным активным dispatcher.

Перед любым downstream behavior-change для Electron должны быть явно подтверждены:

- storage boundary для `Project`, `Task`, `Workflow`, `Artifact`, `Event`;
- export/delete/backup/migration story для локального desktop storage;
- отделение secrets/credentials от project и event data;
- smoke strategy для local/desktop профиля без live provider credentials;
- отсутствие scattered backend calls, которые цементируют текущий local-first формат.

Если эти prerequisites не закрыты, Electron change остаётся на уровне idea/planning и не переходит в implementation.

## Обновления

Варианты:

- auto-update (позже, если нужно);
- ручные релизы с проверяемой подписью/хэшами.

## Тестирование (план)

- Unit: доменная логика и storage-адаптеры.
- Integration: запуск desktop окружения + базовый API.
- E2E smoke: установка/запуск → создание проекта → сохранение → перезапуск → данные на месте.

До появления implementation change достаточно traceability и явной фиксации prerequisites в planning-артефактах.
