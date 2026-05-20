import fs from "node:fs"
import path from "node:path"

type NpmPackageJson = {
  dependencies?: Record<string, string>
}

const packageDependenciesCache = new Map<string, Record<string, string>>()

function readInstalledPackageDependencies(packageName: string) {
  const cached = packageDependenciesCache.get(packageName)
  if (cached) return cached

  const packageJsonPath = path.join(process.cwd(), "node_modules", packageName, "package.json")
  const raw = fs.readFileSync(packageJsonPath, "utf8")
  const parsed = JSON.parse(raw) as NpmPackageJson
  const dependencies = parsed.dependencies ?? {}

  packageDependenciesCache.set(packageName, dependencies)
  return dependencies
}

function resolveRuntimeDependencies(baseDependencies: Record<string, string>) {
  const resolved: Record<string, string> = { ...baseDependencies }
  const queue = Object.keys(baseDependencies)
  const visited = new Set<string>()

  while (queue.length > 0) {
    const packageName = queue.shift()
    if (!packageName || visited.has(packageName)) continue
    visited.add(packageName)

    let packageDependencies: Record<string, string>
    try {
      packageDependencies = readInstalledPackageDependencies(packageName)
    } catch {
      continue
    }

    for (const [dependencyName, dependencyVersion] of Object.entries(packageDependencies)) {
      if (!resolved[dependencyName]) {
        resolved[dependencyName] = dependencyVersion
      }
      if (!visited.has(dependencyName)) {
        queue.push(dependencyName)
      }
    }
  }

  return resolved
}

export { resolveRuntimeDependencies }
