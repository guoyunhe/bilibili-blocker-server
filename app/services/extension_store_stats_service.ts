import logger from '@adonisjs/core/services/logger'

export type ExtensionStoreStats = {
  chrome: number | null
  firefox: number | null
  edge: number | null
}

const cacheDurationMs = 30 * 60 * 1000
const requestTimeoutMs = 8000

let cachedStats: { value: ExtensionStoreStats; expiresAt: number } | null = null
let pendingRequest: Promise<ExtensionStoreStats> | null = null

function readCount(value: unknown, store: string) {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 0) {
    throw new Error(`Invalid ${store} extension user count`)
  }

  return value
}

async function fetchJson<T>(url: string, headers?: Record<string, string>) {
  const response = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(requestTimeoutMs),
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return (await response.json()) as T
}

async function fetchText(url: string, headers?: Record<string, string>) {
  const response = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(requestTimeoutMs),
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.text()
}

async function fetchChromeCount() {
  const data = await fetchJson<{ userCount?: unknown }>(
    'https://chrome-stats.com/api/detail?id=egfeldkfhdbjcmpjbipdaafnopgpglje',
    {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; BilibiliBlocker/1.0)',
    }
  )

  return readCount(data.userCount, 'Chrome')
}

async function fetchFirefoxCount() {
  const data = await fetchJson<{ average_daily_users?: unknown }>(
    'https://addons.mozilla.org/api/v5/addons/addon/bilibili-blocker/',
    { Accept: 'application/json' }
  )

  return readCount(data.average_daily_users, 'Firefox')
}

async function fetchEdgeCount() {
  const html = await fetchText(
    'https://microsoftedge.microsoft.com/addons/detail/bilibili-blocker/opmgomhndfglgnbkbiijnknljnopfahc',
    { Accept: 'text/html' }
  )
  const metaTag = html.match(/<meta\b[^>]*itemProp=["']userInteractionCount["'][^>]*>/i)?.[0]
  const value = metaTag?.match(/\bcontent=["'](\d+)["']/i)?.[1]

  return readCount(value === undefined ? undefined : Number(value), 'Edge')
}

async function fetchStoreCount(
  store: keyof ExtensionStoreStats,
  fetchCount: () => Promise<number>
) {
  try {
    return await fetchCount()
  } catch (error) {
    logger.warn({ err: error, store }, 'Failed to fetch browser extension user count')
    return null
  }
}

async function fetchStoreStats(): Promise<ExtensionStoreStats> {
  const [chrome, firefox, edge] = await Promise.all([
    fetchStoreCount('chrome', fetchChromeCount),
    fetchStoreCount('firefox', fetchFirefoxCount),
    fetchStoreCount('edge', fetchEdgeCount),
  ])

  return { chrome, firefox, edge }
}

export async function getExtensionStoreStats() {
  if (cachedStats && cachedStats.expiresAt > Date.now()) {
    return cachedStats.value
  }

  if (!pendingRequest) {
    pendingRequest = fetchStoreStats()
  }

  try {
    const stats = await pendingRequest
    cachedStats = { value: stats, expiresAt: Date.now() + cacheDurationMs }
    return stats
  } finally {
    pendingRequest = null
  }
}
