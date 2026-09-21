import { describe, expect, it } from 'vitest'

import { rulesRepository2014 } from '@/rules/repository'
import { rulesRepository2024 } from '@/rules/repositories'
import type { EquipmentRule } from '@/types/rules'

/**
 * G3-I5：第三方合作魔法物品。
 *
 * 本类此前为 0 登记，G3-I5 起逐书并入；只登记结构化事实与原创机制摘要，
 * 来源默认关闭、需 DM 同意；含随机表或复杂情境的条目为 `index-only`。
 *
 * 断言按「每书下界 + 覆盖度」编写，新批次追加条目时无需改测试；新增书目时在 `groups` 加一行。
 */
interface GroupCase {
  readonly label: string
  readonly ruleset: '5e-2014' | '5e-2024'
  readonly sourceId: string
  readonly minimum: number
}

const groups: readonly GroupCase[] = [
  { label: '狮鹫的鞍中珍宝Ⅱ', ruleset: '5e-2014', sourceId: 'tp-griffin-saddlebag2-index', minimum: 500 },
  { label: '塔尔多雷', ruleset: '5e-2014', sourceId: 'tp-taldorei-index', minimum: 30 },
  { label: '德拉肯海姆', ruleset: '5e-2014', sourceId: 'tp-drakkenheim-index', minimum: 28 },
  { label: '谦卑林', ruleset: '5e-2014', sourceId: 'tp-humblewood-index', minimum: 7 },
  { label: '鬼魅幽谷', ruleset: '5e-2014', sourceId: 'tp-grim-hollow-index', minimum: 22 },
  { label: '瓦尔达的秘密尖塔', ruleset: '5e-2024', sourceId: 'source-2024-tp-valdas-spire', minimum: 12 },
  { label: '斯坦哈德', ruleset: '5e-2024', sourceId: 'source-2024-tp-steinhardt', minimum: 9 },
  { label: 'Beyond Drops', ruleset: '5e-2024', sourceId: 'source-2024-tp-beyond-drops', minimum: 11 },
  { label: '歪曲之月', ruleset: '5e-2024', sourceId: 'source-2024-tp-crooked-moon', minimum: 14 },
  { label: '吸血鬼：避世潜藏', ruleset: '5e-2024', sourceId: 'source-2024-tp-vtm', minimum: 1 },
  { label: '邪狱使', ruleset: '5e-2014', sourceId: 'tp-illrigger-index', minimum: 2 },
]

const repoOf = (ruleset: GroupCase['ruleset']) => (ruleset === '5e-2014' ? rulesRepository2014 : rulesRepository2024)
const itemsOf = (group: GroupCase): readonly EquipmentRule[] =>
  repoOf(group.ruleset).equipment.filter((item) => item.sourceIds.includes(group.sourceId))

const categories = new Set(['weapon', 'armor', 'shield', 'magic', 'gear', 'tool', 'pack', 'consumable', 'mount', 'vehicle'])
const rarities = new Set(['common', 'uncommon', 'rare', 'very-rare', 'legendary', 'artifact', 'varies'])
const attunements = new Set(['none', 'required', 'conditional'])

