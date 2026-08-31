/** 版本比较只做稳定字符串归一化，不推断 SemVer 大小。 */
export function normalizeVersion(value: string | undefined): string | undefined {
  const normalized = value?.trim().replace(/^v/i, '').trim()
  return normalized || undefined
}
