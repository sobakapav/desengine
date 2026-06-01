## Миссия

- Что должен изменить этот change: создать producer-контур, который исследует утечки и деградации скорости, задаёт рамки допустимой нагрузки и организует downstream-работы по этому направлению.
- Этот change не меняет код напрямую и не подменяет собой downstream dispatcher/implement/fix ветки.

## Унаследованный контекст

- parent_change: focus-quality
- strategy_root: focus-quality
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: `focus-quality` уже задаёт общий стратегический контур качества, устойчивости и проверяемости; новый producer должен занять в нём отдельную нишу скорости и нагрузки.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию держит `focus-quality`, тактику этого направления и состав downstream-работ держит `producer-speed-and-load`, приёмка идёт через traceability и дальнейшую постановку downstream dispatcher changes.

## Обязательные источники

- openspec/changes/focus-quality/proposal.md
- openspec/changes/focus-quality/design.md
- openspec/changes/focus-quality/tasks.md
- openspec/changes/focus-quality/roadmaps/runtime-speed-quality.md
- openspec/specs/admin-tools/spec.md
- Какие ещё файлы и спецификации обязательны к чтению для producer-speed-and-load: active changes и roadmap'ы, уже связанные с runtime, quality, test-system и bugfix-dispatching.

## Границы исполнения

- Что входит в этот change: исследование симптомов и гипотез, рамка допустимой нагрузки, producer-owned roadmap, план downstream dispatcher-работ, требования к тестовой постановке будущих behavior changes.
- Что сознательно не входит в этот change: прямые runtime-исправления, кодовые оптимизации, нагрузочные механизмы, финальные цифры без данных.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: стратегический owner-контур качества уже принадлежит `focus-quality`; конкретная delivery-реализация должна идти через downstream changes.

## Проверка результата

- verification_level: static
- verification_command: npm run test:traceability
- Что именно должен доказать результат проверки: новый producer корректно встроен в active OpenSpec topology, имеет собственный roadmap и задаёт осмысленную рамку для downstream-работ по speed-and-load.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: какие симптомы уже подтверждены; какие профили нагрузки приоритетны; каких измерений сейчас не хватает; какие dispatcher-направления нужно запускать первыми.
