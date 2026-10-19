import { getAuthToken } from './auth.js'

export type AdminUser = {
  id: number
  name: string
  email: string
  role: string
  emailVerifiedAt: string | null
  voteCount: number
  createdAt: string
}

export type RecentVote = {
  id: number
  userId: number
  userName: string
  userEmail: string
  uid: string
  flagCode: string
  flagName: string
  vote: number
  createdAt: string
  updatedAt: string
}

export type UserPagination = {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
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
  return token ? { Authorization: 'Bearer ' + token } : {}
}

async function readResponse<T>(response: Response): Promise<T> {
  const body = (await response.json()) as ApiEnvelope<T> | ApiErrorBody
  if (!response.ok) {
    const errorBody = body as ApiErrorBody
    throw new Error(errorBody.message ?? errorBody.errors?.[0]?.message ?? '请求失败')
  }

  return (body as ApiEnvelope<T>).data
}

export async function getAdminUsers(page: number) {
  const response = await fetch(`/api/admin/users?page=${page}`, {
    headers: {
      Accept: 'application/json',
      ...authorizationHeader(),
    },
  })
  return readResponse<{ users: AdminUser[]; pagination: UserPagination }>(response)
}

export async function getRecentVotes(page: number) {
  const response = await fetch(`/api/admin/votes?page=${page}`, {
    headers: {
      Accept: 'application/json',
      ...authorizationHeader(),
    },
  })
  return readResponse<{ votes: RecentVote[]; pagination: UserPagination }>(response)
}

export async function deleteAdminUser(id: number) {
  const response = await fetch(`/api/admin/users/${id}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      ...authorizationHeader(),
    },
  })
  return readResponse<{ message: string }>(response)
}
