import { describe, expect, it } from 'vitest'

import { rulesRepository2024 } from '@/rules/repositories'
import { classStartingEquipment2024 } from '@/rules/data/starting-equipment-2024'
import { buildStartingEquipmentState, isStartingEquipmentComplete } from '@/rules/starting-equipment'
import { draft2024 } from '../fixtures/draft-2024'

function profileFor(classId: string) {
  const profile = classStartingEquipment2024.find((item) => item.classId === classId)
  if (!profile) throw new Error(`缺少 ${classId} 起始装备`)
  return profile
}

function optionFor(classId: string, optionId: string) {
  const option = profileFor(classId).groups.flatMap((group) => group.options).find((item) => item.id === optionId)
  if (!option) throw new Error(`缺少 ${optionId}`)
  return option
}

describe('2024 职业起始装备（战士／法师 B07-A；野蛮人／武僧／游荡者补录）', () => {
  it('已接入的 2024 职业都有装备方案，方案引用均可解析', () => {
    const implemented = rulesRepository2024.classes
      .filter((classRule) => classRule.status === 'implemented')
      .map((classRule) => classRule.id)
      .sort()
    expect(classStartingEquipment2024.map((item) => item.classId).sort()).toEqual(implemented)

    for (const profile of classStartingEquipment2024) {
      for (const group of profile.groups) {
        expect(group.options.length, profile.classId).toBeGreaterThan(1)
        for (const option of group.options) {
          const hasContent = option.grants.length > 0 || Boolean(option.pick) || Boolean(option.currency)
          expect(hasContent, option.id).toBe(true)
          for (const grant of option.grants) {
            expect(rulesRepository2024.getEquipment(grant.itemId), `${option.id}:${grant.itemId}`).toBeDefined()
            expect(grant.quantity).toBeGreaterThan(0)
          }
          for (const id of option.pick?.allowedItemIds ?? []) {
            expect(rulesRepository2024.getEquipment(id), `${option.id}:${id}`).toBeDefined()
          }
        }
      }
    }
  })

  it('野蛮人 A：巨斧、4 手斧、探索套组与 15 GP；B：75 GP', () => {
    const optionA = optionFor('class-2024-barbarian', 'barbarian-2024-a')
    expect(optionA.grants.map((grant) => [grant.itemId, grant.quantity])).toEqual([
      ['equipment-2024-greataxe', 1],
      ['equipment-2024-handaxe', 4],
      ['equipment-2024-explorer-s-pack', 1],
    ])
    expect(optionA.currency?.gp).toBe(15)
    expect(optionFor('class-2024-barbarian', 'barbarian-2024-b').currency?.gp).toBe(75)
  })

  it('游荡者 A：皮甲、2 匕首、短剑、短弓、20 箭矢、箭袋、盗贼工具、窃贼套组与 8 GP；B：100 GP', () => {
    const optionA = optionFor('class-2024-rogue', 'rogue-2024-a')
    expect(optionA.grants.map((grant) => [grant.itemId, grant.quantity])).toEqual([
      ['equipment-2024-leather-armor', 1],
      ['equipment-2024-dagger', 2],
      ['equipment-2024-shortsword', 1],
      ['equipment-2024-shortbow', 1],
      ['equipment-2024-ammunition', 20],
      ['equipment-2024-quiver', 1],
      ['equipment-2024-thieves-tools', 1],
      ['equipment-2024-burglar-s-pack', 1],
    ])
    expect(optionA.currency?.gp).toBe(8)
    expect(optionFor('class-2024-rogue', 'rogue-2024-b').currency?.gp).toBe(100)
  })

  it('野蛮人方案选择后装备状态可生成，未选择时不完整', () => {
    const base = draft2024({ classId: 'class-2024-barbarian', targetLevel: 1 })
    expect(isStartingEquipmentComplete(base)).toBe(false)

    const selected = {
      ...base,
      startingEquipmentSelections: [{ groupId: 'barbarian-2024-starting', optionId: 'barbarian-2024-a', pickedItemIds: [] }],
    }
    expect(isStartingEquipmentComplete(selected)).toBe(true)
    const state = buildStartingEquipmentState(selected)
    expect(state.currency.gp).toBe(15)
    expect(state.inventory.find((entry) => entry.itemId === 'equipment-2024-greataxe')?.quantity).toBe(1)
    expect(state.inventory.find((entry) => entry.itemId === 'equipment-2024-handaxe')?.quantity).toBe(4)
    // 探索套组按内容展开为具体物品。
    expect(state.inventory.some((entry) => entry.itemId === 'equipment-2024-bedroll')).toBe(true)
  })

  it('武僧方案的工具选择完成前不完整，选择具体工具后完整并写入物品栏', () => {
    const base = draft2024({ classId: 'class-2024-monk', targetLevel: 1 })
    expect(isStartingEquipmentComplete(base)).toBe(false)

    const withoutPick = {
      ...base,
      startingEquipmentSelections: [{ groupId: 'monk-2024-starting', optionId: 'monk-2024-a', pickedItemIds: [] }],
    }
    expect(isStartingEquipmentComplete(withoutPick)).toBe(false)

    const withPick = {
      ...base,
      startingEquipmentSelections: [{ groupId: 'monk-2024-starting', optionId: 'monk-2024-a', pickedItemIds: ['equipment-2024-lute'] }],
    }
    expect(isStartingEquipmentComplete(withPick)).toBe(true)
    const state = buildStartingEquipmentState(withPick)
    expect(state.currency.gp).toBe(11)
    expect(state.inventory.find((entry) => entry.itemId === 'equipment-2024-lute')?.quantity).toBe(1)
    expect(state.inventory.find((entry) => entry.itemId === 'equipment-2024-dagger')?.quantity).toBe(5)
  })
})
