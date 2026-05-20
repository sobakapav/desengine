# Change: research-ui-kit

## Зачем

Нужен отдельный верхнеуровневый исследовательский поток по направлению UI kit, чтобы диспетчерские и fix/implement changes опирались на единый корневой контекст, а не были вложены в feature-фокус.

## Что меняется

- Вводится change `research-ui-kit` как change первого уровня (без родителя).
- `dispatcher-ui-kit` становится дочерним к `research-ui-kit`.
- Дальнейшие fix/implement changes по UI kit наследуют этот root через `dispatcher-ui-kit`.
