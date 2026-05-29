## Контекст

Проверка уровня сейчас получает:
- общий production/didactic prompt;
- level-specific check prompt;
- картинки текущего уровня;
- текущее состояние рабочих файлов.

Но она не получает достаточно сильной task-specific рамки о том, что именно считается обязательным в конкретной задаче. В результате модель может “считать” на картинке лишний элемент или дрейфовать между альтернативными объяснениями одной и той же ошибки.

`otvinta-badge-counter` показателен: images и tip описывают badge counter, а не notification badge с колокольчиком. Следовательно, проблема не в неточности жалобы, а в отсутствии устойчивого task-check contract.

## Решение

1. Найти минимальный источник task-specific check truth:
   - task hint;
   - task config/metadata;
   - отдельный check template/rubric.
2. Для задач, где общий level-check недостаточен, ввести явный stabilizer:
   - task-level hidden check template;
   - либо структурированный rubric/context, который жёстко перечисляет обязательные элементы.
3. Зафиксировать порядок приоритета:
   - task contract и wireframe assets выше модельных домыслов.
4. Добавить регрессионную проверку на кейс `otvinta-badge-counter` и похожие дрейфы причин ошибки.

## Проверочный слой

- Затронутые capability/scenario:
  - `llm` / hidden check текущего уровня;
  - `task` / итоговая проверка результата;
  - onboarding task hints и task-specific rubrics.
- Уровень проверки: `unit`.
- Команда: `npm run test:unit -- test/unit/task-check-contract-drift.test.ts`

Если реализация потребует task-specific hidden check templates, тест обязан доказывать, что check не придумывает обязательные элементы вне wireframe/task contract.
