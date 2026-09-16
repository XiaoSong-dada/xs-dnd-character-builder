import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { beforeEach, describe, expect, it } from 'vitest'

import AddItemModal from '@/components/AddItemModal.vue'
import { useSessionAssistantStore } from '@/stores/session-assistant'
import SessionPanel from '@/views/session-assistant/components/SessionPanel.vue'

import { draft2024, emptySpellSelections } from '../../fixtures/draft-2024'

/**
 * 会话面板显示层回归：名称与条目必须按 `draft.ruleset` 解析。
 * 2024 草稿若误用 2014 静态仓库，会出现特性/法术为空、物品显示英文 ID 的现象。
 */
describe('SessionPanel 按草稿版本解析显示数据', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('2024 草稿显示职业/子职特性、法术与物品中文名（不显示英文 ID）', async () => {
    const draft = draft2024({
      id: 'session-panel-2024',
      classId: 'class-2024-cleric',
      subclassId: 'subclass-2024-cleric-life-domain',
      targetLevel: 3,
      spellSelections: {
        ...emptySpellSelections(),
        cantripIds: ['spell-2024-guidance'],
        preparedSpellIds: ['spell-2024-bless'],
      },
      inventory: [
        { id: 'inv-longsword-2024', itemId: 'equipment-2024-longsword', quantity: 1, equippedQuantity: 1, sourceKind: 'class' },
      ],
    })
    const wrapper = mount(SessionPanel, { props: { draft } })
    const store = useSessionAssistantStore()

    // 头部职业名
    expect(wrapper.text()).toContain('3级 牧师')

    // 能力页签：职业特性 / 子职特性
    store.setActiveTab('features')
    await nextTick()
    expect(wrapper.text()).toContain('职业特性 · 牧师')
    expect(wrapper.text()).toContain('引导神力')
    expect(wrapper.text()).toContain('子职特性 · 生命领域')
    expect(wrapper.text()).toContain('生命门徒')
    expect(wrapper.text()).not.toContain('cleric-2024')
    expect(wrapper.text()).not.toContain('subclass-2024')

    // 法术页签：戏法 + 已准备法术
    store.setActiveTab('spells')
    await nextTick()
    expect(wrapper.text()).toContain('神导术')
    expect(wrapper.text()).toContain('祝福术')
    expect(wrapper.text()).not.toContain('spell-2024-')

    // 物品页签：中文名 + 伤害摘要
    store.setActiveTab('items')
    await nextTick()
    expect(wrapper.text()).toContain('长剑')
    expect(wrapper.text()).toContain('1d8')
    expect(wrapper.text()).not.toContain('equipment-2024-')

    // 添加物品弹窗按草稿版本渲染目录
    expect(wrapper.findComponent(AddItemModal).props('ruleset')).toBe('5e-2024')
  })

  it('2014 草稿行为不变（职业特性与物品中文名照旧）', async () => {
    const draft = draft2024({
      id: 'session-panel-2014',
      ruleset: '5e-2014',
      classId: 'class-2014-fighter',
      targetLevel: 2,
      inventory: [
        { id: 'inv-longsword-2014', itemId: 'longsword', quantity: 1, equippedQuantity: 1, sourceKind: 'class' },
      ],
    })
    const wrapper = mount(SessionPanel, { props: { draft } })
    const store = useSessionAssistantStore()

    expect(wrapper.text()).toContain('2级 战士')

    store.setActiveTab('features')
    await nextTick()
    expect(wrapper.text()).toContain('职业特性 · 战士')
    expect(wrapper.text()).toContain('回气')

    store.setActiveTab('items')
    await nextTick()
    expect(wrapper.text()).toContain('长剑')
    expect(wrapper.text()).not.toContain('longsword')

    expect(wrapper.findComponent(AddItemModal).props('ruleset')).toBe('5e-2014')
  })
})
