## Миссия

- Что должен изменить этот change: исправить provider-specific диагностику `llm-network` на `/system`, чтобы пользователь видел реальный сетевой статус активного провайдера, а не результат probe с чужим endpoint или чужим API-ключом.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-bugfix
- strategy_root: focus-quality
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: bugfix уже локализован до diagnostic-layer `/system`: `addLlmResources()` использует общий `${endpoint}/models`, special-case только для `gemini`, а для остальных не-gemini веток в headers может уйти `OPENAI_API_KEY`, даже если активный provider — `claude` или `zai`.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию bugfix-потока держит `dispatcher-bugfix`; этот fix отвечает за точность provider probe и user-facing resource status.

## Обязательные источники

- openspec/changes/dispatcher-bugfix/proposal.md
- openspec/specs/llm/spec.md
- openspec/specs/resource-status/spec.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-llm-provider-network-diagnostics: `openspec/specs/claude/spec.md`, `openspec/specs/zai/spec.md`, `lib/system/resources/internalstate-sections.ts`, `lib/llm/providers/claude.ts`, `lib/llm/providers/zai.ts`, `test/unit/resource-status.test.ts`.

## Границы исполнения

- Что входит в этот change: привести `llm-network` к provider-aware probe contract: правильный probe URL, правильные auth headers и отсутствие fallback на чужой API key для `claude`/`zai` и других non-openai провайдеров.
- Что сознательно не входит в этот change: redesign `/system`, смена текстов всех resource cards, правка runtime LLM-запросов вне diagnostic probe.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: сама идея показывать LLM-готовность через системные ресурсы уже принята; fix меняет только correctness probe, а не продуктовый смысл диагностики.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit -- test/unit/resource-status.test.ts
- Что именно должен доказать результат проверки: `/system` больше не использует OpenAI-specific probe для чужих провайдеров; unit coverage явно проверяет provider-aware `llm-network` conditions как минимум для `claude` и `zai`.

## Открытые вопросы

- Нужно ли выносить probe-definition рядом с adapter config, чтобы status и runtime использовали один и тот же provider contract.
- Какой наименее инвазивный probe корректен для `claude` и `zai`: GET-ready endpoint, HEAD/GET `/models` либо минимальный безопасный POST.