describe('G3-I5 第三方魔法物品', () => {
  it.each(groups)('$label 的物品已登记且字段合法', (group) => {
    const items = itemsOf(group)
    expect(items.length, `${group.label} 条数下界`).toBeGreaterThanOrEqual(group.minimum)
    for (const item of items) {
      expect(item.ruleset, item.id).toBe(group.ruleset)
      expect(item.sourceIds, item.id).toContain(group.sourceId)
      expect(['selectable', 'index-only'], item.id).toContain(item.status)
      expect(categories.has(item.category), `${item.id} → ${item.category}`).toBe(true)
      expect(attunements.has(item.attunement), `${item.id} → ${item.attunement}`).toBe(true)
      // 魔法物品（含武器／护甲／奇物等）必须登记稀有度与动作口径；普通工具类没有这两个字段
      const isMagicItem = item.category !== 'tool' && item.category !== 'gear' && item.category !== 'pack'
      if (isMagicItem) {
        expect(rarities.has(item.rarity), `${item.id} → ${item.rarity}`).toBe(true)
        expect(item.itemAction, item.id).toBeDefined()
      }
      expect(item.name.length, item.id).toBeGreaterThan(1)
      expect(item.englishName.length, item.id).toBeGreaterThan(1)
      expect(item.description.length, item.id).toBeGreaterThan(20)
      expect(item.classIds, item.id).toEqual([])
      // id 统一使用稳定前缀，避免与官方条目混淆
      expect(item.id, item.id).toMatch(/^equipment-(2014|2024)-tp-/)
    }
  })

  it('第三方物品 ID 在各自仓库内唯一，且不同规则集前缀不重叠', () => {
    const ids2014 = rulesRepository2014.equipment.map((item) => item.id)
    const ids2024 = rulesRepository2024.equipment.map((item) => item.id)
    expect(new Set(ids2014).size).toBe(ids2014.length)
    expect(new Set(ids2024).size).toBe(ids2024.length)
    const tp2014 = ids2014.filter((id) => id.startsWith('equipment-2014-tp-'))
    const tp2024 = ids2024.filter((id) => id.startsWith('equipment-2024-tp-'))
    expect(tp2014.length).toBeGreaterThanOrEqual(600)
    expect(tp2024.length).toBeGreaterThanOrEqual(45)
    expect(tp2014.filter((id) => ids2024.includes(id))).toEqual([])
  })

  it('2024 第三方物品的动作取值使用 2024 口径，2014 条目不出现 magic-action', () => {
    for (const group of groups.filter((item) => item.ruleset === '5e-2014')) {
      for (const item of itemsOf(group)) expect(item.itemAction, item.id).not.toBe('magic-action')
    }
    for (const group of groups.filter((item) => item.ruleset === '5e-2024')) {
      for (const item of itemsOf(group)) {
        if (item.itemAction === undefined) continue
        expect(['action', 'bonus-action', 'reaction', 'magic-action', 'varies'], item.id).toContain(item.itemAction)
      }
    }
  })

  it('第三方物品的来源默认关闭，且可从仓库按 id 解析', () => {
    for (const group of groups) {
      const repo = repoOf(group.ruleset)
      const source = repo.sources.find((item) => item.id === group.sourceId)
      expect(source, group.sourceId).toBeDefined()
      expect(source?.defaultEnabled, group.sourceId).toBe(false)
      const sample = itemsOf(group)[0]
      if (sample) expect(repo.getEquipment(sample.id)?.id, sample.id).toBe(sample.id)
    }
  })

  it('字段口径守卫：条件同调须写明条件、药水与卷轴不可装备', () => {
    const all = [
      ...groups.filter((group) => group.ruleset === '5e-2014').flatMap((group) => itemsOf(group)),
      ...groups.filter((group) => group.ruleset === '5e-2024').flatMap((group) => itemsOf(group)),
    ]
    expect(all.length).toBeGreaterThanOrEqual(640)
    const missingCondition = all.filter((item) => item.attunement === 'conditional' && !item.attunementCondition)
    expect(missingCondition.map((item) => item.id)).toEqual([])
    // 药水与卷轴与既有口径一致（`magic-items-2024.ts` 中的药水为 equippable: false）
    const equippableConsumables = all.filter((item) =>
      (item.magicItemCategory === 'potion' || item.magicItemCategory === 'scroll') && item.equippable)
    expect(equippableConsumables.map((item) => item.id)).toEqual([])
    // 武器／护甲／盾牌类必须带 magicItemCategory；工具等普通装备类别本就没有该字段
    const missingSubCategory = all.filter((item) =>
      (item.category === 'weapon' || item.category === 'armor' || item.category === 'shield') && !item.magicItemCategory)
    expect(missingSubCategory.map((item) => item.id)).toEqual([])
    // 稀有度不为 varies 的条目必须有明确加值或说明（描述长度已在上一用例覆盖）
    const emptyDescriptions = all.filter((item) => item.description.trim().length < 20)
    expect(emptyDescriptions.map((item) => item.id)).toEqual([])
  })

  it('第三方物品名称不得在同一规则集内重复（与官方条目重名也须避免）', () => {
    const thirdPartyByRuleset = {
      '5e-2014': rulesRepository2014.equipment.filter((item) => item.id.startsWith('equipment-2014-tp-')),
      '5e-2024': rulesRepository2024.equipment.filter((item) => item.id.startsWith('equipment-2024-tp-')),
    } as const
    for (const [ruleset, items] of Object.entries(thirdPartyByRuleset)) {
      expect(items.length, ruleset).toBeGreaterThan(0)
      const names = items.map((item) => item.name)
      expect(new Set(names).size, `${ruleset} 第三方物品存在重名`).toBe(names.length)
      // 与官方条目重名同样要避免：过滤掉官方的多型号聚合条目（PHB/DMG 同名属设计如此）
      const officialNames = new Set(
        repoOf(ruleset as '5e-2014' | '5e-2024').equipment
          .filter((item) => !item.id.startsWith(`equipment-${ruleset === '5e-2014' ? '2014' : '2024'}-tp-`))
          .map((item) => item.name),
      )
      const collisions = names.filter((name) => officialNames.has(name))
      expect([...new Set(collisions)], `${ruleset} 第三方物品与官方条目重名`).toEqual([])
    }
  })
})
