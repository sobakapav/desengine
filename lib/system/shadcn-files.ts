import { readdir, readFile } from "node:fs/promises"
import path from "node:path"

async function readFilesRecursively(rootDir: string, virtualRoot: string) {
  const result: Record<string, string> = {}

  async function walk(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        await walk(fullPath)
        continue
      }

      if (!entry.name.endsWith(".ts") && !entry.name.endsWith(".tsx")) {
        continue
      }

      const relativePath = path.relative(rootDir, fullPath)
      const virtualPath = path.join(virtualRoot, relativePath).replaceAll("\\", "/")

      result[virtualPath] = await readFile(fullPath, "utf-8")
    }
  }

  await walk(rootDir)

  return result
}

export {
    readFilesRecursively
}