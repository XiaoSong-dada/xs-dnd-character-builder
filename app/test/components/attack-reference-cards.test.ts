import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { defineComponent, h } from 'vue'
import { beforeEach, describe, expect, it } from 'vitest'
import { deriveCharacter } from '@/rules/derive'
import { useCharacterDraftsStore } from '@/stores/character-drafts'
import { useSessionAssistantStore } from '@/stores/session-assistant'
import type { CharacterManualEdits } from '@/types/character'
import CharacterSheetStep from '@/views/character-builder/components/CharacterSheetStep.vue'
import SessionPanel from '@/views/session-assistant/components/SessionPanel.vue'

describe('攻击参考卡编辑与跑团显示', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  for (const ruleset of ['5e-2014', '5e-2024'] as const) {
    it(`${ruleset} 四格独立编辑、跑团逐件读取、刷新保留与恢复默认`, async () => {
      const store = useCharacterDraftsStore()
      const created = store.createDraft(ruleset)
      const modern = ruleset === '5e-2024'
      store.updateDraft({ targetLevel: 1, classId: modern ? 'class-2024-paladin' : 'class-2014-paladin',
        baseAbilities: { str: 10, dex: 16, con: 12, int: 10, wis: 10, cha: 10 },
        inventory: ['greatsword', 'rapier'].map((slug) => ({ id: slug, itemId: modern ? `equipment-2024-${slug}` : slug, sourceKind: 'class', quantity: 1, equippedQuantity: 1 })),
      })
      const Host = defineComponent({ setup: () => () => {
        const draft = store.activeDraft
        if (!draft) throw new Error('missing draft')
        return h(CharacterSheetStep, { draft, derived: deriveCharacter(draft), onChangeManualEdits: (manualEdits: CharacterManualEdits) => store.updateDraft({ manualEdits }) })
      } })
      const wrapper = mount(Host)
      await wrapper.get('[role="tab"]:nth-child(2)').trigger('click')
      expect(wrapper.findAll('h3').map((heading) => heading.text())).toEqual(['主要武器', '使用灵巧武器'])
      const values = () => wrapper.findAll('.character-sheet__combat-stats strong').map((item) => Number(item.text()))
      expect(values()).toEqual([2, 0, 5, 3])
      const clickButton = async (text: string) => {
        const button = wrapper.findAll('button').find((item) => item.text().startsWith(text))
        if (!button) throw new Error(`missing ${text}`)
        await button.trigger('click')
      }
      await clickButton('编辑角色卡')
      for (const [index, value] of [4, -1, 9, 8].entries()) {
        const tile = wrapper.findAll('.character-sheet__combat-stats .editable-stat')[index]
        if (!tile) throw new Error('missing tile')
        await tile.trigger('dblclick')
        await tile.get('input').setValue(String(value))
        await tile.get('input').trigger('keydown', { key: 'Enter' })
      }
      expect(values()).toEqual([4, -1, 9, 8])
      expect(store.activeDraft?.manualEdits?.derivedAdjustments).toEqual({ attackBonus: 2, attackDamageBonus: -1, dexterityAttackBonus: 4, dexterityAttackDamageBonus: 5 })
      const draft = store.activeDraft
      if (!draft) throw new Error('missing draft')
      useSessionAssistantStore().setActiveTab('combat')
      const session = mount(SessionPanel, { props: { draft } })
      expect(session.text()).toContain('命中 +4 · 伤害 -1')
      expect(session.text()).toContain('命中 +9 · 伤害 +8')
      session.unmount()
      await flushPromises()
      setActivePinia(createPinia())
      const reloaded = useCharacterDraftsStore().drafts.find((item) => item.id === created.id)
      expect(reloaded?.manualEdits).toEqual(draft.manualEdits)
      await clickButton('更多')
      await clickButton('恢复系统默认')
      const confirm = Array.from(document.body.querySelectorAll('button')).find((item) => item.textContent === '确认恢复')
      if (!confirm) throw new Error('missing reset confirmation')
      confirm.click()
      await flushPromises()
      expect(values()).toEqual([2, 0, 5, 3])
      expect(store.activeDraft?.manualEdits?.derivedAdjustments).toEqual({})
      wrapper.unmount()
    })
  }
})
