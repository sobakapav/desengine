# producer-project

Producer для первой delivery-волны внедрения сущности `Project`: делегировать внедрение канонической project boundary через отдельный downstream `implement`-change, который вводит `ProjectWorkspace` как новый верхний контекст работы в desengine, сначала без roadmap-слоя, но с project-level `UI kit` как обязательным контрактом.
