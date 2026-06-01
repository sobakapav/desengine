## Миссия

- Собрать в один релизный поток ночную волну fixes, созданных по triage пользовательского документа жалоб.
- Этот change не меняет код сам по себе и не пересматривает тактические решения dispatcher'ов; он фиксирует состав поставки.

## Унаследованный контекст

- parent_change: (не задан)
- strategy_root: (не задан)
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: release работает как горизонтальная метка поставки и не меняет `parent_change` у дочерних fixes.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегия и тактика принадлежат соответствующим dispatcher'ам; release отвечает только за релизную группировку.

## Обязательные источники

- openspec/changes/release-2026-05-21-night/proposal.md
- openspec/changes/dispatcher-bugfix/artifacts/2026-05-21-user-complaints-triage.md
- openspec/changes/dispatcher-openspec/design.md
- Какие ещё файлы и спецификации обязательны к чтению для release-2026-05-21-night: metadata и proposal всех fixes, включённых в этот релиз.

## Границы исполнения

- Что входит в этот change: создание релизной метки, фиксация состава fixes и связки между triage жалоб и downstream changes.
- Что сознательно не входит в этот change: непосредственная реализация кода, изменение стратегических roadmap и переопределение владельцев багов.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: сами решения о bugfix/doco-fix лежат в `dispatcher-bugfix` и `dispatcher-doc`; release их не переписывает.

## Проверка результата

- verification_level: static/contract
- verification_command: npm run test:traceability
- Что именно должен доказать результат проверки: release change корректно оформлен и downstream fixes могут ссылаться на него через `release_ref`.

## Открытые вопросы

- Нужно ли под этот релиз позднее добавить ещё fixes, если в том же документе появятся новые воспроизводимые жалобы.
