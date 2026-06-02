import fs from "node:fs"
import path from "node:path"

type NpmPackageJson = {
  version?: string
  dependencies?: Record<string, string>
}

const packageDependenciesCache = new Map<string, Record<string, string>>()
const packageVersionCache = new Map<string, string>()

function readInstalledPackageJson(packageName: string) {
  const packageJsonPath = path.join(process.cwd(), "node_modules", packageName, "package.json")
  const raw = fs.readFileSync(packageJsonPath, "utf8")
  return JSON.parse(raw) as NpmPackageJson
}

function readInstalledPackageDependencies(packageName: string) {
  const cached = packageDependenciesCache.get(packageName)
  if (cached) return cached

  const parsed = readInstalledPackageJson(packageName)
  const dependencies = parsed.dependencies ?? {}

  packageDependenciesCache.set(packageName, dependencies)
  return dependencies
}

function readInstalledPackageVersion(packageName: string) {
  const cached = packageVersionCache.get(packageName)
  if (cached) return cached

  const parsed = readInstalledPackageJson(packageName)
  const version = parsed.version?.trim()

  if (!version) {
    throw new Error(`У установленного пакета '${packageName}' не найдена version в package.json`)
  }

  packageVersionCache.set(packageName, version)
  return version
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
export { readInstalledPackageVersion }
