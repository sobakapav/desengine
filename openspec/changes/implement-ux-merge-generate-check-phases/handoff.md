## Миссия

- Что должен изменить этот change: объединить фазы генерации кода и проверки в единый UX-поток до состояния Проверка пройдена

## Унаследованный контекст

- parent_change: `dispatcher-ux`
- strategy_root: `focus-quality`
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: `dispatcher-ux` уже перевёл эту UX-гипотезу на уровень прямой реализации и удерживает её как часть quality-контура.

## Обязательные источники

- `openspec/changes/dispatcher-ux/proposal.md`
- `openspec/changes/dispatcher-ux/design.md`
- `openspec/specs/task-levels/spec.md`
- Какие ещё файлы и спецификации обязательны к чтению для implement-ux-merge-generate-check-phases: `openspec/specs/user-progress/spec.md` и все связанные task-level UX сценарии, где фиксируются CTA, route и статусы.

## Границы исполнения

- Что входит в этот change: прямое изменение UX-потока, текстов, статусов, навигации и test-рамки вокруг состояния `Проверка пройдена`.
- Что сознательно не входит в этот change: отмена проверки как quality-gate, произвольное изменение correctness-контракта уровня.

## Проверка результата

- verification_level: `component/browser`
- verification_command: `npm run test:traceability`
- Что именно должен доказать результат проверки: change корректно встроен в traceability и получает browser/e2e проверку нового UX-потока.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: где именно разрывается текущий flow; нужен ли автопереход или автозапуск проверки; какие статусы оставить видимыми пользователю; как показать неуспешную проверку без ощущения второй отдельной фазы.
