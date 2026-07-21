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
- минималистичный UI на Tailwind CSS, shadcn/ui и lucide-icons.

Главная продуктовая гипотеза: пользователь работает не с "редактором автоматов", а с player поведения компонента. Figma остаётся источником истины, а схемы поведения являются вспомогательным режимом для проверки веток и переходов.

## С чего продолжать

Первый следующий рабочий шаг:

1. перевести Electron renderer на React;
2. подключить `@desengine/protocol` к desktop UI;
3. показать минимальный экран desengine с текущей версией протокола;
4. проверить локально `npm run typecheck` и `npm run build`;
5. после этого переходить к первому пользовательскому workflow.

Подробный handoff: [docs/tomorrow-handoff.md](docs/tomorrow-handoff.md).

## Команды

```bash
npm run typecheck
npm run build
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
