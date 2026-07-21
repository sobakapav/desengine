## Миссия

- Что должен изменить этот change: Сделать `UI kit adapter` отдельной явной сущностью системы, вынести поддержанные kit'ы в общий каталог Node.js внутри продукта, считать что зависимости kit'ов ставит и везёт сама система, кастомизацию не сохранять как ценность, а control управления UI kit вынести наверх страницы проекта.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-ui-kit
- strategy_root: focus-domain
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: `dispatcher-ui-kit` уже закрепил project-level выбор `uiKitId`, идею переключения kit'а без перезагрузки страницы и правило, что следующие kit'ы не добавляются автоматически, а только после producer-решения.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию держит `producer-ui-kit`, тактический контур и приёмку результата держит `dispatcher-ui-kit`, этот implement change отвечает за кодовую реализацию реестра адаптеров и верхнего project-facing control.

## Обязательные источники

- openspec/changes/dispatcher-ui-kit/proposal.md
- openspec/changes/dispatcher-ui-kit/design.md
- openspec/changes/dispatcher-ui-kit/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для implement-ui-kit-adapter-kit-node-js-kit-ui: `openspec/changes/producer-ui-kit/proposal.md`, `openspec/changes/producer-ui-kit/roadmaps/ui-kit-producer.md`, `openspec/specs/projects/spec.md`, `openspec/specs/ui-kit-adapters/spec.md`, `lib/project/ui-kit-config.ts`, `lib/project/runtime.ts`, `lib/project/compatibility.ts`, `components/desengine/project/ProjectOverviewScreen.tsx`, `components/desengine/project/projectSurface.ts`.

## Границы исполнения

- Что входит в этот change: явная системная сущность `UI kit adapter`; общий каталог встроенных адаптеров внутри продукта; перевод project surfaces на реестр; верхний control управления UI kit на странице проекта; продуктовая политика о system-owned установке и reset-on-update кастомизации.
- Что сознательно не входит в этот change: добавление новых candidate kit'ов из producer-memory; полноценная поддержка пользовательских внешних npm-install сценариев; сохранение и миграция ручной кастомизации kit'ов; отдельный visual editor для адаптеров.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться: project-level `uiKitId` как пользовательская настройка; отсутствие автодобавления kit'ов без producer-решения; переключение UI kit внутри project surface, а не через отдельный legacy экран.

## Проверка результата

- verification_level: unit
- verification_command: `npm run test:unit -- project-user-surface-foundation ui-kit-adapter-registry` и `npm run test:traceability`
- Что именно должен доказать результат проверки: реестр `UI kit adapter` существует как отдельная сущность со встроенной ownership-моделью; project page показывает верхний control управления UI kit; project/runtime surfaces читают поддержанные kit'ы через общий реестр, а не через разрозненные локальные константы.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: как именно назвать общий каталог встроенных kit'ов; какой минимальный adapter contract нужен сверх `id/title/dependencies`; где лучше всего показать политику system-owned установки и reset-on-update кастомизации; какие старые следы project-local ui-kit config стоит оставить как facade ради безопасной миграции.
