## Миссия

- Что должен изменить этот change: устранить ситуацию, в которой активный `DeepSeek`-адаптер принимает image-bearing `start`/`iterate`/`check` запрос, но молча выбрасывает изображения и продолжает отвечать как будто визуальный контекст был передан.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-bugfix
- strategy_root: focus-quality
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: `dispatcher-bugfix` уже зафиксировал, что bugfix должен исправлять воспроизводимый пользовательский дефект, а не расширять feature scope. Для этого defect уже собран evidence: активный локальный provider — `deepseek`, а `lib/llm/providers/deepseek.ts` подменяет image-bearing вызов текстовой оговоркой `Изображения текущего уровня в этом вызове недоступны`.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегия bugfix-потока остаётся у `dispatcher-bugfix`; этот fix отвечает за локальный runtime/provider boundary и за доказательство того, что image-dependent task flow больше не деградирует silently.

## Обязательные источники

- openspec/changes/dispatcher-bugfix/proposal.md
- openspec/specs/iteration/spec.md
- openspec/specs/llm/spec.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-deepseek-vision-contract: `openspec/specs/deepseek/spec.md`, `lib/llm/providers/deepseek.ts`, `lib/task/actions/start-stage.ts`, `lib/task/actions/iterate.ts`, `lib/task/actions/check.ts`, `test/unit/llm.server.deepseek.test.ts`, `test/unit/llm-flow-source-contract.test.ts`.

## Границы исполнения

- Что входит в этот change: восстановить корректный контракт image-bearing LLM-вызовов для DeepSeek в task runtime; либо передавать изображения в поддерживаемом формате, либо явно и заранее блокировать image-dependent flow понятной ошибкой и системной диагностикой вместо silent degradation.
- Что сознательно не входит в этот change: смена глобального LLM-провайдера по умолчанию, redesign prompt builder, пересмотр task-level contracts и любые unrelated UI-изменения вне ошибок обратной связи.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: общий contract итерации уже требует передавать level-разрешённые картинки; fix не должен ослаблять этот contract ради удобства адаптера.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit -- test/unit/llm.server.deepseek.test.ts
- Что именно должен доказать результат проверки: DeepSeek больше не принимает image-bearing task-запрос как текст-only вызов без явного отказа; unit coverage фиксирует либо реальную передачу изображений, либо fail-fast с понятной ошибкой ещё до выполнения пользовательской итерации.

## Открытые вопросы

- Поддерживает ли текущий runtime-режим DeepSeek передачу PNG в используемом endpoint, или для image-dependent flow нужен явный запрет/guardrail.
- Нужно ли отражать vision support как отдельную capability в `/system`, чтобы пользователь видел несоответствие до запуска `start`/`iterate`.
