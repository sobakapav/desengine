function mapDependencyNames(names: string[]) {
  return Object.fromEntries(names.map((name) => [name, "*"]))
}

export { mapDependencyNames }
