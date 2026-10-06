import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h, nextTick } from 'vue'
import { beforeEach, describe, expect, it } from 'vitest'
import InventoryEquipmentToggle from '@/components/InventoryEquipmentToggle.vue'
import { deriveCharacter } from '@/rules/derive'
import { getRulesRepository } from '@/rules/repositories'
import { CharacterJsonService } from '@/services/character-json'
import { CharacterPackageService } from '@/services/character-package'
import { useCharacterDraftsStore } from '@/stores/character-drafts'
import { useSessionAssistantStore } from '@/stores/session-assistant'
import type { InventoryEntry } from '@/types/character'
import CharacterSheetStep from '@/views/character-builder/components/CharacterSheetStep.vue'
import EquipmentStep from '@/views/character-builder/components/EquipmentStep.vue'
import SessionPanel from '@/views/session-assistant/components/SessionPanel.vue'

describe('物品装备操作', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('不可装备与未知物品不显示按钮，按钮明确表示卸下并发送条目 ID', async () => {
    const entry: InventoryEntry = { id: 'shield-entry', itemId: 'shield', sourceKind: 'class', quantity: 2, equippedQuantity: 2 }
    const repository = getRulesRepository('5e-2014')
    const wrapper = mount(InventoryEquipmentToggle, { props: { entry, equipment: repository.getEquipment('shield') } })
    expect(wrapper.get('button').text()).toBe('卸下')
    expect(wrapper.get('button').attributes('aria-pressed')).toBe('true')
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('toggle')).toEqual([['shield-entry']])
    await wrapper.setProps({ equipment: repository.equipment.find((item) => !item.equippable) })
    expect(wrapper.find('button').exists()).toBe(false)
    await wrapper.setProps({ equipment: undefined })
    expect(wrapper.find('button').exists()).toBe(false)
    wrapper.unmount()
  })

  for (const ruleset of ['5e-2014', '5e-2024'] as const) {
    for (const page of ['sheet', 'session'] as const) {
      it(`${ruleset} ${page} 起始物品与冒险物品可卸下、重新装备并持久化`, async () => {
        const store = useCharacterDraftsStore()
        const created = store.createDraft(ruleset)
        const modern = ruleset === '5e-2024'
        const shieldId = modern ? 'equipment-2024-shield' : 'shield'
        const armorId = modern ? 'equipment-2024-chain-mail' : 'chain-mail'
        const weaponId = modern ? 'equipment-2024-greatsword' : 'greatsword'
        const inventory: readonly InventoryEntry[] = [
          { id: 'shield-entry', itemId: shieldId, sourceKind: 'class', sourceId: created.classId, quantity: 2, equippedQuantity: 2 },
          { id: 'armor-entry', itemId: armorId, sourceKind: 'adventure', sourceId: 'adventure', quantity: 1, equippedQuantity: 1 },
          { id: 'weapon-entry', itemId: weaponId, sourceKind: 'adventure', quantity: 1, equippedQuantity: 1 },
        ]
        store.updateDraft({ classId: modern ? 'class-2024-fighter' : 'class-2014-fighter', targetLevel: 1, inventory })
        if (page === 'session') useSessionAssistantStore().setActiveTab('items')
        const Host = defineComponent({
          setup: () => () => {
            const draft = store.activeDraft
            if (!draft) throw new Error('missing active draft')
            return page === 'sheet'
              ? h(CharacterSheetStep, { draft, derived: deriveCharacter(draft), onChangeInventory: (value) => store.updateDraft({ inventory: value }) })
              : h(SessionPanel, { draft })
          },
        })
        const wrapper = mount(Host)
        if (page === 'sheet') await wrapper.get('[role="tab"]:nth-child(5)').trigger('click')
        expect(deriveCharacter(store.activeDraft ?? created).armorClass.value).toBe(18)
        expect(wrapper.text()).toContain('持盾时不能用这些武器进行双手攻击')
        await wrapper.get('[aria-label="卸下盾牌"]').trigger('click')
        await nextTick()
        expect(store.activeDraft?.inventory[0]).toEqual({ ...inventory[0], equippedQuantity: 0 })
        expect(deriveCharacter(store.activeDraft ?? created).armorClass.value).toBe(16)
        expect(wrapper.text()).not.toContain('持盾时不能用这些武器进行双手攻击')
        expect(wrapper.find('[aria-label="卸下盾牌"]').exists()).toBe(false)
        await wrapper.get('[aria-label="装备盾牌"]').trigger('click')
        expect(store.activeDraft?.inventory[0]?.equippedQuantity).toBe(1)
        await wrapper.get('[aria-label="卸下链甲"]').trigger('click')
        await wrapper.get('[aria-label="装备链甲"]').trigger('click')
        await wrapper.get('[aria-label="卸下巨剑"]').trigger('click')
        expect(wrapper.text()).not.toContain('持盾时不能用这些武器进行双手攻击')
        expect(deriveCharacter(store.activeDraft ?? created).armorClass.value).toBe(18)
        await wrapper.get('[aria-label="装备巨剑"]').trigger('click')
        expect(wrapper.text()).toContain('持盾时不能用这些武器进行双手攻击')
        await wrapper.get('[aria-label="卸下盾牌"]').trigger('click')
        await flushPromises()
        const draft = store.activeDraft
        if (!draft) throw new Error('missing active draft')
        const json = CharacterJsonService.importDraft(CharacterJsonService.exportDraft(draft))
        expect(json.inventory).toEqual(draft.inventory)
        const archive = await CharacterPackageService.build(draft)
        const restored = await CharacterPackageService.import(new Blob([archive as BlobPart]))
        expect(restored.inventory).toEqual(draft.inventory)
        wrapper.unmount()
        setActivePinia(createPinia())
        const reloaded = useCharacterDraftsStore().drafts.find((item) => item.id === created.id)
        expect(reloaded?.inventory).toEqual(draft.inventory)
        expect(deriveCharacter(reloaded ?? created).armorClass.value).toBe(16)
      })
    }
  }

  it('车卡装备步骤显示明确的卸下动作，卸下保留物品数量', async () => {
    const store = useCharacterDraftsStore()
    store.createDraft('5e-2014')
    store.updateDraft({ classId: 'class-2014-fighter', inventory: [{ id: 'shield-entry', itemId: 'shield', sourceKind: 'class', quantity: 1, equippedQuantity: 1 }] })
    const draft = store.activeDraft
    if (!draft) throw new Error('missing active draft')
    const wrapper = mount(EquipmentStep, { props: { draft } })
    await wrapper.get('[aria-label="卸下盾牌"]').trigger('click')
    expect(wrapper.emitted('change')?.[0]?.[1]).toEqual([{ ...draft.inventory[0], equippedQuantity: 0 }])
    wrapper.unmount()
  })
})
