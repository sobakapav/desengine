## Метод и артефакты

Этот change — про исследование и фиксацию архитектуры как набора артефактов, которые можно ревьюить и на которые можно опираться при реализации.

Зафиксированный набор артефактов:

1) **Architecture Map (AS-IS)** — `artifacts/as-is-map.md`:
   - домены/подсистемы;
   - основные модули и зависимости;
   - ключевые runtime-потоки (например: lab/sandpack preview, user flows, тестовый слой).

2) **Risk Register** — `artifacts/risk-register.md`:
   - стратегические риски (технический долг, безопасность, тестируемость, масштабируемость);
   - симптомы и последствия;
   - предполагаемые первопричины;
   - приоритет и план действий.

3) **Target Architecture (TO-BE)** — `artifacts/target-architecture.md`:
   - целевые границы модулей;
   - стандарты взаимодействия (API/контракты/события/данные);
   - принципы изменения кода (guardrails).

4) **Roadmap** — `artifacts/roadmap.md`:
   - список будущих changes/эпиков;
   - зависимости и порядок;
   - критерии готовности по тестам и traceability.

## Основной вывод

Кодовая база имеет существенный архитектурный капитал: OpenSpec + traceability, доменные каталоги, Zod-схемы, LLM adapters, Sandpack preview, allowlist рабочих файлов и локальный user state. Главный долг не в хаосе, а в том, что старый образовательный runtime стал ядром будущего продукта.

Открытые changes уже мыслят сущностями `Project`, `Workflow`, `Workbench`, `Experience`, `Cost`, `Artifact`, но фактический runtime всё ещё организован вокруг `taskId -> текущий level -> component file set -> user/`.

## Рекомендуемый путь

Система должна развиваться эволюционно:

1. Стабилизировать текущий lab как продуктовый runtime.
2. Ввести минимальный `Project` через `dispatcher-project-ui-kit-switching`.
3. Отдельным hardening-change укрепить lab runtime: canonical navigation, data factory, application service boundary, mutation boundary, integration/e2e checks.
4. После этого оформлять `Task/Workflow/Artifact` и `Workbench`.
5. Только затем массово расширять UI kits, import, experience, cost и packaging.

Не рекомендуется начинать с cloud/electron, Figma import или пачки UI kits до стабилизации `Project`, `Task/Workflow`, `Workbench` и storage contracts.

## Выход в реализацию

После завершения этого change ожидается серия отдельных changes, каждый из которых:

- меняет поведение в узкой области;
- имеет тестовую часть, понятную человеку;
- встроен в общий слой тестирования и traceability.

Первый кандидат на новый behavior/architecture-hardening change: `lab-runtime-contract-hardening-*`.
