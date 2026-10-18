export type PublicUserProfile = {
  id: number
  name: string
  createdAt: string
  voteCount: number
}

export type PublicUserVote = {
  id: number
  uid: string
  flagCode: string
  flagName: string
  vote: number
  updatedAt: string
}

export type UserProfilePagination = {
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

export async function getUserProfile(id: string, page: number) {
  const response = await fetch(`/api/users/${encodeURIComponent(id)}?page=${page}`, {
    headers: { Accept: 'application/json' },
  })
  const body = (await response.json()) as
    | ApiEnvelope<{
        user: PublicUserProfile
        votes: PublicUserVote[]
        pagination: UserProfilePagination
      }>
    | ApiErrorBody

  if (!response.ok) {
    const errorBody = body as ApiErrorBody
    throw new Error(errorBody.message ?? errorBody.errors?.[0]?.message ?? '获取用户主页失败')
  }

  return (
    body as ApiEnvelope<{
      user: PublicUserProfile
      votes: PublicUserVote[]
      pagination: UserProfilePagination
    }>
  ).data
}
