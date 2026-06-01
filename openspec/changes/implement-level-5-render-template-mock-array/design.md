## Контекст

- Родительский dispatcher управляет приоритетом и порядком реализации.
- В коде уже есть level-owned Sandpack template mechanism:
  - `readLevelSandpackTemplate(...)` и `buildLevelTemplateRuntimeSource(...)`
  - existing tests: `test/unit/sandpack-template.test.ts`, `test/unit/sandpack-preview.test.ts`
- На диске сейчас есть level-owned templates только для `level-1` и `level-2`.
- `level-5/config.json` уже разрешает `mock` в `editableFileIds`, поэтому уровень готов к отдельному render-шаблону, который читает данные из `mock.ts`.

## Решение

- Добавить `onboarding/levels/level-5/sandpack/App.tsx` как канонический render-template уровня.
- Внутри шаблона считать, что `mock.ts` экспортирует массив элементов для рендера.
- Для каждого элемента массива рендерить `Component` с данными из этого элемента.
- Не вводить дополнительный abstraction layer: первый вариант должен быть реализован прямым `.map(...)`.
- Не менять общий механизм сборки preview payload; использовать существующий resolver template по `levelId`.
