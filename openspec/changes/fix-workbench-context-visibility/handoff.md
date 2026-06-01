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
- Добавлен browser-spec `test/e2e/workbench-context-visibility.spec.ts`, который готовит fixture для level 3, проверяет context block на первом экране и фиксирует signal/path для `styles.ts`.

## Что проверено

- Выполнен `npm run test:unit -- test/unit/p1-source-contracts.test.ts`
- Выполнен `npm run build`
- Browser-level spec добавлен и запускается командой `npm run test:e2e -- test/e2e/workbench-context-visibility.spec.ts`

## Блокер финальной приёмки

- В этой среде финальный browser verdict не получен не из-за product failure, а из-за падения Playwright browser runtime до открытия страницы:
  - `browserType.launch ... Target page, context or browser has been closed`
  - Chrome/Chromium завершается `SIGABRT`, затем `kill EPERM`
- Поэтому этот change нельзя честно закрывать в текущем окружении, хотя code/build и e2e scenario уже подготовлены.

## Следующий шаг для внешнего верификатора

- Поднять внешний server path:
  - `DESENGINE_E2E_EXTERNAL_SERVER=1`
  - `DESENGINE_E2E_BASE_URL=http://127.0.0.1:3410`
  - `DESENGINE_E2E_FIXTURE_ACCESS=1`
- Запустить:
  - `npm run test:e2e -- test/e2e/workbench-context-visibility.spec.ts`
- Подтвердить по сути:
  - context block (`Контекст уровня`, `Что важно в этой задаче`, `Полное пояснение уровня`) виден сразу после входа в Workbench;
  - сигнал о `styles.ts` появляется до ручного поиска файла;
  - `styles.ts` оказывается в первичном фокусе пользователя, а не остаётся скрытым во втором табе.
