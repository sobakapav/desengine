# desengine

Локальный инструмент для проектирования поведения интерфейсов на основе данных из Figma.

## Текущий статус

Проект находится в pivot-ветке после полной технической перезагрузки. Старый продуктовый и технический слой удалён, сохранены только настройки Git, OpenSpec и новая базовая инфраструктура.

На конец 2026-07-21 принято направление:

- desktop-приложение на Electron;
- отдельный Figma plugin;
- общий пакет протокола между plugin и desktop;
- локальная передача данных через `127.0.0.1`;
- `desengine://` как механизм запуска и pairing;
- React UI в renderer;
- схемы поведения через `@xyflow/react` и `elkjs`;
- минималистичный UI на Tailwind CSS, shadcn/ui-compatible локальных компонентах и lucide-icons.

Главная продуктовая гипотеза: пользователь работает не с "редактором автоматов", а с player поведения компонента. Figma остаётся источником истины, а схемы поведения являются вспомогательным режимом для проверки веток и переходов.

## С чего продолжать

Следующие рабочие шаги:

1. выполнить внешнюю проверку React/Tailwind/protocol/Figma dev handoff baseline;
2. обсудить первый пользовательский workflow;
3. после утверждения workflow добавить delta specs по пользовательскому поведению;
4. расширять Figma snapshot, behavior model и local endpoint только от утверждённого workflow.

Подробный handoff: [docs/tomorrow-handoff.md](docs/tomorrow-handoff.md).

## Команды

```bash
npm run typecheck
npm run build
npm run test:smoke
npm run package:desktop
npm run make:desktop
```

На SSH-машине `npm run package:desktop` может быть нестабилен из-за загрузки Electron runtime. Это не блокирует локальную разработку: authoritative desktop package проверяется через GitHub Actions.

## Документация

- [Технический стек](docs/engineering/stack.md)
- [Локальная разработка](docs/engineering/local-development.md)
- [CI/CD](docs/engineering/ci-cd.md)
- [Интеграция Figma и desktop-приложения](docs/engineering/figma-integration.md)
- [Инженерная гигиена](docs/engineering/hygiene.md)
- [Codex toolbox](docs/engineering/codex-toolbox.md)
- [Первое архитектурное решение](docs/architecture/decisions/0001-initial-stack.md)

## Лицензия

MIT. См. [LICENSE](LICENSE).
