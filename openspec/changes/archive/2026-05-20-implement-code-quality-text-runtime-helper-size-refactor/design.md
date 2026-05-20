## Решение

Декомпозиция должна быть поведенчески нейтральной:

- public exports `lib/onboarding/server.ts` и `lib/system/resources/internalstate.ts` сохраняются;
- тексты статусов и resource ids не меняются;
- сетевые проверки остаются в прежнем порядке вызова;
- live credentials не нужны, проверки идут через существующие unit/full команды.
