## Контекст

После двух предыдущих срезов система уже умеет:
- строить coordinator step `Работаем над workflow`;
- показывать catalog of workflow points в Workbench;
- объяснять preview как render-center.

Но пользователь ещё не может использовать points как рабочий механизм управления сессией.

Текущий активный file-tab по-прежнему живёт отдельно от workflow-point catalog. Именно эту щель и закрывает change.

## Решение

### 1. Workflow point получает surface-level control semantics

Для каждого workflow-пункта Workbench surface должен знать:
- связанные file id;
- связанные file names;
- primary file для перехода;
- выбран ли пункт сейчас;
- можно ли его реально открыть в текущем runtime.

### 2. Выбор workflow point переводит Workbench на связанный файл

При выборе пункта:
- если у него есть доступный primary file, Workbench переключает текущий editor screen на этот файл;
- если файла пока нет, пункт остаётся explainability-only и не запускает ложное действие;
- dirty/save semantics переиспользуют уже существующий file-switch flow.

### 3. Surface показывает selected point как production focus

Workbench header и/или summary должны показывать, какой пункт сейчас в фокусе работы.

Это даёт пользователю понятную модель:
- coordinator step: `Работаем над workflow`;
- production focus: `Стилизация компонента` или другой выбранный пункт;
- editor/preview уже подчиняются этому focus.

## Границы

Входит:
- surface metadata для point selection;
- UI-control выбора пункта;
- синхронизация с editor file switching;
- unit/source-contract тесты.

Не входит:
- новый workflow mutation API;
- server-side point state;
- отдельная навигация между point-ами как route;
- автономные point-specific prompts/checks.
