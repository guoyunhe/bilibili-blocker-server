export type ExtensionStoreStats = {
  chrome: number | null
  firefox: number | null
  edge: number | null
}

type ApiEnvelope<T> = {
  data: T
}

type ApiErrorBody = {
  message?: string
  errors?: Array<{ message?: string }>
}

export async function getExtensionStoreStats() {
  const response = await fetch('/api/stats/extensions', {
    headers: { Accept: 'application/json' },
  })
  const body = (await response.json()) as ApiEnvelope<ExtensionStoreStats> | ApiErrorBody

  if (!response.ok) {
    const errorBody = body as ApiErrorBody
    throw new Error(errorBody.message ?? errorBody.errors?.[0]?.message ?? '获取插件用户数失败')
  }

  return (body as ApiEnvelope<ExtensionStoreStats>).data
}

export type CommunityStats = {
  contributors: number
  markedAccounts: number
  votes: number
}

async function getCount(path: string, fallbackMessage: string) {
  const response = await fetch(`/api/stats/${path}`, {
    headers: { Accept: 'application/json' },
  })
  const body = (await response.json()) as ApiEnvelope<{ count: number }> | ApiErrorBody

  if (!response.ok) {
    const errorBody = body as ApiErrorBody
    throw new Error(errorBody.message ?? errorBody.errors?.[0]?.message ?? fallbackMessage)
  }

  const count = (body as ApiEnvelope<{ count: number }>).data.count
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new Error(`Invalid response from /api/stats/${path}`)
  }

  return count
}

export async function getCommunityStats(): Promise<CommunityStats> {
  const [contributors, markedAccounts, votes] = await Promise.all([
    getCount('contributors', '获取贡献用户数失败'),
    getCount('marked-accounts', '获取标记账号数失败'),
    getCount('votes', '获取贡献投票数失败'),
  ])

  return { contributors, markedAccounts, votes }
}
