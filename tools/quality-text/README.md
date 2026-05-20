# Code Quality Text

Отдельная подсистема проверки качества кода как текста.

## Для кого

- Разработчики: запускать проверки и исправлять нарушения.
- Администраторы: контролировать политику waivers и состояние quality-gate.

## Канонические команды

```bash
npm run quality:text
npm run quality:text:branch
npm run quality:text:repo
```

Совместимые legacy-aliases:

```bash
npm run test:readability
npm run test:readability:branch
npm run test:readability:repo
```

## Что проверяется

- размер production/test файлов;
- размер функций;
- формат TODO/FIXME;
- boolean-trap в экспортируемых API;
- floating promises;
- наличие `@example` для нетривиальных экспортируемых API.

## Waivers

Канонический файл исключений:

- `tools/quality-text/waivers.json`

Обязательные поля записи:

- `rules`
- `owner`
- `reason`
- `targetStage`

Если запись неполная, проверка падает.

## Cost-guardrails

- обязательный контур deterministic и не использует LLM;
- по умолчанию анализируется только `working` scope;
- полный обзор запускается только явной командой `quality:text:repo`.
