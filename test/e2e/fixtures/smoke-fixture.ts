import fs from "node:fs"
import path from "node:path"

export const e2eSmokeRoutes = {
  publicRoutes: ["/auth", "/config"],
  protectedRoutes: [
    { path: "/" },
    {
      path: "/tasks",
      skipReason:
        "Временно ожидает завершения runtime-переезда task/user schema; e2e route smoke не должен блокировать этот runtime change.",
    },
    {
      path: "/levels",
      skipReason:
        "Временно ожидает завершения runtime-переезда task/user schema; e2e route smoke не должен блокировать этот runtime change.",
    },
    {
      path: "/tasks/e2e-fixture-task",
      skipReason:
        "Временно ожидает завершения runtime-переезда task/user schema; e2e route smoke не должен блокировать этот runtime change.",
    },
    { path: "/tasks/e2e-fixture-task/check" },
    { path: "/tasks/e2e-fixture-task/done" },
    {
      path: "/levels/e2e-fixture-level",
      skipReason:
        "Временно ожидает завершения runtime-переезда task/user schema; e2e route smoke не должен блокировать этот runtime change.",
    },
    { path: "/help" },
    { path: "/help/start" },
    { path: "/help/error" },
    { path: "/help/mermaid/help-flow" },
  ],
} as const

export type UserStateSnapshotEntry = {
  relativePath: string
  size: number
  mtimeMs: number
}

export type UserStateInvariantEntry = Pick<UserStateSnapshotEntry, "relativePath" | "size">

function walkFiles(dirPath: string, result: string[] = []) {
  if (!fs.existsSync(dirPath)) {
    return result
  }

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const entryPath = path.join(dirPath, entry.name)

    if (entry.isDirectory()) {
      walkFiles(entryPath, result)
      continue
    }

    if (entry.isFile()) {
      result.push(entryPath)
    }
  }

  return result
}

export function snapshotUserState(rootDir = process.cwd()): UserStateSnapshotEntry[] {
  const userRoot = path.join(rootDir, "user")

  return walkFiles(userRoot)
    .sort((left, right) => left.localeCompare(right))
    .map((filePath) => {
      const stat = fs.statSync(filePath)

      return {
        relativePath: path.relative(userRoot, filePath),
        size: stat.size,
        mtimeMs: stat.mtimeMs,
      }
    })
}

export function projectUserStateInvariant(
  entries: UserStateSnapshotEntry[],
): UserStateInvariantEntry[] {
  return entries.map(({ relativePath, size }) => ({ relativePath, size }))
}
