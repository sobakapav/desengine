## Контекст

- `dispatcher-architecture` уже описывает себя как tactical owner producer-линии, но его metadata пока привязывают его напрямую к `focus-tech`.
- Из-за этого ownership читается только по тексту proposal/design, а не по реальному lineage в OpenSpec topology.
- Исполнительский change тоже не фиксирует producer-контекст и ожидаемый verification layer, поэтому handoff и проверка остаются неявными.

## Решение

- Перевести `dispatcher-architecture` на прямой `parent_change=producer-architecture-transform`.
- Сохранить `strategy_root=focus-tech`, чтобы не потерять стратегическую принадлежность architectural line к technical focus.
- Оставить `roadmap_ref` на стратегический roadmap `focus-tech` и дополнить dispatcher ссылкой на `producer-architecture-transform/roadmaps/architecture-implementation.md` через `roadmap_refs`.
- Для `implement-architecture-dispatcher-parent-link` зафиксировать `producer_ref=producer-architecture-transform` и static/contract verification через `npm run test:traceability`.
- Обновить handoff и tasks этого implement-change так, чтобы внешний проверяющий видел объём сделанного и понимал, что финальная проверка ещё должна быть выполнена отдельно.
