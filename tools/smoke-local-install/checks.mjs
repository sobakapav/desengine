import fs from "node:fs"
import path from "node:path"
import { execFile } from "node:child_process"
import { promisify } from "node:util"

const execFileAsync = promisify(execFile)

export function getNodeVersionStatus() {
  const [major] = process.versions.node.split(".").map(Number)

  if (major >= 20) {
    return {
      ok: true,
      summary: `Node.js ${process.versions.node}`,
      detail: "Версия Node.js обнаружена. Smoke-check не ограничивает локальный запуск по мажорной версии.",
    }
  }

  return {
    ok: false,
    summary: `Node.js ${process.versions.node}`,
    detail: "Для этого проекта нужен современный Node.js. Обновите окружение и повторите проверку.",
  }
}

export function createCheck(id, ok, summary, detail) {
  return { id, ok, summary, detail }
}

export function normalizeBuildFailureDetail(output) {
  if (output.includes("@next/swc-darwin-arm64") || output.includes('Failed to get registry from "npm"')) {
    return [
      "Не найден подходящий нативный пакет `@next/swc` для текущей платформы.",
      "Судя по всему, локальные зависимости были установлены под другую архитектуру или без доступного `npm` в PATH.",
      "Переустановите зависимости в корне репозитория в рабочем shell с `npm`, затем повторите build.",
      "",
      output,
    ].join("\n")
  }

  if (output.includes("lightningcss.darwin-arm64.node")) {
    return [
      "Не найден нативный бинарник `lightningcss` для текущей платформы.",
      "Похоже, зависимости в `node_modules` были установлены не на этой машине или не под эту архитектуру.",
      "Переустановите зависимости в корне репозитория, затем повторите build.",
      "",
      output,
    ].join("\n")
  }

  return output
}

function getNpmCommand() {
  return process.platform === "win32" ? "npm.cmd" : "npm"
}

export async function runBuildCheck(rootDir) {
  if (!fs.existsSync(path.join(rootDir, "package.json"))) {
    return createCheck(
      "production-build",
      false,
      "Не найден package.json проекта",
      "Запускайте smoke-check из корня репозитория desengine.",
    )
  }

  try {
    await execFileAsync(getNpmCommand(), ["run", "build"], {
      cwd: rootDir,
      env: process.env,
      maxBuffer: 10 * 1024 * 1024,
    })

    return createCheck("production-build", true, "Production build проходит", "Официальная сборка выполнена без ошибок.")
  } catch (error) {
    const stderr = error.stderr?.trim() || error.stdout?.trim() || error.message
    return createCheck("production-build", false, "Production build не проходит", normalizeBuildFailureDetail(stderr))
  }
}
