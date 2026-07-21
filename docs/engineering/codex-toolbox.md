# Codex toolbox

## Базовые поверхности

- `AGENTS.md` - долговременные правила репозитория.
- `.codex/config.toml` - repo-local настройки Codex.
- `.codex/skills/**` - проектные повторяемые workflows.
- MCP/connectors - живые внешние данные и действия.

## Skills

Проектные skills нужны для повторяемых проверок:

- `electron-security-review`;
- `figma-plugin-flow-review`;
- `protocol-design-review`;
- `ui-player-design-review`;
- `desktop-release-checklist`.

Skills не должны заменять OpenSpec. Они помогают агенту выполнять повторяемую работу одинаково.

## MCP и connectors

Минимально полезные подключения:

- GitHub - issues, PR, release notes, CI status.
- Figma - актуальный дизайн-контекст, file/node data, Dev Mode/context tooling, если доступно.
- OpenAI docs - актуальная документация по Codex/OpenAI.
- Browser/Playwright - UI smoke и визуальная проверка после появления приложения.

Figma MCP нужен не только для документации. Документация Figma читается из официальных docs, а MCP полезен для живого доступа к рабочим Figma-данным, если выбранный сервер это поддерживает.

## Правило выбора

- Если нужна повторяемая процедура - skill.
- Если нужны живые данные или действия во внешней системе - MCP/connector.
- Если нужно repo-level правило - `AGENTS.md`.
- Если нужна настройка среды Codex - `.codex/config.toml`.
