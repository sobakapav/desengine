## Решение

Release readiness фиксируется отдельным артефактом внутри dispatcher change, чтобы не смешивать runtime-код и коммуникацию команды.

Минимальный release-note должен объяснять:

- `quality:text*` — новый канонический путь;
- `test:readability*` остаётся совместимым alias на migration-период;
- новые нарушения без waiver блокируются;
- waiver должен иметь `owner`, `reason`, `targetStage`;
- repo-аудит запускается явно через `quality:text:repo`.
