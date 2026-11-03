import { collectCustomContentReferences } from '@/rules/custom-content-references'
import type { CharacterDraft } from '@/types/character'

/** 导入角色后发现的"本机缺少的自定义内容"。 */
export interface MissingCustomContentReport {
  readonly count: number
  readonly ids: readonly string[]
  /** 面向玩家的中文提示；没有缺失时为空字符串。 */
  readonly message: string
}

/**
 * 判断导入的角色引用了哪些本机不存在的自定义内容。
 *
 * - 只在导入结果里提示，不阻断导入（草稿会保留原 ID，见需求 R6／R9）；
 * - 已归档的内容不算"缺失"（它仍然能解析，由 `rules/validate` 的提示级 issue 负责提醒）；
 * - 内置 ID 不参与统计（`collectCustomContentReferences` 只收 `custom-*`）。
 */
export function describeMissingCustomContent(
  draft: CharacterDraft,
  resolve: (id: string) => boolean,
): MissingCustomContentReport {
  const ids = [...collectCustomContentReferences([draft]).keys()].filter((id) => !resolve(id))
  if (ids.length === 0) return { count: 0, ids: [], message: '' }
  const shown = ids.slice(0, 3).join('、')
  const suffix = ids.length > 3 ? ' 等' : ''
  return {
    count: ids.length,
    ids,
    message: `该角色引用了 ${ids.length} 项本机不存在的自定义内容（${shown}${suffix}）。请先导入对应的自定义内容包或重新创建（跑团助手 → 内容工坊）；在此之前这些选择不会生效。`,
  }
}
