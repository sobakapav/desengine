## Контекст

Project-aware runtime уже умеет хранить prompt history, check results и scoped files. Эти данные не нужно переизобретать, но их нужно превратить в читаемый пользовательский surface.

## Решение

1. Использовать уже существующие project-scoped runtime данные как source of truth.

2. На странице проекта показать отдельный read-only раздел истории и диагностики.

3. Сделать этот слой explainability-friendly:
   - какие действия уже происходили в проекте;
   - что проверялось;
   - были ли reset и migration;
   - какой рабочий след сейчас живёт внутри project scope.

## Границы

- Не превращать change в editor project files.
- Не открывать низкоуровневые runtime-файлы пользователю как сырой файловый браузер.
- Не смешивать историю проекта с read-only workflow/artifact surface следующей волны.
