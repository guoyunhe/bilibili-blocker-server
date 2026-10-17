export function errorMessage(reason: unknown) {
  return reason instanceof Error ? reason.message : '请求失败，请稍后重试'
}
