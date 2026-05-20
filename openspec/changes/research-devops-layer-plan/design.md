## Принципы DevOps-слоя

- **Reproducible**: сборка и тесты должны воспроизводиться из чистого состояния.
- **Automated by default**: минимум ручных шагов, максимум скриптов/пайплайнов.
- **Fast feedback**: быстрые проверки на PR, более тяжёлые — по расписанию/на релиз.
- **Secure**: секреты не попадают в репозиторий, минимальные права.
- **Observable**: есть метрики/логи, понятные алерты и диагностика.
- **No-LLM dependency**: LLM не является required dependency для CI/CD.

## Состав слоя (каталог)

1) CI (pull request):
   - lint/static checks
   - unit tests
   - traceability checks (OpenSpec)
   - build check (если нужен)

2) CD/Release:
   - versioning/release notes
   - deploy pipeline (для hosted) или build pipeline (для desktop)
   - smoke проверки после выката

3) Окружения и конфигурация:
   - разделение env
   - secret management
   - миграции данных (если есть)

4) Наблюдаемость:
   - logging, metrics, tracing
   - error reporting

5) Incident readiness:
   - rollback стратегия
   - backup/restore (для облака)

## Автоматизация и guardrails

MVP guardrails:

- запрещены релизы без зелёного `test:unit` и `test:traceability`;
- фиксированные команды проверки (единый слой тестирования);
- явная политика секретов и локальных env-файлов.

## Использование LLM-агентов (вне критического пути)

Разрешённые роли агентов:

- генерация/обновление конфигов (CI workflows, deployment manifests);
- анализ логов и предложение правок;
- подготовка release notes.

Но:

- деплой/CI не должен требовать доступа к LLM;
- все изменения от агента ревьюятся и тестируются.

## Тестирование DevOps-слоя

- CI self-test: валидировать конфиги пайплайнов (lint/yaml validation), dry-run где возможно.
- E2E smoke для деплоя (когда появится hosted).

