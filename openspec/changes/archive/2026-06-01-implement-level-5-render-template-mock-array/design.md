## Контекст

- Родительский dispatcher управляет приоритетом и порядком реализации.
- В коде уже есть level-owned Sandpack template mechanism:
  - `readLevelSandpackTemplate(...)` и `buildLevelTemplateRuntimeSource(...)`
  - existing tests: `test/unit/sandpack-template.test.ts`, `test/unit/sandpack-preview.test.ts`
- На диске сейчас есть level-owned templates только для `level-1` и `level-2`.
- `level-5/config.json` уже разрешает `mock` в `editableFileIds`, поэтому уровень готов к отдельному render-шаблону, который читает данные из `mock.ts`.

## Решение

- Добавить `onboarding/levels/level-5/sandpack/App.tsx` как канонический render-template уровня.
- Внутри шаблона брать `mock` через namespace-import `mockModule`, чтобы не сужать контракт `mock.ts` по сравнению с `level-1`/`level-2`.
- Сначала вычислять одиночные preview props по логике `mockModule.mockProps ?? mockModule.mock`.
- Если этот приоритетный источник даёт plain object, рендерить один `Component`, как у `level-1`/`level-2`.
- Только если явных одиночных props нет и `mockModule.mock` является массивом, для каждого элемента массива рендерить `Component` с данными этого элемента.
- Обернуть и массивный путь, и fallback-путь в `PreviewRuntimeContractBoundary`, чтобы level-owned template не выпадал из probe/error-boundary preview runtime.
- Не вводить дополнительный abstraction layer: первый вариант должен быть реализован прямым `.map(...)`.
- Не менять общий механизм сборки preview payload; использовать существующий resolver template по `levelId`.
