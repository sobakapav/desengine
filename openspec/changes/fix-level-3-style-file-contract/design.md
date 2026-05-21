## Context

Это не косметическая опечатка, а contract mismatch между учебным текстом и hidden check flow уровня.

## Goals

- Сделать имя style-файла единым во всех артефактах уровня 3.
- Убрать ложные failures и путаницу при проверке.

## Non-goals

- Не менять общий file-set levels без необходимости.

## Decisions

1. Канонический файл должен соответствовать уже действующему workbench/file-set контракту.
2. Правка может ограничиться onboarding-текстами и prompt artifacts, если runtime уже согласован.
