# Roadmap: Code Quality Text Subsystem

## Владелец

`focus-tech` владеет roadmap подсистемы текстовых quality-правил и предоставляет его `dispatcher-code-quality-text-subsystem`.

## Контур roadmap

- deterministic rules для читаемости кода;
- предсказуемые waiver-механизмы;
- отчётность по working/branch/repo scope;
- интеграция quality-проверок в review и change lifecycle.

## Когда нужен отдельный child change

- появляется новый класс текстовых quality-нарушений;
- нужен рефакторинг large legacy area под существующие правила;
- требуется отдельный инструментальный контур вокруг waiver, отчётности или review-policy.

## Требование к полезности

Roadmap обязан помогать решать, где нужен новый rule module, где достаточно cleanup wave, а где изменение должно остаться локальным refactor без нового dispatcher.
