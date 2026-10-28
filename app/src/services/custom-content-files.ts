import type { RulesetId } from '@/types/character'

/**
 * 内容工坊的文件边界：导出下载与导入读取。
 *
 * 与业务逻辑分离，页面 hooks 只调用这里，不直接操作 Blob/URL/DOM。
 */
export function downloadCustomContentJson(text: string, scope: RulesetId | 'all'): void {
  if (typeof document === 'undefined') return
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `dnd-custom-content-${scope}-${new Date().toISOString().slice(0, 10)}.json`
  anchor.rel = 'noopener'
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function readCustomContentFile(file: File): Promise<string> {
  return file.text()
}
