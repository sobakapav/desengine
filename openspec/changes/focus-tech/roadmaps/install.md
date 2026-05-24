# Roadmap: Install

## Владелец

`focus-tech` владеет roadmap локальной установки, setup-flow и системных preflight-проверок и поддерживает его для `dispatcher-install`.

## Контур ответственности

- первичная локальная установка;
- smoke/preflight-checks;
- локальная конфигурация и install-time tooling;
- onboarding sync как часть setup-потока;
- диагностика локального системного состояния перед запуском продукта.

## Потоки работ

- `producer-*`: собрать карту install pain points и evidence по setup-регрессиям;
- `dispatcher-*`: выделить отдельные install-подсистемы, если они начнут развиваться независимо;
- `fix-*`: устранять подтверждённые проблемы setup/tooling/diagnostics.

## Критерий полезности

Roadmap считается рабочим, если по нему можно понять, какой setup-сигнал относится к документации, какой к tooling/runtime, а какой уже должен стать проверяемым fix change.
