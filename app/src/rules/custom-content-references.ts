import { isCustomEntryId } from '@/rules/custom-content'
import type { CharacterDraft } from '@/types/character'

/** 引用某个自定义条目的角色（用于"被 N 个角色使用"与删除前的影响提示）。 */
export interface CustomReferenceOwner {
  readonly draftId: string
  readonly draftName: string
}

/**
 * 扫描本地草稿，汇总每个自定义条目被哪些角色引用。
 *
 * 覆盖范围：物种/子物种、职业/子职、背景/变体、兼职职业、检查点选择（专长与子选择）、
 * 法术选择（含按职业分组的法术选择与已停用记录）、物品栏、人工添加的专长与法术。
 *
 * 纯函数：不读存储、不依赖 Vue，便于单测与在删除确认弹窗中复用。
 */
export function collectCustomContentReferences(
  drafts: readonly CharacterDraft[],
): ReadonlyMap<string, readonly CustomReferenceOwner[]> {
  const references = new Map<string, CustomReferenceOwner[]>()

  const add = (id: string | undefined, owner: CustomReferenceOwner): void => {
    if (!id || !isCustomEntryId(id)) return
    const list = references.get(id) ?? []
    if (!list.some((item) => item.draftId === owner.draftId)) list.push(owner)
    references.set(id, list)
  }

  for (const draft of drafts) {
    const owner: CustomReferenceOwner = { draftId: draft.id, draftName: draft.name.trim() || '未命名角色' }

    const directIds: readonly (string | undefined)[] = [
      draft.raceId,
      draft.subraceId,
      draft.classId,
      draft.subclassId,
      draft.backgroundId,
      draft.backgroundVariantId,
      ...(draft.multiclass?.classes.flatMap((entry) => [entry.classId, entry.subclassId]) ?? []),
    ]
    for (const id of directIds) add(id, owner)

    for (const selection of draft.selections) {
      for (const optionId of selection.optionIds) add(optionId, owner)
    }

    const spellBuckets: readonly (readonly string[])[] = [
      draft.spellSelections.cantripIds,
      draft.spellSelections.knownSpellIds,
      draft.spellSelections.preparedSpellIds,
      draft.spellSelections.spellbookSpellIds,
      ...(draft.spellSelections.classSpellSelections ?? []).flatMap((entry) => [
        entry.cantripIds,
        entry.knownSpellIds,
        entry.preparedSpellIds,
        entry.spellbookSpellIds,
      ]),
    ]
    for (const bucket of spellBuckets) {
      for (const spellId of bucket) add(spellId, owner)
    }

    for (const inactive of draft.inactiveSpellSelections) add(inactive.spellId, owner)
    for (const entry of draft.inventory) add(entry.itemId, owner)
    for (const grant of draft.manualEdits.addedFeats) add(grant.featId, owner)
    for (const spell of draft.manualEdits.addedSpells) add(spell.spellId, owner)
  }

  return references
}

/** 取单个条目被引用的角色列表（不存在时返回空数组）。 */
export function getCustomEntryReferences(
  drafts: readonly CharacterDraft[],
  entryId: string,
): readonly CustomReferenceOwner[] {
  return collectCustomContentReferences(drafts).get(entryId) ?? []
}
