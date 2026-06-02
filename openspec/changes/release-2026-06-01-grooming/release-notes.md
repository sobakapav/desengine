# Release Notes: release-2026-06-01-grooming

## Состав волны

- `implement-integration-test-runner-foundation`
- `implement-route-integration-fixture-wave`
- `fix-browser-verification-runtime`
- `fix-browser-wrapper-managed-dev-cleanup`
- `fix-level-3-description-visibility`
- `fix-next-dev-workspace-root-warning`
- `fix-preview-check-parity`
- `fix-check-reset-history-regression`
- `fix-safari-task-runtime-instability`
- `fix-sandpack-ui-dependency-resolution`
- `fix-sandpack-tailwind-preview-pipeline`
- `fix-check-result-before-next-level-screen`
- `fix-level-5-start-file-id-payload`
- `fix-iterate-timeout-feedback`
- `fix-codex-browser-verification-gate`
- `fix-deepseek-doc-contract`

## Назначение

Release фиксирует текущую grooming-волну integration-слоя как активный delivery-срез и заменяет historical release `release-2026-05-25-night` в metadata active changes.

## Изменения в релизе

### Актуальная сводка

- Для серверных сценариев появился отдельный integration-слой: важные API-пути теперь проверяются быстрее и без запуска браузера.
- Браузерные проверки стали надёжнее: инфраструктурные сбои теперь легче отличить от реальных ошибок продукта.
- Для Codex seatbelt закреплён безопасный путь browser verification, чтобы прямой sandboxed запуск больше не выдавал ложные browser-сбои за проблемы продукта.
- Закрытие browser-oriented fixes стало предсказуемее: обязательный browser preflight и канонический wrapper-path теперь не дают спутать инфраструктурный сбой с ошибкой продукта.
- Browser wrapper стабильнее переиспользует локальный dev-server и больше не должен срываться на ложном конфликте с уже поднятым `next dev`.
- В релиз включён весь активный bugfix-набор вокруг preview, проверки уровня и runtime-откликов, чтобы лаборатория не расходилась по отдельным локальным исправлениям.
- На рабочем экране третьего уровня снова видны подсказка задачи и полное пояснение уровня.
- Лишнее предупреждение `next dev` о неверном workspace root при нескольких lockfile убрано и больше не маскирует реальные проблемы запуска.
- Проверка задачи больше не должна проходить успешно, если preview уже сломан и не показывает рабочий результат.
- После сброса задачи или текущего уровня больше не подтягиваются старые уточнения и устаревший результат проверки.
- Сценарии задач в Safari стали стабильнее: меньше подвисаний, медленной навигации и внезапных падений страницы.
- Верстак и preview ведут себя стабильнее: загрузка тяжёлых частей стала мягче, а сообщения об ошибках понятнее.
- Все локально сохранённые project-настройки preview сейчас принудительно возвращаются к `shadcn/ui`, чтобы лаборатория не наследовала старые `ant`, `mui` или `html-tags` режимы.
- Исправлено двойное списание лимита за один пользовательский запрос.
- Синхронизация onboarding стала устойчивее для проектов, которые лежат на другом диске.
- Preview задач корректнее применяет нестандартные стили и ширину компонентов.
- Документация по DeepSeek обновлена: ограничения сценариев с изображениями теперь описаны прямо и без расхождений с реальным поведением.
- DeepSeek в сценариях с изображениями теперь сразу сообщает о неподдерживаемом vision-режиме, вместо того чтобы молча продолжать запрос без картинок.
- Карта тестового покрытия приведена в рабочее состояние: посторонние traceability-блокеры больше не мешают закрывать test-system fixes.
- Release-оформление приведено в более полный и согласованный вид.
