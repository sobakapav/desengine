## Context

Текущая OpenSpec-модель в репозитории частично уже движется к producer ownership, но несколько канонических слоёв всё ещё спорят с этим:

- `admin-tools` spec описывает producer как слишком узкий стратегический слой;
- `traceability` частично держит старые ожидания вокруг `dispatcher -> producer`;
- `os:begin`, `os:ctx`, `os:dispatch`, `os:req` и handoff-тексты продолжают навязывать картину мира, где реальный owner исполнения обязательно называется dispatcher;
- agent-facing инструкции не фиксируют явно, что producer может быть одновременно owner смысла и owner процесса.

Из-за этого новый чат, даже попав в producer-контур, получает подсказки и проверки, которые подталкивают к дроблению ответственности.

## Goals / Non-Goals

**Goals:**

- Зафиксировать producer как полный owner линии на уровне системного контракта.
- Разрешить прямое parent ownership от producer к downstream changes.
- Сохранить `dispatcher` как допустимый, но не обязательный tactical слой внутри того же `focus`.
- Явно записать, что формальные requirements/scenarios для producer могут быть результатом roadmap, а не обязательной стартовой вводной.

**Non-Goals:**

- Не отменять `dispatcher` как полезную тактическую роль там, где она действительно нужна.
- Не разрешать producer менять код напрямую.
- Не перестраивать release-модель и не менять install-critical стек.

## Decisions

### 1. Producer становится каноническим owner смысла и процесса

Producer не ограничивается только roadmap и vision. Он владеет смыслом линии, управляет её развитием, принимает downstream-решения и остаётся источником истины для подчинённых changes.

### 2. Dispatcher становится отдельным tactical sibling в focus-линии, а не обязательным владельцем тактики

Если producer-линии нужен отдельный operational pressure, dispatcher можно создать как child соответствующего `focus`. Но система больше не должна считать, что dispatcher обязан подчиняться producer или быть единственным носителем тактики.

### 3. Producer может быть прямым родителем downstream implementation changes

`implement/fix -> producer` допустимы как прямое выражение ownership. Но `dispatcher -> producer` не нужен: producer и dispatcher должны пересекаться через общий focus и roadmap-конкуренцию, а не через parentage.

### 4. Producer-level формализация requirements/scenarios не обязательна на старте

Для producer нормальна ситуация, когда вначале есть roadmap, ownership и управленческая рамка, а формальные requirements/scenarios появляются позже как результат maturation. Поэтому tooling и системные тексты не должны воспринимать их отсутствие как дефект самой producer-роли.

## Risks / Trade-offs

- [Станет неочевидно, когда нужен dispatcher] -> прямо зафиксировать, что dispatcher остаётся optional helper для сложной тактики, а не обязательный уровень.
- [Часть текстов будет продолжать говорить языком `parent dispatcher`] -> заменить системные формулировки на более общий `parent change`.
- [Прямые implement/fix под producer спрячутся из обзоров] -> обновить producer listings и контекстные команды, чтобы они выводили producer ownership и без отдельного dispatcher.

## Migration Plan

1. Обновить системный spec `admin-tools`.
2. Обновить AGENTS и user-facing тексты tooling.
3. Ослабить traceability-валидацию для `implement/fix -> producer`, но отдельно закрепить `dispatcher -> focus`.
4. Актуализировать unit-тесты и обзоры producer-линий.
5. Existing changes не мигрировать автоматически; новая модель должна сразу поддерживаться для будущих changes.

## Open Questions

- Нужно ли позже вводить явную metadata-пометку для `dispatcher`, созданного как helper под producer, или прямого `parent_change` достаточно.
- Где проходит практическая граница между «producer управляет напрямую» и «producer заводит отдельный dispatcher ради operational удобства» в разных линиях репозитория.

## Testing

- `static/contract`: `npm run test:traceability` для обновлённого OpenSpec-контракта.
- `unit`: покрытия вокруг `change-rules`, `os:begin`, `os:ctx`, producer listing и handoff.
- Mock/fixture-данные:
  - producer как прямой родитель implement/fix;
  - dispatcher под focus без `producer_ref`;
  - dispatcher с roadmap producer-а в той же focus-орбите.
- Live credentials: не требуются.
