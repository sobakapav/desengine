## Решение

Приоритеты:

1. Чинить маленькие нарушения локальной декомпозицией.
2. Не переписывать UI kit/vendor-style файлы и крупные runtime-монолиты механически.
3. Для risky legacy добавлять waiver с владельцем `team-desengine`, причиной и target stage cleanup.
4. Не менять install-critical инфраструктуру.
