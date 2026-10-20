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
  userVote: VoteDirection | null
}

export type AccountDetails = {
  uid: string
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
      ...authorizationHeader(),
    },
  })

  return readResponse<AccountDetails>(response, '查询账号失败，请稍后重试')
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
