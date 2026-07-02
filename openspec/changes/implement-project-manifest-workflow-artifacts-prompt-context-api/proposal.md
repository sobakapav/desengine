## Why

Сейчас архитектурные модули проекта в основном несут ценность только внутренней реализации: `storage-adapter`, `workflow`, `prompt-context`, `artifacts` и `app/api/**` помогают команде держать порядок, но почти не дают пользователю новых объектов владения, переноса, автоматизации и повторного использования.

Нужна волна, в которой те же самые границы начинают работать как продуктовые активы: проект становится переносимым пакетом, workflow становится повторяемым рецептом работы, artifacts становятся явными рабочими материалами, prompt context становится редактируемым брифом, а API появляется только вокруг сущностей, которые действительно полезны пользователю.

## What Changes

- Ввести переносимый `project manifest` как внешний контракт проекта с импортом и экспортом.
- Ввести user-facing `project API` только вокруг ценных продуктовых сущностей: project manifest, workflow templates, artifacts и prompt brief.
- Перевести `artifacts` из скрытого архитектурного слова в явную проектную библиотеку рабочих материалов.
- Перевести `workflow` из explainability/readout слоя в слой шаблонов и рецептов проектной работы.
- Перевести `prompt context` в редактируемый рабочий бриф, который пользователь может читать и сохранять.
- Изменить `projects` и `storage-adapter`, чтобы они обслуживали эти внешние контракты, а не только browser-local внутреннее состояние.
- Реализацию разбить на волны, начиная с самой дешёвой и наблюдаемой: manifest/import-export, project API foundation и первые project-facing поверхности для brief/artifacts/workflow template.

## Capabilities

### New Capabilities

- `project-manifest`: переносимый манифест проекта, его формат, импорт и экспорт.
- `project-api`: внешний API вокруг project-owned сущностей, пригодный не только для внутренних route handler.

### Modified Capabilities

- `projects`: проектная поверхность получает manifest, artifact library, workflow template и prompt brief как пользовательские объекты.
- `workflow`: workflow может жить как reusable recipe/template, а не только как readout состояния.
- `artifacts`: artifacts становятся явным пользовательским слоем проекта.
- `prompt-context`: prompt context получает редактируемый и наблюдаемый brief-слой.
- `storage-adapter`: storage boundary обслуживает import/export и portable project contract, а не только browser-local persistence.

## Impact

- `components/desengine/project/**`
- `lib/project/**`
- `lib/prompt/**`
- `app/api/**`
- `openspec/specs/projects/spec.md`
- `openspec/specs/workflow/spec.md`
- `openspec/specs/artifacts/spec.md`
- `openspec/specs/prompt-context/spec.md`
- `openspec/specs/storage-adapter/spec.md`
- новые capability specs для `project-manifest` и `project-api`
