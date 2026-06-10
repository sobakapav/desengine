## Context

`producer-project` уже принял сложное, но честное решение: project `UI kit` можно менять, но это тяжёлая миграция, которая может откатить часть прогресса. При этом текущая project/preview линия пока описывает переключение главным образом как runtime/config change.

Это опасный контрактный разрыв: сущность проекта уже становится верхним контекстом, но важнейшее изменение этого контекста пока не влияет явно на валидность результата.

## Goals

- Сделать смену project `UI kit` явной migration-операцией.
- Привязать task validity и progress к compatibility с текущим project contract.
- Сохранить поведение человека-понятным и тестируемым.

## Non-goals

- Не пытаться автоматически "починить" весь пользовательский код под новый kit.
- Не делать эту ветку полной реализацией project entity или task/workflow/workbench binding.
- Не вводить project roadmap или новую PM-логику.

## Decisions

1. Смена project `UI kit` трактуется как contract migration, а не как cosmetic toggle.

2. После migration система обязана различать:
   - совместимые task/progress данные;
   - данные, требующие отката или повторного прохождения.

3. Migration status должен быть видимым в runtime/UI, а не скрытым внутренним флагом.

## Risks / Trade-offs

- Жёсткая invalidation может раздражать пользователя.
  -> Mitigation: лучше честный откат с явным сигналом, чем скрытая поломка прогресса и preview.

- Если invalidation описать слишком абстрактно, каждая реализация будет трактовать её по-своему.
  -> Mitigation: зафиксировать это в capability `projects` и `user-progress`, а не только в prose producer-change.

## Open Questions

- Какой минимальный migration summary пользователь должен видеть при смене `UI kit`.
- Где проходит MVP-граница между откатом всего task progress и откатом только несовместимых уровней/артефактов.
