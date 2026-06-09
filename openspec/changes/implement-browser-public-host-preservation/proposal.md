## Why

При обращении к dev-серверу по публичному домену или IP browser/dev wrapper может нормализовать base URL к `127.0.0.1` и тем самым ломать проверку сценариев, которые должны оставаться на исходном host/domain.

Нужен отдельный implement change, который сохранит публичный host как часть verification/runtime contract и разведёт bind-host сервера и public base URL для browser flow.

## What Changes

- Ввести явный contract для public browser base URL в browser/dev wrapper.
- Развести понятия bind-host и public host/domain.
- Запретить неявную подмену публичного host на localhost без явного opt-in или специального managed fallback.
- Обновить browser verification contract и связанные тесты/документацию.

## Impact

- Browser verification и dev wrapper перестанут незаметно менять домен пользователя на localhost.
- Внешние dev-сценарии по публичному IP/domain станут воспроизводимее и понятнее.
- Команда сможет отличать реальные product/browser regressions от дефектов host normalization в tooling.
