import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { deriveCharacter } from '@/rules/derive'
import { manualFeatParentCheckpointId } from '@/rules/feats'
import type { CharacterDraft } from '@/types/character'
import CharacterSheetStep from '@/views/character-builder/components/CharacterSheetStep.vue'
import { draft2024, selection } from '../fixtures/draft-2024'

function buttonByText(root: ParentNode, text: string): HTMLButtonElement | undefined {
  return Array.from(root.querySelectorAll<HTMLButtonElement>('button'))
    .find((button) => button.textContent?.trim() === text)
}

async function openAbilityEdit(wrapper: ReturnType<typeof mount<typeof CharacterSheetStep>>): Promise<void> {
  await wrapper.get('[role="tab"]:nth-child(3)').trigger('click')
  await buttonByText(wrapper.element, '编辑角色卡')!.click()
  await wrapper.vm.$nextTick()
}

describe('CharacterSheetStep 手动专长', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    document.body.innerHTML = ''
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('仅在编辑模式的能力页提供添加专长入口', async () => {
    const draft = draft2024({ targetLevel: 4 })
    const wrapper = mount(CharacterSheetStep, {
      props: { draft, derived: deriveCharacter(draft) },
      attachTo: document.body,
    })

    await wrapper.get('[role="tab"]:nth-child(3)').trigger('click')
    expect(buttonByText(wrapper.element, '添加专长')).toBeUndefined()
    await buttonByText(wrapper.element, '编辑角色卡')!.click()
    await wrapper.vm.$nextTick()
    expect(buttonByText(wrapper.element, '添加专长')).toBeDefined()

    buttonByText(wrapper.element, '添加专长')!.click()
    await wrapper.vm.$nextTick()
    expect(document.body.textContent).toContain('先决条件仅提示，不阻止 DM／手工添加')
  })

  it('显示手动来源与待配置状态，移除时只清理该实例及其子选择', async () => {
    const base = draft2024({ targetLevel: 4 })
    const instanceId = 'manual-skilled-a'
    const siblingId = 'manual-skilled-b'
    const parentId = manualFeatParentCheckpointId(instanceId)
    const childId = `feat-child:${parentId}:feat-2024-skilled:proficiencies`
    const siblingChildId = `feat-child:${manualFeatParentCheckpointId(siblingId)}:feat-2024-skilled:proficiencies`
    const draft: CharacterDraft = {
      ...base,
      selections: [
        selection(childId, ['skill-arcana']),
        selection(siblingChildId, ['skill-history', 'skill-nature', 'skill-religion']),
      ],
      manualEdits: {
        ...base.manualEdits,
        addedFeats: [
          { instanceId, featId: 'feat-2024-skilled', addedAt: '2026-09-30T00:00:00.000Z' },
          { instanceId: siblingId, featId: 'feat-2024-skilled', addedAt: '2026-09-30T00:00:00.000Z' },
        ],
      },
    }
    const wrapper = mount(CharacterSheetStep, {
      props: { draft, derived: deriveCharacter(draft) },
      attachTo: document.body,
    })

    await openAbilityEdit(wrapper)
    expect(wrapper.text()).toContain('手动添加')
    expect(wrapper.text()).toContain('待配置')
    expect(buttonByText(wrapper.element, '继续配置')).toBeDefined()

    const firstManualCard = wrapper.findAll('.expandable-option-card')
      .find((card) => card.text().includes('手动添加') && card.text().includes('待配置'))!
    const removeButton = firstManualCard.findAll('button').find((button) => button.text() === '移除')
    expect(removeButton).toBeDefined()
    await removeButton!.trigger('click')
    await wrapper.vm.$nextTick()
    expect(document.body.textContent).toContain('将同时失去其结构化效果与本实例的子选择')
    buttonByText(document.body, '确认移除')!.click()
    await wrapper.vm.$nextTick()

    const manualEdits = wrapper.emitted('changeManualEdits')?.at(-1)?.[0] as CharacterDraft['manualEdits']
    expect(manualEdits?.addedFeats.map((grant) => grant.instanceId)).toEqual([siblingId])
    const selections = wrapper.emitted('changeSelections')?.at(-1)?.[0] as CharacterDraft['selections']
    expect(selections.map((item) => item.checkpointId)).toEqual([siblingChildId])
  })
})
