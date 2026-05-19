## 1. Спеки и контракт

- [ ] 1.1 Обновить delta `level-labs` для level-specific Sandpack App templates
- [ ] 1.2 Зафиксировать совместимый fallback для уровней без собственного template на время миграции
- [ ] 1.3 Указать тестовую трассировку change: capability/scenarios, уровень проверки и команды запуска

## 2. Resolver и runtime-слой

- [ ] 2.1 Вынести hardcoded `App.tsx` из `lib/lab/sandpack-preview.ts` в отдельный shared fallback-template
- [ ] 2.2 Добавить resolver уровня для `onboarding/levels/<levelId>/sandpack/App.tsx`
- [ ] 2.3 Передавать template source в builder Sandpack payload без изменения user-file flow
- [ ] 2.4 Добавить unit/contract тесты на выбор level template и fallback

## 3. Миграция уровня 1

- [ ] 3.1 Добавить `onboarding/levels/level-1/sandpack/App.tsx`
- [ ] 3.2 Подключить level 1 к новому resolver-слою
- [ ] 3.3 Проверить, что preview уровня 1 сохраняет текущий render flow

## 4. Миграция уровня 2

- [ ] 4.1 Добавить `onboarding/levels/level-2/sandpack/App.tsx`
- [ ] 4.2 Подключить level 2 к новому resolver-слою
- [ ] 4.3 Зафиксировать тестами, что уровень 2 получает собственный template, а не shared fallback

## 5. Завершение и follow-up

- [ ] 5.1 Обновить authoring notes для новых level templates, если без этого трудно масштабировать подход
- [ ] 5.2 Оставить список следующих кандидатов на миграцию после уровней 1-2 без обязательного переноса в этом change

## Тестовая часть change

- [ ] Указать затронутые OpenSpec capability/scenarios: `level-labs` и сценарии выбора template по уровню
- [ ] Выбрать уровень проверки: unit/contract для resolver/payload, component/browser smoke для preview уровней 1-2
- [ ] Добавить или обновить тесты в общем слое тестирования
- [ ] Зафиксировать команду проверки: `npm run test:unit -- test/unit/sandpack-preview.test.ts test/unit/sandpack-template.test.ts`
- [ ] Зафиксировать команду проверки: `npm run test:traceability`
- [ ] Описать mock/fixture-данные: onboarding-уровни `level-1`, `level-2`; live credentials не нужны
- [ ] Если browser smoke откладывается, добавить запись в `test/traceability/coverage-plan.json` с причиной и этапом закрытия
