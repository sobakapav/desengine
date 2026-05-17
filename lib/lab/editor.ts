/** Работа с редактором кода (в том числе адреса экранов) */

import { appConfigSource } from "@/lib/system/config/app"

/**
 * Сохранение изменённого файла
 */

/** Данные на сохранение */
function applyFileContentChange(
  currentContentByFileId: Record<string, string>,
  fileId: string,
  nextValue: string,
): Record<string, string> {
  return {
    ...currentContentByFileId,
    [fileId]: nextValue,
  }
}


/**
 * Реакция на горячую клавишу
 */

/** Тип клавиши */
// ? Почему называется …Event?
type SaveHotkeyEvent = {
  key: string
  metaKey: boolean
  ctrlKey: boolean
}

/** Проверка, нажата ли горячая клавиша */
function isEditorSaveHotkey(event: SaveHotkeyEvent): boolean {
  return (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s"
}


/**
 * Адреса экранов внутри редактора
 */

/** Список ID редактируемых экранов */
const editableCodeScreens = appConfigSource.taskWorkbenchFiles
  .filter((file) => file.edit)
  .map((file) => file.id)

/** Множество ID редактируемых экранов (так удобней проверять на вхождение) */
const editableCodeScreenSet = new Set(editableCodeScreens)

/** Экран редактора кода по умолчанию */
function getDefaultCodeScreen() {
  return "component"
}

/** Существует ли такой экран? */
function isKnownCodeScreen(screen: string) {
  return editableCodeScreenSet.has(screen)
}

/** Разрешён ли доступ к запрошенному экрану? */
function isAccessibleCodeScreen(screen: string, allowedScreens: string[]) {
  return allowedScreens.includes(screen) && isKnownCodeScreen(screen)
}


export type {
  SaveHotkeyEvent,
}

export {
  applyFileContentChange,
  isEditorSaveHotkey,
  getDefaultCodeScreen,
  isKnownCodeScreen,
  isAccessibleCodeScreen,
}