# Инженерная гигиена

## Общие правила

- Все проектные тексты, OpenSpec и пользовательские строки пишутся на русском языке.
- Изменения поведения фиксируются в OpenSpec.
- Стек меняется только после явного решения.
- Security boundary считается частью продукта, а не технической деталью.
- Любой внешний input считается недоверенным.

## Electron security

- Renderer не получает Node API.
- `nodeIntegration` выключен.
- `contextIsolation` включён.
- Preload отдаёт только узкий typed API.
- IPC валидирует все аргументы.
- Main process не выполняет команды по сырым данным из renderer.
- Импортированный Figma payload не может напрямую управлять файловой системой, shell, protocol handler или app settings.

## Figma integration security

- Figma plugin передаёт JSON snapshot, а не исполняемый код.
- Desktop app валидирует snapshot перед сохранением и показом.
- Local endpoint принимает запросы только после pairing.
- Local endpoint не должен становиться скрытым публичным API.
- Версии plugin, app и protocol проверяются явно.

## UI

- Интерфейс минималистичный и инструментальный.
- shadcn/ui используется как исходный код компонентов, а не как внешний дизайн-замок.
- lucide-icons используются для типовых действий.
- Сложная визуализация не должна подменять основной пользовательский flow.

## Проверки

После выбора стека нужно завести единый слой проверок:

- static/contract;
- typecheck;
- unit;
- component/browser;
- integration;
- desktop smoke;
- Figma plugin smoke;
- release/package smoke.

Если покрытие откладывается, причина и этап закрытия фиксируются в актуальном traceability-слое.
