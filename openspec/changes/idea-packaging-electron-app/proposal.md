## Why

Сейчас есть только локальное развёртывание. Electron-упаковка нужна как отдельный формат продукта, потому что:

- даёт «приложение как инструмент» с понятным UX установки/обновлений;
- позволяет использовать локальные ресурсы (файлы, кэш, инструменты) без ручной настройки окружения;
- снижает сложность для пользователей, которым не подходит установка через Node/терминал.

## What Changes

Этот change описывает целевой формат упаковки «Electron desktop app» и план реализации:

- целевая архитектура (main/renderer, безопасность, песочницы);
- стратегия запуска текущего приложения внутри Electron (встроенный сервер vs встроенный рендер);
- стратегия хранения данных локально (проекты/задачи/артефакты/опыт) и миграции;
- readiness-ограничения перед любым behavior-change по packaging:
  - storage boundaries для project/task/workflow/artifact/event;
  - требования к export/delete/backup/migration;
  - отделение secrets и credentials от пользовательских данных;
  - smoke strategy без live provider credentials;
- стратегия обновлений (auto-update или ручная);
- распределение ответственности между web-версией и desktop-версией;
- тестовый план и traceability.

## Non-goals

- Мгновенная поддержка всех платформ и всех сценариев на первом шаге.
- Миграции install-critical стека «ради Electron» без отдельного решения (это план, а не форсированный рефактор).
- Реализация readiness-слоя или storage adapter boundary в рамках этого planning change.

## Capabilities

### New Capabilities (концептуально)
- `deployment-electron`: desktop-упаковка и её окружение.

### Modified Capabilities
- `projects` / `dev-mode` (если включены): надёжное локальное хранение данных в desktop-режиме.
- `level-labs`: доступ к локальным инструментам может быть расширен в desktop-режиме (позже, отдельными changes).

## Acceptance Criteria

- Определён MVP сценарий Electron-версии и границы функциональности.
- Описан выбранный вариант архитектуры запуска (и почему).
- Зафиксировано, какие storage readiness prerequisites обязательны до старта implementation change.
- Есть roadmap на отдельные changes (bootstrapping, storage, updates, security hardening).
- Есть тестовый план (unit/integration/e2e smoke) и команды проверки.
