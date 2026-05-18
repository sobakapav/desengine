## ADDED Requirements

### Requirement: Help-контент защищён route-level access guard

Система SHALL применять существующий route-level access guard ко всем пользовательским help entry points, включая каталог, Markdown-страницы, страницу ошибки, картинки и Mermaid-страницы.

#### Scenario: Пользователь без доступа открывает help-страницу
- **WHEN** пользователь без действующего допуска открывает `/help`, `/help/[helpId]`, `/help/error` или `/help/mermaid/[mermaidId]`
- **THEN** route entry point проверяет доступ через `requireAccessOrRedirect`
- **AND** при отсутствии доступа выполняется redirect в auth-flow

#### Scenario: Браузер без доступа запрашивает help asset
- **WHEN** браузер без действующего допуска запрашивает `/help/images/[imgId]`
- **THEN** route handler проверяет доступ через `requireAccessOrUnauthorizedResponse`
- **AND** при отсутствии доступа возвращает `401`

