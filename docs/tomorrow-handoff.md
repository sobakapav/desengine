# Handoff на следующий день

Дата фиксации контекста: 2026-07-22.

## Где остановились

desengine уже имеет живой локальный контур Figma plugin -> Electron desktop:

```text
Figma selection -> Figma plugin -> localhost:37645 -> Electron main -> preload -> React renderer
```

Пользователь подтвердил локально:

- desktop app запускается на macOS;
- Figma plugin видит selection;
- selection ping доходит до Electron;
- PNG выбранного объекта доходит до Electron и показывается в renderer;
- MVP взрыв-схемы работает;
- recursive exploded frame logic работает;
- рабочее поле результата в desktop стало шире и прокручивается;
- instance в итоговой схеме выделяются фиолетовой рамкой.

## Текущий стек

Основная рамка зафиксирована и не меняется без отдельного решения:

- Electron Forge;
- Webpack;
- TypeScript;
- React renderer;
- Tailwind CSS;
- локальные shadcn/ui-compatible заготовки;
- Figma plugin на TypeScript;
- `@desengine/protocol` как shared typed protocol package;
- local dev endpoint на `127.0.0.1:37645`;
- Figma dev domain `http://localhost:37645`.

Важно: Webpack + TypeScript остаётся основной рамкой Electron Forge. Не предлагать Vite или смену сборщика.

## Что реализовано сегодня

### Reusable PNG handoff

PNG-передача оформлена как повторно используемый слой:

- route-константы и URL helper лежат в `@desengine/protocol`;
- `apps/figma-plugin/src/visual-snapshot.ts` экспортирует `SceneNode` в PNG `dataUrl`;
- desktop main process принимает payload через local endpoint и валидирует Zod-схемой;
- renderer показывает PNG через narrow preload API.

### Exploded frame MVP

Появилась кнопка `Создать взрыв-схему` в Figma plugin.

Правило выбора:

- кнопка активна только для первого выбранного auto-layout `Frame`;
- если выбрано несколько объектов, используется первый;
- если первый объект не auto-layout `Frame`, кнопка недоступна.

Правило обхода:

- стартуем от выбранного root frame;
- рекурсивно раскрываем вложенные auto-layout `Frame`;
- останавливаемся на `INSTANCE`;
- останавливаемся на `FRAME` без auto-layout;
- останавливаемся на любом не-frame node;
- принудительно останавливаемся на глубине `4`;
- максимум `100` leaf-элементов.

Для каждого leaf передаётся:

- PNG `dataUrl`;
- `nodeId`;
- `parentNodeId`;
- `nodeName`;
- `nodeType`;
- `depth`;
- `path`;
- `stopReason`;
- координаты и размеры относительно root frame.

### Desktop visual result

Renderer показывает:

- reference PNG root frame;
- вынесенные leaf PNG как взрыв-схему;
- instance leaf выделяются фиолетовой рамкой;
- стилизация leaf вынесена в `getExplodedCellImageClassName`;
- рабочая область занимает всё окно;
- область результата прокручивается по горизонтали и вертикали.

## Где смотреть код

- `packages/protocol/src/index.ts` - route constants, schemas, limits, types.
- `apps/figma-plugin/src/code.ts` - plugin UI message handling and endpoint calls.
- `apps/figma-plugin/src/visual-snapshot.ts` - reusable PNG export helper.
- `apps/figma-plugin/src/exploded-frame.ts` - recursive exploded frame collection and PNG export.
- `apps/figma-plugin/src/ui.html` - plugin buttons and disabled state.
- `apps/desktop/src/index.ts` - local endpoint and schema validation.
- `apps/desktop/src/preload.ts` - narrow renderer API.
- `apps/desktop/src/App.tsx` - desktop preview and exploded frame rendering.
- `apps/desktop/test/smoke/renderer-baseline.spec.ts` - static smoke contract.
- `docs/engineering/figma-integration.md` - human-readable Figma integration contract.
- `openspec/changes/bootstrap-electron-figma-pivot/specs/development-baseline/spec.md` - active behavior contract.

## Проверки, которые проходили

Внешние агенты запускали:

```bash
npm run typecheck
npm run build
npm run test:smoke
```

Результат на конец дня:

- `npm run typecheck` проходит;
- `npm run build` проходит;
- `npm run test:smoke` проходит, `2 passed`;
- предупреждение `NO_COLOR`/`FORCE_COLOR` не влияет на результат;
- Playwright HTML report после проверок возвращался к исходному состоянию.

Если завтра меняется код, финальную проверку по правилу репозитория должен выполнить другой агент или пользователь.

## Важные ограничения

- Endpoint пока development-only.
- Endpoint слушает `127.0.0.1`, но plugin обращается к `http://localhost:37645`, потому что Figma manifest валидирует local dev domain именно так.
- CORS wildcard и фиксированный dev token допустимы только для текущего dev handoff.
- Production pairing ещё не сделан.
- Renderer не получает прямой Node API.
- Figma payload остаётся JSON snapshot, не исполняемый код.
- Figma-документ при экспорте exploded frame не мутируется.
- `apps/figma-plugin/dist/code.js` является build output и игнорируется git.

## Что осталось открытым на завтра

### 1. Source binding между Figma и desengine

Нужно спроектировать связь Figma-объекта и desengine-объекта, чтобы при повторном импорте обновлять Figma snapshot, но сохранять локальные свойства desengine.

Предлагаемая форма:

```ts
sourceBinding: {
  provider: 'figma',
  fileKey: string,
  nodeId: string,
  nodeType: string,
  nodeName: string,
  componentKey?: string,
  snapshotHash: string,
  lastSeenAt: string
}
```

Минимальный MVP key: `fileKey + nodeId`.

Нужно сохранить отдельно:

- latest Figma snapshot;
- локальные свойства desengine: положение на холсте, стиль отображения, пометки, скрытие, группировку, overrides.

Открытый вопрос: fallback matching, если Figma node был удалён и создан заново.

### 2. Обратный запрос Figma -> desengine

Нужно спроектировать запрос, где Figma plugin просит desengine вернуть JSON-данные для выбранного объекта.

Целевой пример:

```text
Figma plugin -> desengine: дай варианты текстового заполнения frame
desengine -> Figma plugin: JSON variants
Figma plugin -> создаёт варианты в Figma
```

Важно: desengine не должен напрямую менять Figma. Он отдаёт typed JSON instructions, а Figma plugin применяет их через Figma API.

### 3. Генерация текстовых вариантов

Желаемый сценарий:

1. Пользователь выбирает frame в Figma.
2. Plugin запрашивает у desengine набор вариантов текстового заполнения.
3. desengine возвращает JSON со связкой text node -> value.
4. Plugin по кнопке создаёт варианты frame в Figma.

Предварительная форма ответа:

```ts
{
  variants: [
    {
      name: 'short',
      textValues: [
        { figmaNodeId: '...', value: 'Короткий текст' }
      ]
    }
  ]
}
```

## Что не делать без отдельного решения

- не менять Electron Forge/Webpack/TypeScript рамку;
- не добавлять D3.js без конкретной задачи;
- не строить production pairing поверх текущего dev token без отдельного дизайна;
- не давать renderer прямой Node/fs/shell/process доступ;
- не превращать Figma payload в исполняемый код;
- не пытаться сразу делать полноценную semantic model вместо следующего узкого product slice.

## Примечание по рабочему дереву

На конец работы в `package.json` есть изменение `allowScripts`, сделанное не агентом. Не откатывать его без явного запроса пользователя.
