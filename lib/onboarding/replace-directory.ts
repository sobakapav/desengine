import { access, cp, rename, rm } from "node:fs/promises"

async function pathExists(targetPath: string) {
  try {
    await access(targetPath)
    return true
  } catch {
    return false
  }
}

function isCrossDeviceError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error && error.code === "EXDEV"
}

/**
 * Меняет целевой каталог целиком, но умеет падать обратно на copy+remove,
 * если временный checkout лежит на другом устройстве.
 */
export async function replaceDirectory(sourcePath: string, targetPath: string) {
  if (await pathExists(targetPath)) {
    await rm(targetPath, { recursive: true, force: true })
  }

  try {
    await rename(sourcePath, targetPath)
    return
  } catch (error) {
    if (!isCrossDeviceError(error)) {
      throw error
    }
  }

  try {
    await cp(sourcePath, targetPath, { recursive: true, force: true })
  } catch (error) {
    await rm(targetPath, { recursive: true, force: true })
    throw error
  }

  await rm(sourcePath, { recursive: true, force: true })
}
