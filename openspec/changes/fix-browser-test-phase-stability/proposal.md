## Why

Browser verification уже формально существует в тестовом слое, но на практике browser-фаза всё ещё даёт нестабильный и плохо интерпретируемый verdict:

- один и тот же запуск может упасть на bootstrap target server, launch Chromium, fixture/bootstrap проекта, teardown wrapper или уже внутри product assertions;
- downstream browser-oriented changes получают одинаковый красный статус при принципиально разных причинах и команда тратит время на ручную расшифровку;
- direct `npm run test:e2e -- ...` и wrapper-path по-прежнему сосуществуют как будто равноправные режимы, хотя в системно проблемных средах они дают разную надёжность;
- release- и fix-приёмка начинает зависеть не от состояния продукта, а от того, насколько случайно повезло очередному browser run.

Нужен отдельный системный fix, который стабилизирует именно browser-phase contract, а не очередной конкретный продуктовый spec.

## What Changes

- Ввести browser phase как явный многошаговый verification-контур тестовой подсистемы.
- Зафиксировать для browser verification детерминированные фазы verdict:
  - подготовка target server;
  - browser launch/runtime preflight;
  - fixture/project bootstrap;
  - product-spec execution;
  - teardown/cleanup.
- Сделать wrapper/browser-runtime каноническим оркестратором этих фаз там, где direct Playwright path не даёт надёжного результата.
- Добавить machine-readable diagnostics и человеко-понятную классификацию ошибок по фазам, чтобы infra/system failures не выглядели как product regressions.
- Уточнить close/verification guardrails для changes с `verification_level=component/browser`, чтобы browser verdict считался валидным только после успешного прохождения обязательных системных фаз.

## Non-goals

- Не чинить конкретные UX/runtime дефекты отдельных browser-spec файлов.
- Не менять install-critical стек, браузерный движок, Node.js, Next.js или Turbopack без отдельного change и явного разрешения.
- Не ослаблять product assertions ради формально зелёной browser-приёмки.
- Не сводить browser-фазу к одной документационной оговорке без runnable automation contract.

## Impact

- `dispatcher-test-system` получит новый fix на устойчивость browser-фазы как общей подсистемы.
- Downstream browser changes станет проще принимать или блокировать на основании понятного phase-level verdict.
- Browser verification перестанет быть “одним чёрным ящиком”, где infra, fixture и продукт смешиваются в один failure.
