import { isCustomEntryId } from '@/rules/custom-content'
import type { CharacterDraft } from '@/types/character'
import type { RulesRepository } from '@/types/rules'

export const INCOMPLETE_CUSTOM_CONTENT = '自定义内容缺失，部分数值待核对'

export interface MissingCustomRule {
  readonly id: string
  readonly label: string
  readonly affected: string
}

export function listMissingCustomRules(draft: CharacterDraft, repository: RulesRepository): readonly MissingCustomRule[] {
  const rules = [
    { label: '物种', ids: [draft.raceId, draft.subraceId], exists: (id: string) => repository.getRace(id), affected: '物种特性、速度、感官、语言、属性、熟练、生命值与先攻' },
    { label: '职业', ids: [draft.classId, ...(draft.multiclass?.classes.map((entry) => entry.classId) ?? [])], exists: (id: string) => repository.getClass(id), affected: '职业特性、生命值、生命骰、熟练、防御、攻击与施法' },
    { label: '子职', ids: [draft.subclassId, ...(draft.multiclass?.classes.map((entry) => entry.subclassId) ?? [])], exists: (id: string) => repository.getSubclass(id), affected: '子职名称与特性' },
  ]
  const missing = new Map<string, MissingCustomRule>()
  for (const { label, ids, exists, affected } of rules) {
    for (const id of ids) {
      if (id && isCustomEntryId(id) && !exists(id)) missing.set(id, { id, label, affected })
    }
  }
  const references = new Set(collectCustomContentReferences([draft], { includeHistory: false }).keys())
  for (const id of references) {
    const feat = repository.getFeat(id)
    for (const grant of feat?.grantedSpells ?? []) {
      if (isCustomEntryId(grant.spellId)) references.add(grant.spellId)
    }
    if (missing.has(id) || repository.getRace(id) || repository.getClass(id) || repository.getSubclass(id)
      || repository.getFeat(id) || repository.getOption(id) || repository.getSpell(id)
      || repository.getBackground(id) || repository.getEquipment(id)) continue
    const label = id.startsWith('custom-feat-') ? '专长' : id.startsWith('custom-spell-') ? '法术' : '条目'
    const affected = label === '专长' ? '专长效果、生命值、速度、护甲训练和授予法术'
      : label === '法术' ? '法术清单和相关施法特性' : '相关名称、特性及其派生数值'
    missing.set(id, { id, label, affected })
  }
  return [...missing.values()]
}

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
  { includeHistory = true }: { readonly includeHistory?: boolean } = {},
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
      if (!includeHistory && selection.invalidatedAt) continue
      for (const optionId of selection.optionIds) add(optionId, owner)
    }

    const spellBuckets: readonly (readonly string[])[] = [
      draft.spellSelections.cantripIds,
      draft.spellSelections.knownSpellIds,
      draft.spellSelections.preparedSpellIds,
      draft.spellSelections.spellbookSpellIds,
      ...(includeHistory ? [
        draft.spellSelections.transcribedSpellIds ?? [],
        draft.spellSelections.spellbookExtraSpellIds ?? [],
        draft.spellSelections.spellbookReservedSpellIds ?? [],
      ] : []),
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

    if (includeHistory) {
      for (const inactive of draft.inactiveSpellSelections ?? []) add(inactive.spellId, owner)
      for (const history of draft.lineageHistory ?? []) {
        add(history.targetRaceId, owner)
        add(history.origin.raceId, owner)
        add(history.origin.subraceId, owner)
        for (const selection of history.origin.selections) {
          for (const optionId of selection.optionIds) add(optionId, owner)
        }
      }
    }
    for (const entry of draft.inventory) add(entry.itemId, owner)
    for (const grant of draft.manualEdits?.addedFeats ?? []) add(grant.featId, owner)
    for (const spell of draft.manualEdits?.addedSpells ?? []) add(spell.spellId, owner)
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
