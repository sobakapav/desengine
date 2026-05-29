## Контекст

Канонический file-set level 3 уже определён в действующих контрактах и части onboarding-контента как `Component.tsx` + `styles.ts`. Однако текстовый guidance дрейфует: в нескольких `tip.md` сохранились legacy-имена `style.ts` и даже опечатка `style.scc`.

Это не просто редакционная мелочь. Для пользователя level 3 является обучающим маршрутом, и именно текст подсказок формирует ожидаемую структуру файлов. Если hints подталкивают к `style.ts`, а hidden check и runtime ждут `styles.ts`, система создаёт самопротиворечивый UX.

## Решение

1. Принять `styles.ts` как единственное допустимое имя style-файла во всех user-facing текстах level 3.
2. Просмотреть level-3 guidance-слой целиком:
   - `onboarding/levels/level-3/overview.md`;
   - `onboarding/prompts/levels/level-3/check.njk`;
   - `onboarding/tasks/**/levels/level-3/tip.md`.
3. Удалить или переписать legacy-формулировки так, чтобы они:
   - не называли `style.ts` корректным вариантом;
   - не оставляли двусмысленности про required file-set;
   - не конфликтовали с hidden check и OpenSpec specs.
4. Зафиксировать регрессионную проверку на content-contract уровне: level-3 guidance не должен содержать `style.ts` как допустимую цель.

## Проверочный слой

- Затронутые capability/scenario:
  - `component-file-set` / сценарии про канонический набор файлов уровня;
  - `level-labs` / сценарии про редактируемые файлы и guidance level 3;
  - onboarding guidance contract для скрытой проверки и task tips.
- Предпочтительный уровень проверки: `unit`.
- Команда: `npm run test:unit -- test/unit/onboarding-level-3-style-guidance.test.ts`

Если исполнитель временно не добавляет test в этом change, нужно явно отразить долг в `test/traceability/coverage-plan.json` с причиной, почему content-contract пока держится только ручной ревизией.
