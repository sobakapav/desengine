## Миссия

- Что должен изменить этот change: устранить потерю контекста внутри Workbench, уменьшить лишний скролл и сделать новые файлы уровня заметными.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-bugfix
- strategy_root: focus-quality
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: parent dispatcher уже отделил UX-жалобы, которые можно локализовать в конкретном interaction defect, от расплывчатого “не нравится интерфейс”. Здесь жалобы сходятся в один источник: слабая видимость ключевого task context и file state внутри Workbench.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию держит `dispatcher-bugfix`; этот fix отвечает за layout-level видимость контекста и файлов в рабочем экране.

## Обязательные источники

- openspec/changes/dispatcher-bugfix/proposal.md
- openspec/specs/level-labs/spec.md
- openspec/specs/component-file-set/spec.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-workbench-context-visibility: `components/desengine/lab/Workbench/WorkbenchView.tsx`, `components/desengine/task/TaskLevelStart.tsx`, `components/desengine/lab/Code/Code.tsx`, `components/desengine/lab/InOut/OutRender/OutRender.tsx`, `test/README.md`.

## Границы исполнения

- Что входит в этот change: улучшить видимость task-specific контекста и file-state внутри Workbench, сократить вертикальную фрагментацию экрана, сделать multi-file progression явно заметным для пользователя.
- Что сознательно не входит в этот change: полный визуальный редизайн всей лаборатории, runtime preview fixes, изменение didactic content задач.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: bugfix не должен превращаться в общую product-стратегию нового workbench; он закрывает локальную проблему видимости и навигации внутри текущего экрана.

## Проверка результата

- verification_level: component/browser
- verification_command: npm run test:e2e -- test/e2e/workbench-context-visibility.spec.ts
- Что именно должен доказать результат проверки: после входа в задачу пользователь видит ключевой контекст без лишнего скролла, а новый файл уровня не остаётся незамеченным.

## Что реализовано

- В `components/desengine/lab/Workbench/WorkbenchView.tsx` верх рабочего экрана перестроен в `WorkbenchOverview`: preview и task context теперь стоят в одном desktop-first блоке, а не идут длинной вертикальной колонкой перед редактором.
- Task context в Workbench больше не ограничен только кратким `taskTip`. В правой колонке появился compact context block с:
  - task-specific пояснением;
  - явным списком рабочих файлов уровня;
  - раскрываемым полным пояснением уровня через inline details, чтобы пользователь не возвращался на стартовый экран за общим контекстом.
- В `components/desengine/lab/Code/Code.tsx` добавлен multi-file affordance:
  - если кроме первого файла уровня появляется новый editable file, он помечается как `Новый файл`;
  - Workbench показывает текстовый notice `Появился новый файл уровня: ...`;
  - новый файл получает первичный автофокус через controlled tab-switch, чтобы `styles.ts` не оставался вне внимания.
- В `components/desengine/lab/InOut/OutRender/OutRender.tsx` убран preview-crash, который сносил весь Workbench на route `/lab/[taskId]`: ref на `SandpackPreview` стабилизирован, а переходы `previewClientId` вынесены в `components/desengine/lab/InOut/preview-client-id.ts`, чтобы transient `null` от ref lifecycle больше не создавал бесконечный `setState`.
- Добавлен unit-regression `test/unit/preview-client-id.test.ts` на этот crash-path.
- Browser-spec `test/e2e/workbench-context-visibility.spec.ts` выровнен с реальным multi-file контрактом:
  - fixture теперь переводит `dipole-button` на level 3, где `styles.ts` действительно входит в `editableFileIds`;
  - navigation ждёт `domcontentloaded`, а не full `load`, потому что пользовательский verdict здесь опирается на готовность Workbench UI, а не на завершение всего dev-chunk хвоста;
  - assertions проверяют level-3 context и signal/path для `styles.ts`.
- Для первого входа в multi-file уровень `components/desengine/lab/Code/Code.tsx` теперь считает известным только первый рабочий файл, если session-state ещё не накоплен. Это возвращает ожидаемый сигнал “новый файл уровня” для `styles.ts`.

## Что проверено

- Выполнен `npm run test:unit -- test/unit/p1-source-contracts.test.ts`
- Выполнен `npm run build`
- Browser-level spec добавлен и запускается командой `npm run test:e2e -- test/e2e/workbench-context-visibility.spec.ts`
- Внешний верификатор подтвердил:
  - `npm run test:unit -- test/unit/preview-client-id.test.ts test/unit/project-ui-kit-switching.test.ts test/unit/sandpack-preview.test.ts`
  - `DESENGINE_E2E_FIXTURE_ACCESS=1 DESENGINE_E2E_PORT=3503 node tools/testing/run-browser-verification-runtime.mjs test/e2e/workbench-context-visibility.spec.ts`
  - итог browser-spec: `1 passed`

## Что было локализовано по пути

- Сначала browser-layer падал не по UX-change, а по системным причинам: broken Playwright launcher path, stale dev server и chunk drift.
- После стабилизации browser verification вскрылся реальный product crash: `Maximum update depth exceeded` в `OutRender.tsx` на `ref -> setPreviewClientId`.
- После устранения crash-path остался уже только contract drift самого spec: fixture ошибочно сидел на level 2, где `styles.ts` не разрешён текущим `editableFileIds`.
- После перевода fixture на level 3 и выравнивания baseline нового файла change получил валидную внешнюю browser-приёмку.
