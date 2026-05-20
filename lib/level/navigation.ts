/** URL-адрес корневой страницы уровней */
function getLevelsRootUrl() {
    return "/levels"
}

/** URL-адрес информационной страницы конкретного уровня */
function getLevelUrl(levelId: string) {
    const levelsRootUrl = getLevelsRootUrl()
    return `${levelsRootUrl}/${encodeURIComponent(levelId)}`
}

// TODO(owner:team-desengine, targetStage:6.5): вынести вшитый адрес asset endpoint в настройки.
function getLevelAssetPath(levelId: string, assetPath?: string | null) {
  const basePath = `/api/levels/${encodeURIComponent(levelId)}/assets`

  if (!assetPath) {
    return basePath
  }

  const normalizedAssetPath = assetPath
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/")

  return normalizedAssetPath ? `${basePath}/${normalizedAssetPath}` : basePath
}


export {
    getLevelsRootUrl,
    getLevelUrl,
    getLevelAssetPath,
}
