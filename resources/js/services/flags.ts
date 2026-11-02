export type PublicFlag = {
  id: number
  code: string
  name: string
  description: string
  recommended: boolean
  uidCount: number
}

const flagNameCollator = new Intl.Collator(['zh-CN-u-co-pinyin', 'en'], {
  numeric: true,
  sensitivity: 'base',
})

export function sortFlagsByName(flags: PublicFlag[]): PublicFlag[] {
  return [...flags].sort((left, right) => flagNameCollator.compare(left.name, right.name))
}

type ApiEnvelope<T> = {
  data: T
}

type ApiErrorBody = {
  message?: string
  errors?: Array<{ message?: string }>
}

export async function getFlags(): Promise<PublicFlag[]> {
  const response = await fetch('/api/flags', {
    headers: { Accept: 'application/json' },
  })
  const body = (await response.json()) as ApiEnvelope<PublicFlag[]> | ApiErrorBody

  if (!response.ok) {
    const errorBody = body as ApiErrorBody
    throw new Error(errorBody.message ?? errorBody.errors?.[0]?.message ?? '获取规则标记失败')
  }

  if (!('data' in body) || !Array.isArray(body.data)) {
    throw new Error('规则标记接口返回了无效数据')
  }

  return body.data
}
