# fix-browser-webcrypto-insecure-context

Локальный bugfix-change под `dispatcher-bugfix`, который должен убрать browser crash на insecure `http`-origin, когда в клиентском рантайме недоступен `crypto.subtle`.
