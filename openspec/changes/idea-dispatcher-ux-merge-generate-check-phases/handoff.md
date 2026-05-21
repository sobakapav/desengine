## Миссия

- Что должен изменить этот change: объединить фазы генерации кода и проверки в единый UX-поток до состояния Проверка пройдена

## Унаследованный контекст

- parent_change: `dispatcher-ux`
- strategy_root: `focus-quality`
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: `dispatcher-ux` уже зафиксировал, что UX-изменения должны оформляться отдельными downstream changes с человеко-понятной тестовой частью и без смешения с общим quality-контуром.

## Обязательные источники

- `openspec/changes/dispatcher-ux/proposal.md`
- `openspec/changes/dispatcher-ux/design.md`
- `openspec/specs/task-levels/spec.md`
- Какие ещё файлы и спецификации обязательны к чтению для idea-dispatcher-ux-merge-generate-check-phases: `openspec/specs/user-progress/spec.md` и, при переходе к реализации, все связанные task-level UX сценарии, где фиксируются CTA, route и статусы.

## Границы исполнения

- Что входит в этот change: формулировка UX-принципа, что пользователь делает одну цельную работу до состояния `Проверка пройдена`; определение затронутых capability и тестовой рамки для downstream behavior-change.
- Что сознательно не входит в этот change: прямое изменение runtime, copy, маршрутов и экранов без отдельного implementation/fix change.

## Проверка результата

- verification_level: `spec`
- verification_command: `npm run test:traceability`
- Что именно должен доказать результат проверки: downstream behavior-change сможет однозначно связать UX-идею с изменениями в `task-levels`, `user-progress` и тестовом слое.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: где именно разрывается текущий flow; нужен ли автопереход или автозапуск проверки; какие статусы оставить видимыми пользователю; как показать неуспешную проверку без ощущения второй отдельной фазы.
