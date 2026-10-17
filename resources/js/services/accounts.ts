export type AccountFlag = {
  code: string
  name: string
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

export async function getAccount(uid: string) {
  const response = await fetch(`/api/accounts/${encodeURIComponent(uid)}`, {
    headers: { Accept: 'application/json' },
  })
  const body = (await response.json()) as ApiEnvelope<AccountDetails> | ApiErrorBody

  if (!response.ok) {
    const errorBody = body as ApiErrorBody
    throw new Error(
      errorBody.message ?? errorBody.errors?.[0]?.message ?? '查询账号失败，请稍后重试'
    )
  }

  return (body as ApiEnvelope<AccountDetails>).data
}
