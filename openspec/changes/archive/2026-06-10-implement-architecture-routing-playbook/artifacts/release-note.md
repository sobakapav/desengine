## Что меняется для пользователя:

Появляется практический playbook маршрутизации архитектурных changes, который помогает отличать ownership `dispatcher-architecture` от ownership предметных dispatcher-линий.

## Как это влияет на пользователя:

Менеджеру проекта проще быстро понять, какой change нужно создавать: architectural или предметный. Это снижает риск спутать ownership, отправить работу не тому parent owner и породить лишний или неправильный downstream change.

## Как проверить:

Проверить, что в change `implement-architecture-routing-playbook` есть документы с routing-, naming- и boundary-guidance, а release note объясняет для менеджера проекта, как избежать путаницы ownership и неверной диспетчеризации новых changes.
