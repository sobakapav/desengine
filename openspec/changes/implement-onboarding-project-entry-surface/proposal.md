## Why

Даже после появления `ProjectWorkspace` onboarding по-прежнему читается как вход в набор задач и
уровней самих по себе. Это мешает основной цепочке `проект -> workflow -> проверка/чеклист ->
результат`, потому что пользователь не понимает, в каком проектном контексте он вообще начинает
работу.

## What Changes

- Перевести onboarding task entry surfaces на project-aware язык и маршрут.
- Сделать project context главным объяснением входа в задачу.
- Убрать ощущение, что onboarding начинается из безымянного level/task каталога.

## Impact

- Onboarding ближе к общей пользовательской модели `ProjectWorkspace`.
- Downstream workflow- и check/result-волны получают правильную точку входа.
