## Контекст

`dispatcher-architecture` получил ownership архитектурной карты, naming discipline и модульных границ, но сам по себе этот ownership ещё не даёт рабочий ответ на ежедневный routing вопрос. Родителю и downstream исполнителям нужен не абстрактный тезис, а короткий operational playbook.

Сейчас gap выглядит так:

- не зафиксировано, какой признак делает change именно architectural, а не domain-specific;
- не зафиксировано, когда `dispatcher-architecture` должен быть tactical parent, а когда достаточно evidence для предметного dispatcher;
- нет явного списка доказательств, которые нужны при изменении модульной границы или interaction contract;
- naming discipline декларирована в родителях, но не собрана в прикладные правила для downstream authoring.

## Цели

- Дать родителю быстрый routing playbook для downstream changes.
- Отделить ownership архитектурной границы от ownership предметной реализации.
- Зафиксировать naming discipline и boundary evidence в форме, пригодной для повседневного использования.

## Не-цели

- Не описывать полную архитектурную карту или ADR-содержимое системы.
- Не назначать новые dispatcher-линии вместо родителя.
- Не менять действующие решения в `dispatcher-architecture` и `producer-architecture-transform`.

## Решение

1. Создать отдельный routing playbook.
   Он должен отвечать на три вопроса:
   - это change для `dispatcher-architecture` или для предметного dispatcher;
   - требуется ли эскалация до architectural boundary evidence;
   - какие артефакты нужно обновить вместе с кодом.

2. Зафиксировать naming discipline как routing-signal.
   Если change вводит новую крупную сущность, новый модульный термин или меняет имя архитектурно значимой части системы, это считается architectural signal и требует либо parent ownership у `dispatcher-architecture`, либо как минимум explicit evidence по naming decision.

3. Зафиксировать boundary/interaction contract guidance.
   Любое изменение архитектурной границы должно явно показывать:
   - владельца границы;
   - входы/выходы и точки вызова;
   - допустимые зависимости;
   - сценарии, которые подтверждают корректность новой границы;
   - какие документы и тесты обновляются вслед за изменением.

4. Подкрепить документацию unit-контрактом.
   Один узкий test/unit файл проверяет, что playbook не деградировал до пустого заголовка и всё ещё содержит routing, naming и evidence-правила.

## Область изменений

- `docs/architecture/routing/playbook.md`
- `docs/architecture/naming-discipline.md`
- `docs/architecture/boundary-interaction-contracts.md`
- артефакты `openspec/changes/implement-architecture-routing-playbook/**`
- узкий unit-контракт на документацию

## Риски и компромиссы

- [Риск] Playbook окажется слишком общим и не поможет принять routing-решение.
  -> Снизить риск через decision matrix и явные anti-signals для предметных dispatcher lines.

- [Риск] Документ начнёт подменять собой архитектурную карту или ADR.
  -> Удерживать playbook как operational guidance, а не как место для новых архитектурных решений.

- [Риск] Naming discipline будет восприниматься как вкусовщина.
  -> Привязать naming-правила к ownership, discoverability и traceability, а не к стилевым предпочтениям.

## Открытые вопросы

- Нужна ли отдельная doc-секция с примерами маршрутизации для будущих `dispatcher-code` или `dispatcher-llm`, если родитель решит их выделять отдельно.
