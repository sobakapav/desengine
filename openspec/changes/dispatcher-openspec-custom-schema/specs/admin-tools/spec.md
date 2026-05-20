## MODIFIED Requirements

### Requirement: Документация админских утилит согласована с root-инструкциями

Система SHALL поддерживать `tools/README.md` в согласованном состоянии с `README.md`, `INSTALL.md` и профильными документами из `docs/**`, если они упоминают канонические административные команды.

#### Scenario: Root-документ упоминает административную команду
- **WHEN** `README.md`, `INSTALL.md` или документ в `docs/**` ссылается на служебную команду сопровождения
- **THEN** эта команда совпадает с канонической формой из `tools/README.md`
- **AND** не описывается как ad hoc shell-фрагмент вместо официального `npm run ...`

### Requirement: Поле short в metadata change валидируется по кастомной схеме в режиме strict-v1

Система SHALL для changes с `short_policy: strict-v1` в `openspec/changes/<change>/.openspec.yaml` требовать для непустого `short` формат: первая буква — маленькая, длина — не более 75 символов, последний символ — не знак препинания.

#### Scenario: Разработчик задаёт корректное short в strict-v1 change
- **WHEN** в metadata change с `short_policy: strict-v1` задано непустое `short`, которое начинается с маленькой буквы, имеет длину до 75 символов и не заканчивается пунктуацией
- **THEN** статическая проверка OpenSpec metadata проходит успешно

#### Scenario: Разработчик задаёт short с нарушением формата в strict-v1 change
- **WHEN** в metadata change с `short_policy: strict-v1` задано непустое `short`, которое не начинается с маленькой буквы, длиннее 75 символов или заканчивается знаком препинания
- **THEN** статическая проверка OpenSpec metadata завершается ошибкой
- **AND** сообщение проверки явно указывает нарушенное правило

### Requirement: Change связан с главным техническим issue

Система SHALL для change в фазе технической проработки поддерживать явную связь с главным GitHub issue через поле `issue` в metadata change и обратную ссылку на change в описании issue.

#### Scenario: Change остаётся product-only без старта техпроработки
- **WHEN** change ещё не получил явную отмашку на техническую проработку
- **THEN** поле `issue` может быть пустым
- **AND** это не считается ошибкой схемы

#### Scenario: Активный change связан с issue в обе стороны
- **WHEN** разработчик открывает metadata change в техпроработке и соответствующий главный issue
- **THEN** в metadata задано поле `issue` с URL/номером issue
- **AND** в описании issue явно указан идентификатор change

### Requirement: Синхронизация продуктового и технического слоя отслеживается через review_sync_state

Система SHALL использовать поле `review_sync_state` (`none`, `needs-sync`, `needs-review`, `in-sync`) для фиксации актуальности между OpenSpec change и техническими issue.

#### Scenario: Изменился продуктовый контракт change
- **WHEN** обновлены требования/сценарии/acceptance criteria в change
- **THEN** `review_sync_state` переводится в `needs-sync`, если для change уже заведён `issue`
- **AND** остаётся `none`, если change всё ещё product-only без issue

#### Scenario: Существенно изменилась техническая постановка в issue
- **WHEN** в связанном issue изменены ключевые технические решения или декомпозиция реализации
- **THEN** `review_sync_state` переводится в `needs-review`

### Requirement: Закрытие change подтверждает согласованность трёх слоёв

Система SHALL при закрытии change требовать подтверждения согласованности между OpenSpec, связанными issue и фактическим кодом.

#### Scenario: Разработчик закрывает change
- **WHEN** разработчик переводит change в закрытый статус
- **THEN** связанные issue закрыты или явно перенесены в следующий change
- **AND** в change указаны результаты тестового каскада и ссылки на PR/коммиты
- **AND** добавлен краткий итог `planned vs built`

### Requirement: Change классифицируется по роли в продуктовой механике

Система SHALL в metadata change поддерживать поле `change_kind` со значением `focus`, `release`, `idea`, `research`, `dispatcher`, `implement` или `fix`.

#### Scenario: Создаётся новый product-only change
- **WHEN** разработчик создаёт новый change через `openspec:new`
- **THEN** metadata содержит `change_kind`
- **AND** по умолчанию `change_kind=idea`

#### Scenario: Создаётся focus change
- **WHEN** имя нового change начинается с префикса `focus-`
- **THEN** metadata содержит `change_kind=focus`
- **AND** metadata содержит `execution_mode=no-code`

#### Scenario: Создаётся release change
- **WHEN** имя нового change начинается с префикса `release-`
- **THEN** metadata содержит `change_kind=release`
- **AND** metadata содержит `execution_mode=no-code`

### Requirement: Роль change определяет обязательные связи и режим исполнения

Система SHALL валидировать согласованность полей `change_kind`, `execution_mode`, `parent_change`, `strategy_root`, `roadmap_ref`, `release_ref`, `verification_level` и `verification_command`.

#### Scenario: Создаётся dispatcher change
- **WHEN** metadata change содержит `change_kind=dispatcher`
- **THEN** `execution_mode` равен `no-code`
- **AND** задан `parent_change`
- **AND** задан `roadmap_ref`
- **AND** тип `parent_change` может быть любым, но пустой `parent_change` для dispatcher недопустим

#### Scenario: Создаётся implement change
- **WHEN** metadata change содержит `change_kind=implement`
- **THEN** `execution_mode` равен `code`
- **AND** задан `parent_change`
- **AND** `parent_change` указывает на change с `change_kind=dispatcher`
- **AND** задан `strategy_root` на стратегический change
- **AND** задан `verification_level`
- **AND** задан `verification_command`

#### Scenario: Создаётся fix change
- **WHEN** metadata change содержит `change_kind=fix`
- **THEN** `execution_mode` равен `code`
- **AND** задан `parent_change`

#### Scenario: Release используется как метка, а не как родитель
- **WHEN** metadata change содержит `change_kind=release`
- **THEN** `parent_change` пустой
- **AND** другие changes не используют этот change как `parent_change`
- **AND** любые changes могут ссылаться на release через `release_ref`

### Requirement: Старт реализации проходит через preflight-команду

Система SHALL перед началом реализации change использовать preflight-команду, которая блокирует прямую реализацию dispatcher и направляет работу в implement/fix changes.

#### Scenario: Разработчик пытается начать реализацию dispatcher
- **WHEN** запускается `npm run os:begin -- <dispatcher-change>`
- **THEN** команда завершает preflight с отказом в прямой реализации
- **AND** предлагает создать исполнительский change (`implement-*` или `fix-*`)

#### Scenario: Разработчик создаёт implement из dispatcher через preflight
- **WHEN** запускается `npm run os:begin -- <dispatcher-change> --spawn-implement <implement-change>`
- **THEN** создаётся исполнительский change
- **AND** в нём автоматически заполняются `parent_change` и `strategy_root` от dispatcher-контекста
