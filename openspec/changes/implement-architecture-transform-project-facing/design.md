## Контекст

- `producer-architecture-transform` уже зафиксировал, что архитектура стала пользовательски значимой линией.
- В системе уже есть project overview, history diagnostics и workflow readout, поэтому первый user-facing слой разумно посадить именно туда.
- Для этого change не нужен новый backend или отдельный navigation entrypoint: достаточно явной read-only панели поверх уже доступных project данных.

## Решение

1. Добавить отдельный surface/model для architecture-transform панели проекта.
2. Отрендерить панель в `ProjectOverviewScreen` рядом с history/workflow слоями.
3. Показать в панели четыре зафиксированных аттрактора линии:
   - `код`;
   - `LLM`;
   - `бюджет`;
   - `дизайн`.
4. Явно отразить:
   - что `AI-трансформация` здесь работает как vision-рамка;
   - что `сессия работы` пока остаётся частью `рабочего места`;
   - что `верстак` не приравнивается жёстко к одному шагу;
   - какие архитектурные волны ожидаются дальше.
5. Закрыть capability `architecture-transform` runnable unit/source-contract evidence и убрать её из `coverage-plan`.
