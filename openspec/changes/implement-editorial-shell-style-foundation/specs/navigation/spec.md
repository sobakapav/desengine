## MODIFIED Requirements

### Requirement: Navigation использует editorial surface вместо компактного чёрного бара

Система SHALL рендерить `Navigation` как editorial navigation surface с outlined items и inversion-based active-state вместо компактного сплошного чёрного бара.

#### Scenario: Пользователь видит глобальную навигацию продукта
- **WHEN** product-shell страница отрисована
- **THEN** `Navigation` встроена в общий editorial shell
- **AND** использует светлую поверхность с тонкой тёмной рамкой
- **AND** показывает навигационные элементы как outlined tabs или buttons
- **AND** активный элемент выделяет инверсией `тёмная заливка + светлый текст`

#### Scenario: Команда добавляет новый top-level navigation item
- **WHEN** в `Navigation` появляется новая продуктовая точка входа
- **THEN** она получает тот же editorial navigation treatment, что и остальные элементы
- **AND** не вводит отдельный локальный visual contract только для себя
