## Context

Предыдущие fixes уже отделяли browser verification от части инфраструктурных проблем, но текущая эксплуатация показывает более широкий системный дефект: browser-проверка остаётся недостаточно фазированной. Даже когда есть wrapper и preflight, downstream исполнителю всё ещё трудно понять, где именно ломается verification path и насколько можно доверять итоговому verdict.

Проблема уже не только в том, как поднять `next dev` или стартовать Chromium. Системно шумят и следующие участки:

1. bootstrap target server:
   - readiness route может быть доступен, но нужный app-state ещё не готов для product-spec;
   - внешняя server-ready диагностика не совпадает с фактической готовностью browser-потока.

2. browser runtime:
   - launch браузера и переход на базовый route могут быть валидны, но дальнейший context setup разваливается отдельно;
   - часть падений выглядит как product-fail, хотя на деле browser-phase не была готова.

3. fixture/project bootstrap:
   - test setup, project seeding, sandbox access и локальные моки не имеют отдельного contract verdict;
   - product-spec падает слишком поздно и скрывает реальную фазу сбоя.

4. teardown:
   - cleanup после browser run иногда сам становится источником ложного красного статуса;
   - команда не понимает, продукт сломан или verification-path грязно завершился после уже валидного прогона.

## Decisions

1. Browser verification описывается как каноническая последовательность фаз.

   Каждая browser-проверка, которая претендует на product verdict, должна пройти через явно различимые этапы:
   - `target-ready`;
   - `browser-ready`;
   - `fixture-ready`;
   - `product-run`;
   - `cleanup`.

   Падение любой фазы должно маркироваться именно фазой, а не общим “e2e failed”.

2. Wrapper-path становится не просто обходным способом запуска, а системным оркестратором browser-phase.

   Если execution mode известен как нестабильный для direct browser-run, verification должна идти через канонический wrapper path, который:
   - печатает phase-level diagnostics;
   - передаёт product-spec управление только после готовности обязательных фаз;
   - различает pre-product failure и failure внутри сценария.

3. Fixture/bootstrap должен стать отдельной фазой контракта.

   Browser verification не считается готовой к product verdict, пока не подтверждён required setup:
   - fixture access;
   - проект/маршрут/мок-состояние;
   - минимальная готовность app surface для целевого spec.

4. Cleanup verdict не должен ретроактивно маскировать product result.

   Если product-spec уже дал содержательный verdict, cleanup failure должен классифицироваться отдельно как post-run instability и не стирать информацию о состоянии продукта.

5. Административные команды используют тот же phase contract.

   `os:close` и другие browser-oriented admin paths не должны считать browser verification валидной, если не завершены обязательные системные фазы.

## Implementation Outline

- Уточнить общий browser verification runtime/helper так, чтобы он умел возвращать phase-level structured verdicts.
- Расширить wrapper/browser preflight до полноценной phase-модели, а не только до server/launch smoke.
- Зафиксировать правила передачи управления product-spec:
  - только после target/browser/fixture readiness;
  - с явной пометкой execution mode.
- Обновить `docs/testing-layer.md`, `test/README.md` и при необходимости admin/tooling docs под новую модель browser-phase verdict.
- Добавить unit/static guards на phase classification и browser verification metadata, если это можно проверить без живого браузера.

## Risks / Trade-offs

- [Риск] Change попытается “стабилизировать” browser-фазу через ослабление product assertions.
  - Mitigation: отдельно закрепить, что product-run начинается только после phase-ready, но сами assertions не упрощаются ради зелёного результата.

- [Риск] Phase-модель окажется слишком сложной и будет трудно читаема в CLI.
  - Mitigation: держать короткие machine-readable phase labels и отдельные понятные diagnostics message.

- [Риск] Wrapper-path станет единственной сложной точкой отказа.
  - Mitigation: зафиксировать unit/source-contract проверки оркестратора и явно документировать fallback/unsupported paths.

## Open Questions

- Нужно ли phase verdict хранить как отдельную сериализованную структуру, доступную для `os:close`, или достаточно стандартизированного stdout/stderr контракта.
- Нужно ли выделять особую фазу `app-hydration-ready`, если одного `fixture-ready` недостаточно для устойчивых product-spec.
