## Why

Жалоба по `otvinta-badge-counter` показывает системный defect hidden-check слоя: проверка требует колокольчик, которого нет ни в task hint, ни на wireframe, а при повторной проверке того же кода может вернуть уже другую основную причину ошибки.

Подтверждённый анализ:
- [base.png](/Users/op/dev/sobakapav/desengine/onboarding/tasks/otvinta-badge-counter/base.png) и [variants.png](/Users/op/dev/sobakapav/desengine/onboarding/tasks/otvinta-badge-counter/variants.png) не содержат колокольчика;
- [tip.md](/Users/op/dev/sobakapav/desengine/onboarding/tasks/otvinta-badge-counter/levels/level-1/tip.md) говорит только о круглом счётчике и диапазоне `0..99`;
- hidden check уровня строится на общем [check.njk](/Users/op/dev/sobakapav/desengine/onboarding/prompts/levels/level-1/check.njk) и LLM-оценке по изображениям и коду без task-specific stabilizer.

Для пользователя это выглядит как недостоверная проверка: валидатор спорит с самим заданием и плавает между разными объяснениями одного и того же результата.

## What Changes

- Выровнять hidden check с task contract и фактическими asset-ами задачи.
- Добавить стабилизацию проверки для task-specific случаев, где общий prompt недостаточен.
- Сделать причины провала более детерминированными и привязанными к явным условиям задачи.

## Non-goals

- Не переписывать всю систему hidden checks на rule engine одним change.
- Не менять сами wireframe-ассеты задачи без доказательства, что ошибка в них.
- Не считать любую неудачную оценку исключительно “плохой моделью”.

## Impact

- Hidden check перестанет требовать несуществующие элементы.
- Пользователь будет получать объяснения, совпадающие с текстом задачи и wireframe.
