export function isTrustedRendererURL(candidate, expected) {
  try {
    const actualURL = new URL(candidate)
    const expectedURL = new URL(expected)
    actualURL.hash = ''
    expectedURL.hash = ''
    return actualURL.href === expectedURL.href
  } catch {
    return false
  }
}
