# Triage жалоб из Google Doc `13yc4ovhcnwq0SBsdU6SZTz4Uke_Xip9ZI0sUyEKShQ0`

Дата разбора: 2026-06-02

Источник: `https://docs.google.com/document/d/13yc4ovhcnwq0SBsdU6SZTz4Uke_Xip9ZI0sUyEKShQ0/export?format=txt`

## Извлечённые жалобы

1. Пользователь может сбросить только всю задачу, но не откатиться к началу текущего уровня.
2. Иногда не хватает количества уточнений; хочется задавать вопросы в контексте задачи и видеть структуру файлов удобнее.
3. Описание задачи в превью и в открытой задаче воспринимается как разное по размеру и труднее восстанавливается после паузы.
4. Layout рабочего экрана слишком длинный; приходится много скроллить.
5. На уровне 3 пользователь поздно замечает, что появился `styles.ts`, потому что новый файл находится вне зоны внимания.

## Решение по каждой жалобе

### 1. Сброс только всей задачи, без reset текущего уровня

Статус: уже закрыто, новый `fix` не нужен.

Подтверждающие changes:
- `implement-level-reset-entrypoint`
- `fix-check-reset-history-regression`

Подтверждающие проверки:
- `test/e2e/level-reset-granularity.spec.ts`
- `test/e2e/task-reset-history-cleanup.spec.ts`

Вывод:
жалоба относится к уже закрытому дефекту/функциональному пробелу и не требует нового downstream `fix`.

### 2. Не хватает уточнений, хочется richer in-task assistance

Статус: не `fix`, новый bugfix-change не нужен.

Причина:
- жалоба описывает не регрессию и не нарушение действующего контракта;
- это запрос на другую модель взаимодействия: больше контекстных вопросов, лучшая файловая осведомлённость и workflow ближе к Codex/Claude.

Вывод:
если эту тему продолжать, её нужно оформлять не как `fix-*`, а как отдельный product/UX/workbench change уровня `producer-*` или `idea-*`.

### 3. Разный масштаб/доступность описания между превью и открытой задачей

Статус: уже закрыто, новый `fix` не нужен.

Подтверждающий change:
- `fix-workbench-context-visibility`

Что уже было зафиксировано в change:
- выравнивание presentation task description между входом в задачу и рабочим экраном;
- возвращение контекста задачи в первый экран workbench;
- уменьшение риска потери контекста после паузы.

Подтверждающие проверки:
- `test/e2e/workbench-context-visibility.spec.ts`
- `test/e2e/level-3-description-visibility.spec.ts`

### 4. Слишком длинный layout, лишний скролл

Статус: уже закрыто частным UX-fix, новый `fix` не нужен по текущему описанию.

Подтверждающий change:
- `fix-workbench-context-visibility`

Что уже входило в исправление:
- preview и context должны попадать в первый экран;
- vertical layout должен меньше прятать рабочий контекст;
- spatial arrangement Workbench не должен вынуждать пользователя постоянно восстанавливать контекст скроллом.

Вывод:
по формулировке из документа это совпадает с уже закрытым change и не даёт нового узкого дефекта сверх него.

### 5. На уровне 3 поздно замечается новый `styles.ts`

Статус: уже закрыто, новый `fix` не нужен.

Подтверждающие changes:
- `fix-workbench-context-visibility`
- `fix-level-3-style-guidance-contract`
- `fix-level-3-description-visibility`

Подтверждающие проверки:
- `test/e2e/workbench-context-visibility.spec.ts`
- `test/e2e/level-3-description-visibility.spec.ts`

Что уже было исправлено:
- появление нового файла уровня сделано заметным;
- `styles.ts` подсвечивается как новый и выводится в user-facing context;
- level-3 guidance выровнен на канонический `styles.ts`.

## Итоговое решение

Новых `fix-*` changes по этому документу сейчас не требуется.

Из всех жалоб только тема нехватки уточнений и richer task-context выглядит как незакрытый продуктовый gap, но это не bugfix-линия. Если её забирать в OpenSpec, правильнее заводить отдельный downstream change под `dispatcher-ux` или `dispatcher-workbench` как `producer-*`/`idea-*`, а не как `fix-*`.

## Дополнение: отдельный screenshot preview runtime error

Дополнительный пользовательский screenshot с сообщением:

`Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined. You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.`

Статус: уже закрыто отдельным `fix`, новый change не нужен.

Подтверждающий change:
- `fix-preview-check-parity`

Почему это тот же класс дефекта:
- в `proposal.md` этого archived change прямо зафиксирована ошибка вида `Element type is invalid ... got: undefined`;
- change был посвящён именно product-level drift, где preview падает на runtime-render error, а check при этом мог оставаться успешным;
- browser guard `test/e2e/preview-check-parity.spec.ts` фиксирует host-side `render-error`, показывает понятную диагностику и блокирует `Проверить результат`.

Вывод:
сам screenshot не является основанием для нового `fix-*`, если речь идёт об уже закрытом parity-сценарии. Новый downstream change понадобится только если обнаружится другой root cause:
- preview падает на этой ошибке, но check больше не блокируется;
- ошибка возникает вне parity-path и не совпадает с существующим guard;
- repro относится к другому runtime boundary, чем уже закрытый `fix-preview-check-parity`.
