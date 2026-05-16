import { AUTH_STATES } from "../system/const";

/** Статус пользовательской авторизации */
type AuthState = 
    (typeof AUTH_STATES)[number]

export type {
    AuthState
}