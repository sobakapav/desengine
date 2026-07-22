# Handoff на следующий чат

Дата фиксации контекста: 2026-07-21.

## Что произошло сегодня

Проект переведён в pivot: старая техническая и содержательная часть удалена, новая основа создана с нуля.

Сохранены:

- Git history и настройки репозитория;
- OpenSpec settings;
- правила работы в `AGENTS.md`;
- новые инженерные документы;
- новые локальные Codex skills для security, protocol, Figma flow, UI player и release checklist.

Добавлены:

- npm workspaces;
- `apps/desktop` на Electron Forge + Webpack + TypeScript;
- `packages/protocol` как общий пакет протокола;
- зависимости для будущего UI/player слоя;
- GitHub Actions для checks и ручной desktop package-сборки.

## Принятые решения

Desktop-приложение является основным пользовательским приложением. Figma plugin является отдельным входом из Figma и отправляет данные в desktop-приложение.

Первый пользовательский сценарий пока не формализован. До его обсуждения не надо строить сложную структуру экранов или продуктовую модель проекта.

Figma считается источником истины. desengine получает snapshot выбранного компонента или variant set и превращает его в просматриваемое поведение.

Главный UI - player поведения компонента. Схема поведения нужна как вспомогательный режим для проверки веток, пропущенных состояний и сомнительных переходов.

## Текущий стек

- Electron Forge;
- Webpack;
- TypeScript 5;
- React;
- lucide-icons;
- Zustand;
- Motion;
- `@xyflow/react`;
- `elkjs`;
- Figma plugin;
- shared protocol package;
- `desengine://`;
- local endpoint на `127.0.0.1`.

Уже установлены Electron, React, Zustand, Motion, lucide-icons, `@xyflow/react`, `elkjs`, TypeScript и `zod`.

Tailwind CSS и shadcn/ui приняты как направление UI-стека, но ещё не подключены. Их лучше добавлять после минимального React renderer baseline.

## Что уже проверено

Локально:

- `npm run typecheck` проходит;
- `npm run build` проходит и собирает `@desengine/protocol`;
- `npm audit --omit=dev` показывает runtime-clean состояние;
- Electron Forge package на SSH-машине может упираться в загрузку Electron runtime и не считается обязательным локальным smoke.

На GitHub Actions:

- `Checks` запустился автоматически для побочной ветки и прошёл;
- `Desktop Package` был запущен вручную и отработал;
- desktop package-сборка на CI считается рабочей базой для будущих release-проверок.

## Важное ограничение SSH-разработки

Разработка идёт на удалённой машине через SSH. Поэтому обычный Electron dev-loop с открытием desktop-окна может быть недоступен без X11/VNC/локального GUI.

Для локального SSH-friendly режима сейчас считаются базовыми:

```bash
npm run typecheck
npm run build
```

`npm start --workspace @desengine/desktop` может запускаться, но окно на удалённой машине может не открываться у пользователя.

## Следующий шаг

Обновление 2026-07-22: минимальный renderer baseline и инфраструктурные заготовки уже добавлены. Следующий шаг теперь не в создании экрана, а во внешней проверке и обсуждении первого пользовательского workflow.

Добавлено:

- React renderer baseline;
- Tailwind CSS через существующий Webpack/PostCSS renderer pipeline;
- shadcn/ui-compatible `components.json`, `cn` и первый локальный UI-компонент;
- минимальный Zod status-контракт, dev selection ping и PNG visual snapshot в `@desengine/protocol`;
- TypeScript Figma plugin skeleton для живого dev handoff;
- Electron loopback endpoint `localhost:37645`;
- Playwright smoke skeleton.

Дальше:

1. выполнить внешнюю проверку `npm run typecheck`, `npm run build`, `npm run test:smoke`;
2. обсудить первый пользовательский workflow;
3. после утверждения workflow проектировать полноценный Figma snapshot, behavior model, pairing и production local endpoint.

## Что не делать завтра без отдельного решения

- не менять Electron Forge/Webpack на Vite;
- не добавлять D3.js без конкретной задачи;
- не начинать release signing/notarization/auto-update;
- не строить полный Figma plugin до согласования первого workflow;
- не давать renderer прямой Node-доступ;
- не открывать local endpoint без pairing и schema validation.
