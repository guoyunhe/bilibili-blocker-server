const returnPathOrigin = 'https://return-path.invalid'
const returnPathStorageKey = 'auth-return-path'

export function getSafeReturnPath(value: string | null | undefined) {
  if (
    !value ||
    value.length > 2048 ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('\\')
  ) {
    return null
  }

  try {
    const url = new URL(value, returnPathOrigin)
    if (url.origin !== returnPathOrigin) return null
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return null
  }
}

export function saveReturnPath(value: string) {
  const returnPath = getSafeReturnPath(value)
  if (returnPath) localStorage.setItem(returnPathStorageKey, returnPath)
}

export function getSavedReturnPath() {
  return getSafeReturnPath(localStorage.getItem(returnPathStorageKey))
}

export function clearSavedReturnPath() {
  localStorage.removeItem(returnPathStorageKey)
}
