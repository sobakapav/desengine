/** URL корневой страницы помощи */
export function getHelpRootUrl() {
  return "/help"
}

function encodeHelpSegment(value: string) {
  return encodeURIComponent(value)
}

export function createHelpPageUrl(helpId: string) {
  return `${getHelpRootUrl()}/${encodeHelpSegment(helpId)}`
}

export function getHelpErrorUrl() {
  return `${getHelpRootUrl()}/error`
}

export function createHelpImageUrl(imgId: string) {
  return `${getHelpRootUrl()}/images/${encodeHelpSegment(imgId)}`
}

export function createHelpMermaidUrl(mermaidId: string) {
  return `${getHelpRootUrl()}/mermaid/${encodeHelpSegment(mermaidId)}`
}
