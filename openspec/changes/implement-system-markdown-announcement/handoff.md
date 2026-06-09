## Миссия

- Что должен изменить этот change: встроить в системную страницу блок анонса, который показывает пользователю Markdown-новость из внешнего конфигурируемого источника уже при загрузке системы.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-ux
- strategy_root: focus-quality
- release_ref: release-2026-06-09-ui
- producer_ref: (не задан)
- Что из родительского change уже решено: `dispatcher-ux` уже закрепил этот контур как прямой UX-change и требует оформлять пользовательские улучшения системной поверхности как downstream implement changes с явной тестовой частью.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию держит `focus-quality`, тактику UX-линии держит `dispatcher-ux`, итоговую приёмку делает внешний проверяющий, а не сам исполнитель change.

## Обязательные источники

- `openspec/changes/dispatcher-ux/proposal.md`
- `openspec/changes/dispatcher-ux/design.md`
- `openspec/specs/navigation/spec.md`
- `openspec/specs/resource-status/spec.md`
- Какие ещё файлы и спецификации обязательны к чтению для implement-system-markdown-announcement: `app/page.tsx`, `app/system/page.tsx`, `components/desengine/system/SystemScreen.tsx`, `components/desengine/system/MarkdownContent/MarkdownContent.tsx`, `lib/system/config/server.ts`, `lib/system/resources/internalstate.ts`

## Границы исполнения

- Что входит в этот change: UX-блок внешнего Markdown-анонса на системной странице, конфигурация его источника, загрузка контента и понятный пользовательский fallback.
- Что сознательно не входит в этот change: полноценная CMS, новостная лента, отдельный редактор анонсов, install-critical изменения стека и произвольный rework системной диагностики.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: необходимость прямого UX-улучшения уже принята `dispatcher-ux`; change не должен спорить с ownership и не должен подменять ресурсную диагностику системой новостей.

## Проверка результата

- verification_level: component/browser
- verification_command: `npm run test:traceability`
- Что именно должен доказать результат проверки: интеграция описана в traceability и получает явный browser/component способ проверки; финальный запуск и verdict делает внешний проверяющий.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: какой URL-ключ конфигурации использовать; нужен ли server-side proxy/route или достаточно прямого server fetch; какой fallback-текст допустим, если внешний источник недоступен.
