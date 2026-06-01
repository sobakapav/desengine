# Roadmap: UI Kit Producer

`producer-ui-kit` ведёт roadmap продуктовых ожиданий к UI kit-направлению.

- Определяет целевые свойства kit, но не реализует их напрямую.
- Передаёт тактическую упаковку и delivery в dispatcher-ui-kit и соседние dispatcher changes.
- Различие между producer-ожиданием и dispatcher-планом сохраняется явно.

## Candidate memory

Producer хранит список kit'ов, которые стоит периодически переоценивать, но не подключать автоматически заранее:

- `align-ui`
- `base-ui`
- `chakra-ui`
- `heroui`
- `mantine`
- `primereact`
- `radix-ui`
- `react-aria`
- `reshaped`

Для каждого кандидата producer должен отдельно ответить на два вопроса:

- как именно его подключать в текущую модель Sandpack/project-level switching;
- когда именно его подключение становится продуктово оправданным.

Пока на эти вопросы нет ответа, кандидат остаётся частью producer-memory, а не поводом для `implement`-change.
