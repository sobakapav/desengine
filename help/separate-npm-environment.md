# Отдельное npm-окружение для задачника

Как мне установить npm? У меня уже есть рабочий, как сделать рабочий и ваш, чтобы ничего не сломалось?

### 1. Переименовать старый глобальный .npmrc
   
`mv ~/.npmrc ~/.npmrc-backup`

Это отключит старые настройки npm, но сохранит их как резервную копию.

### 2. Создать отдельный npm-конфиг для задачника
   
`nano ~/.npmrc-desengine`

Вставить туда:

`registry=https://registry.npmjs.org/`
`save-exact=true`

Сохранить:

`Ctrl + O`
`Enter`
`Ctrl + X`

### 3. Создать алиас для запуска npm с этим конфигом

Открыть `.zshrc`:

`nano ~/.zshrc`

Если файла нет — он создастся.

Добавить строку:

`alias npm-desengine='NPM_CONFIG_USERCONFIG=~/.npmrc-desengine npm'`

Сохранить и применить:

`source ~/.zshrc`

### 4. Проверить, что окружение работает

`npm-desengine config get registry`

Должно быть:
https://registry.npmjs.org/

### 5. Устанавливать зависимости задачника только так.

Перейти в папку задачника:

`cd путь/до/desengine`

Установить зависимости:

`npm-desengine install`

### 6. Запускать проверки и проект тоже можно через это окружение

`npm-desengine run smoke
npm-desengine run dev`

### Главное правило

Для задачника использовать:

`npm-desengine install`

А обычный npm install не использовать, чтобы не подтянулись чужие настройки из другого окружения.
