## Why

Сейчас Sandpack preview собирает единый жёстко зашитый `/App.tsx` в `lib/lab/sandpack-preview.ts`. Это удобно для первого запуска runtime, но дальше начинает мешать:

- уровень не может определять собственную preview-обвязку;
- логика layout и render-shell размазана по runtime-коду, а не живёт рядом с level-контрактом;
- миграция уровней на разные сценарии рендера превращается в правку общего билдера вместо локальной эволюции уровня;
- первые два уровня нельзя аккуратно перевести на разные Sandpack-shell без роста условной логики в одном файле.

Нужен level-owned способ задавать Sandpack `App` template, который позволит перевозить уровни по одному, не ломая остальной preview.

## What Changes

- Добавляем отдельный слой level-specific шаблонов `App` для Sandpack-preview.
- Фиксируем, что каноническое место хранения шаблона принадлежит onboarding-уровню, а не runtime-коду.
- Вводим resolver preview-шаблона по `levelId`, чтобы Sandpack payload собирался из шаблона уровня и общих runtime-файлов.
- Отделяем общий runtime preview от level-owned `App.tsx`: общий слой отвечает за Sandpack wiring, level-слой отвечает за layout и способ встраивания `Component`.
- Разрешаем поэтапную миграцию: уровни без собственного шаблона временно используют совместимый shared fallback.
- Переводим на новую схему первые два уровня как стартовый срез миграции.

## Capabilities

### Modified Capabilities

- `level-labs`: лаборатория уровня начинает определять собственный Sandpack `App` template и способ render-обвязки результата.

## Impact

- Onboarding-данные: в `onboarding/levels/<levelId>/` появляется подпапка с Sandpack-template файлами.
- Runtime: `lib/lab/sandpack-preview.ts` перестаёт быть единственным владельцем `/App.tsx`.
- API preview: route подготовки Sandpack payload должен учитывать текущий `levelId`.
- Тесты: понадобятся contract/unit проверки resolver-а шаблонов и миграции уровней 1-2, плюс traceability для `level-labs`.
