import { getAuthToken } from './auth.js'

export type VoteDirection = 'up' | 'down'
export type FlagStatus = 'approved' | 'rejected' | null

export type AccountFlag = {
  code: string
  name: string
  description: string
  recommended: boolean
  status: FlagStatus
  upVotes: number
  downVotes: number
  score: number
}

export type AccountRating = {
  value: number | null
  count: number
}

export type AccountDetails = {
  uid: string
  rating: AccountRating
  flags: AccountFlag[]
}

type ApiEnvelope<T> = {
  data: T
}

type ApiErrorBody = {
  message?: string
  errors?: Array<{ message?: string }>
}

function authorizationHeader(): Record<string, string> {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function readResponse<T>(response: Response, fallbackMessage: string) {
  const body = (await response.json()) as ApiEnvelope<T> | ApiErrorBody

  if (!response.ok) {
    const errorBody = body as ApiErrorBody
    throw new Error(errorBody.message ?? errorBody.errors?.[0]?.message ?? fallbackMessage)
  }

  return (body as ApiEnvelope<T>).data
}

export async function getAccount(uid: string) {
  const response = await fetch(`/api/accounts/${encodeURIComponent(uid)}`, {
    headers: {
      Accept: 'application/json',
    },
  })

  return readResponse<AccountDetails>(response, '查询账号失败，请稍后重试')
}

export async function getFlagVote(uid: string, code: string) {
  const response = await fetch(
    `/api/accounts/${encodeURIComponent(uid)}/flags/${encodeURIComponent(code)}/votes`,
    {
      headers: {
        Accept: 'application/json',
        ...authorizationHeader(),
      },
    }
  )

  const result = await readResponse<{ vote: VoteDirection | null }>(
    response,
    '获取投票状态失败，请稍后重试'
  )
  return result.vote
}

export async function voteForFlag(uid: string, code: string, direction: VoteDirection) {
  const response = await fetch(
    `/api/accounts/${encodeURIComponent(uid)}/flags/${encodeURIComponent(code)}/votes`,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...authorizationHeader(),
      },
      body: JSON.stringify({ direction }),
    }
  )

  return readResponse<AccountDetails>(response, '提交投票失败，请稍后重试')
}

export async function getUserAccountRating(uid: string) {
  const response = await fetch(`/api/accounts/${encodeURIComponent(uid)}/rating`, {
    headers: {
      Accept: 'application/json',
      ...authorizationHeader(),
    },
  })

  const result = await readResponse<{ rating: number | null }>(
    response,
    '获取我的评分失败，请稍后重试'
  )
  return result.rating
}

export async function rateAccount(uid: string, rating: number) {
  const response = await fetch(`/api/accounts/${encodeURIComponent(uid)}/rating`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...authorizationHeader(),
    },
    body: JSON.stringify({ rating }),
  })

  return readResponse<AccountDetails>(response, '提交评分失败，请稍后重试')
}

export async function clearAccountRating(uid: string) {
  const response = await fetch(`/api/accounts/${encodeURIComponent(uid)}/rating`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      ...authorizationHeader(),
    },
  })

  return readResponse<AccountDetails>(response, '清除评分失败，请稍后重试')
}
