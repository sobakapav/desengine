## Миссия

- Что должен изменить этот change: убрать из level 3 onboarding остаточные подсказки про `style.ts` и выровнять весь user-facing guidance на каноническое имя `styles.ts`.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-bugfix
- strategy_root: focus-quality
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: базовый bugfix-dispatcher уже отделил проблемы runtime/diagnostics от чисто пользовательских дефектов onboarding guidance. Hidden check `onboarding/prompts/levels/level-3/check.njk` и overview `onboarding/levels/level-3/overview.md` уже смотрят на `styles.ts`, но task tips всё ещё содержат legacy-имя `style.ts`.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию bugfix-линии держит `dispatcher-bugfix`; этот fix отвечает за узкий onboarding guidance contract level 3.

## Обязательные источники

- openspec/changes/dispatcher-bugfix/proposal.md
- openspec/specs/component-file-set/spec.md
- openspec/specs/level-labs/spec.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-level-3-style-guidance-contract: `onboarding/levels/level-3/overview.md`, `onboarding/prompts/levels/level-3/check.njk`, `onboarding/tasks/**/levels/level-3/tip.md`, archive change `openspec/changes/archive/2026-05-24-fix-level-3-hidden-check-style-file/`, `test/README.md`.

## Границы исполнения

- Что входит в этот change: найти и убрать все user-facing level-3 подсказки, которые называют правильным файлом `style.ts` вместо `styles.ts`; выровнять guidance с hidden check, overview и действующим OpenSpec-контрактом; предусмотреть автоматическую регрессионную проверку этого content-contract.
- Что сознательно не входит в этот change: изменение runtime file-set, переработка логики hidden check, переписывание содержания onboarding levels за пределами дефекта имени файла.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: канонический file-set level 3 уже определён как `Component.tsx` + `styles.ts`; change не должен возвращать поддержку `style.ts` как допустимого имени.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit -- test/unit/onboarding-level-3-style-guidance.test.ts
- Что именно должен доказать результат проверки: user-facing guidance level 3 больше не содержит `style.ts` как допустимый файл; hidden check, overview и task tips согласованы на `styles.ts`, а регрессия ловится автоматически или явно оформлена как coverage debt.

## Выполнено в этом change

- Просканирован слой `onboarding/tasks/**/levels/level-3/tip.md`; единственный актуальный legacy-trace найден в `onboarding/tasks/dipole-button/levels/level-3/tip.md`.
- В `onboarding/tasks/dipole-button/levels/level-3/tip.md` убрано указание на ошибочное имя `style.scc`; подсказка теперь закрепляет только канонический `styles.ts`.
- Добавлен unit content-contract test `test/unit/onboarding-level-3-style-guidance.test.ts`, который:
  - проверяет `onboarding/levels/level-3/overview.md`;
  - проверяет `onboarding/prompts/levels/level-3/check.njk`;
  - сканирует все существующие `onboarding/tasks/**/levels/level-3/tip.md`;
  - запрещает возврат `style.ts` и `style.scc` в user-facing guidance level 3.

## Затронутые файлы

- `onboarding/tasks/dipole-button/levels/level-3/tip.md`
- `test/unit/onboarding-level-3-style-guidance.test.ts`
- `openspec/changes/fix-level-3-style-guidance-contract/tasks.md`
- `openspec/changes/fix-level-3-style-guidance-contract/handoff.md`

## Шаги для внешнего верификатора

- Прочитать `onboarding/levels/level-3/overview.md`, `onboarding/prompts/levels/level-3/check.njk` и `onboarding/tasks/dipole-button/levels/level-3/tip.md`, чтобы убедиться, что user-facing guidance везде использует только `styles.ts`.
- Запустить `npm run test:unit -- test/unit/onboarding-level-3-style-guidance.test.ts`.
- При необходимости выборочно проверить соседние `onboarding/tasks/**/levels/level-3/tip.md`: regression уже сканирует их glob-обходом, поэтому ручная проверка нужна только как дополнительная приёмка текста.
