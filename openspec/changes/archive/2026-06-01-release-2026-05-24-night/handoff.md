## Миссия

- Собрать в один релизный поток fixes и follow-up changes, поднятые по пользовательскому документу жалоб.
- Этот change не меняет код сам по себе и не пересматривает решения dispatcher'ов; он фиксирует состав поставки.

## Унаследованный контекст

- parent_change: (не задан)
- strategy_root: (не задан)
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: release в этой схеме не становится владельцем стратегии и не подменяет parent dispatcher.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегия и тактика принадлежат соответствующим dispatcher/idea/fix changes; release отвечает только за релизную группировку.

## Обязательные источники

- openspec/changes/release-2026-05-24-night/proposal.md
- openspec/changes/dispatcher-bugfix/artifacts/2026-05-21-user-complaints-triage.md
- openspec/changes/dispatcher-openspec/design.md
- Какие ещё файлы и спецификации обязательны к чтению для release-2026-05-24-night: metadata и proposal всех fixes, которые получают `release_ref=release-2026-05-24-night`.

## Границы исполнения

- Что входит в этот change: создание релизной метки и фиксация состава night-wave.
- Что сознательно не входит в этот change: непосредственная реализация кода, изменение стратегических roadmap и пересмотр triage-решений dispatcher'ов.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: сами решения о bugfix/idea остаются у `dispatcher-bugfix`, `dispatcher-ux`, `dispatcher-doc` и `focus-quality`.

## Проверка результата

- verification_level: static/contract
- verification_command: npm run test:traceability
- Что именно должен доказать результат проверки: release change корректно оформлен и downstream changes могут ссылаться на него через `release_ref`.

## Открытые вопросы

- Нужно ли пополнять этот релиз новыми fixes, если по тому же документу появятся новые воспроизводимые жалобы.
