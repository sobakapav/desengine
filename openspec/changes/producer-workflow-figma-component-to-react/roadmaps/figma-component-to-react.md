# Roadmap: Figma Component To React

`producer-workflow-figma-component-to-react` ведёт roadmap отдельного workflow перевода выбранного Figma-компонента в базовый React-компонент.

## Что удерживает roadmap

- входом считается выбранный Figma-компонент или variant-group, а не весь проект;
- выходом считается базовый React-scaffold для дальнейшей доработки;
- линия не смешивается с общим импортом Figma-проекта;
- downstream changes должны отдельно закрывать входной контракт, React-результат и preview/workbench binding.
