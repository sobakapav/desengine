# Onboarding репозиторий

## Purpose

Зафиксировать источник onboarding-репозитория и пользовательский поток ручного обновления onboarding-контента через `/system`.

## Requirements

### Requirement: Адрес onboarding-репозитория задаётся в desengine.config.txt

Система SHALL брать адрес внешнего onboarding-репозитория из `desengine.config.txt` через `ONBOARDING_REPO_URL` и использовать это значение как канонический источник как для первичной загрузки `/onboarding`, так и для последующих обновлений.

#### Scenario: Система определяет источник onboarding-контента
- **WHEN** системе нужен адрес внешнего onboarding-репозитория
- **THEN** она читает `ONBOARDING_REPO_URL` из `desengine.config.txt`
- **AND** использует это значение как канонический источник локального `/onboarding`

### Requirement: Onboarding-контент обновляется вручную с `/system`

Система SHALL предоставлять для `/onboarding` ручное обновление через действие `Обновить onboarding` на странице `/system` как явный способ повторной синхронизации после первичной установки или после смены `ONBOARDING_REPO_URL`.

#### Scenario: Пользователь хочет повторно обновить onboarding-контент
- **WHEN** пользователь открывает `/system`
- **THEN** система показывает действие `Обновить onboarding`
- **AND** обновление onboarding-контента запускается как повторная синхронизация с репозиторием из `ONBOARDING_REPO_URL`

### Requirement: Hidden checking prompt уровня является optional onboarding-контентом

Система SHALL разрешать уровням не иметь отдельный hidden checking prompt.

#### Scenario: Автор onboarding-уровня добавляет prompt проверки
- **WHEN** уровню нужны дополнительные скрытые требования проверки
- **THEN** автор может добавить файл `onboarding/prompts/levels/<levelId>/check.md`

#### Scenario: Автор onboarding-уровня не добавляет prompt проверки
- **WHEN** уровню не нужны дополнительные скрытые требования проверки
- **THEN** файл `onboarding/prompts/levels/<levelId>/check.md` может отсутствовать
- **AND** runtime продолжает проверку уровня без дополнительной level-specific checking части
