import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { deriveCharacter } from '@/rules/derive'
import { useCharacterDraftsStore } from '@/stores/character-drafts'
import type { CharacterDraft } from '@/types/character'
import SessionAssistantPage from '@/views/session-assistant/index.vue'

function makeWizardDraft(store: ReturnType<typeof useCharacterDraftsStore>): CharacterDraft {
  store.createDraft()
  store.updateDraft({ name: '测试法师', classId: 'class-2014-wizard', targetLevel: 5 })
  return store.activeDraft as CharacterDraft
}

async function enterPanel(wrapper: ReturnType<typeof mount>): Promise<void> {
  await wrapper.get('.session-assistant__card').trigger('click')
}

describe('跑团助手 · 角色列表与导入', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('列表展示草稿卡片，点击进入局内面板（首次 HP=最大、法术位 0、无状态 tag）', async () => {
    const store = useCharacterDraftsStore()
    const draft = makeWizardDraft(store)
    const wrapper = mount(SessionAssistantPage, { attachTo: document.body })

    expect(wrapper.text()).toContain('测试法师')
    await enterPanel(wrapper)

    const maxHp = deriveCharacter(draft).hitPoints.value
    expect(wrapper.text()).toContain(`${maxHp} / ${maxHp}`)
    expect(wrapper.get('[aria-label="已挂载状态"]').text()).toBe('')
  })

  it('无草稿时展示空状态引导', () => {
    setActivePinia(createPinia())
    const wrapper = mount(SessionAssistantPage)
    expect(wrapper.text()).toContain('还没有角色')
  })

  it('导入合法 JSON 后直接进入该角色的局内面板', async () => {
    const store = useCharacterDraftsStore()
    const draft = makeWizardDraft(store)
    const raw = store.exportActiveDraft() as string
    // 清空列表，只保留导出内容
    store.deleteDraft(draft.id)

    const wrapper = mount(SessionAssistantPage, { attachTo: document.body })
    expect(wrapper.text()).toContain('还没有角色')

    const input = wrapper.get('input[type="file"]')
    Object.defineProperty(input.element, 'files', {
      value: [new File([raw], 'character.json', { type: 'application/json' })],
    })
    await input.trigger('change')
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(wrapper.text()).toContain('测试法师')
    expect(wrapper.text()).toContain('返回列表')
  })

  it('导入非法 JSON 展示中文错误且停留在列表', async () => {
    const wrapper = mount(SessionAssistantPage, { attachTo: document.body })
    const input = wrapper.get('input[type="file"]')
    Object.defineProperty(input.element, 'files', {
      value: [new File(['not-json'], 'bad.json', { type: 'application/json' })],
    })
    await input.trigger('change')
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(wrapper.text()).toContain('文件不是有效的 JSON。')
    expect(wrapper.text()).toContain('还没有角色')
  })

  it('状态保持：刷新（store 重建）后自动回到原角色与原页签', async () => {
    const store = useCharacterDraftsStore()
    makeWizardDraft(store)
    const wrapper = mount(SessionAssistantPage, { attachTo: document.body })
    await wrapper.get('.session-assistant__card').trigger('click')
    await wrapper.get('[role="tab"]:nth-child(4)').trigger('click')
    wrapper.unmount()

    // 模拟刷新：重建 pinia（草稿与视图状态均已持久化到 localStorage）
    setActivePinia(createPinia())
    const wrapper2 = mount(SessionAssistantPage, { attachTo: document.body })
    expect(wrapper2.text()).toContain('测试法师')
    expect(wrapper2.text()).toContain('返回列表')
    expect(wrapper2.find('[role="tab"][aria-selected="true"]').text()).toBe('法术')
    wrapper2.unmount()
  })

  it('持久化的角色已删除时回退列表', async () => {
    localStorage.setItem('dnd-session-assistant:view:v1', JSON.stringify({ selectedDraftId: 'ghost-id', activeTab: 'combat' }))
    const store = useCharacterDraftsStore()
    makeWizardDraft(store)
    const wrapper = mount(SessionAssistantPage, { attachTo: document.body })
    expect(wrapper.find('.session-panel').exists()).toBe(false)
    expect(wrapper.text()).toContain('测试法师')
    wrapper.unmount()
  })
})

describe('跑团助手 · 局内面板操作', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  async function mountPanel(): Promise<{ wrapper: ReturnType<typeof mount>; store: ReturnType<typeof useCharacterDraftsStore>; draft: CharacterDraft }> {
    const store = useCharacterDraftsStore()
    const draft = makeWizardDraft(store)
    const wrapper = mount(SessionAssistantPage, { attachTo: document.body })
    await enterPanel(wrapper)
    return { wrapper, store, draft }
  }

  it('HP 增减：输入数量生效，空输入按 1，越界提示中文原因', async () => {
    const { wrapper, draft } = await mountPanel()
    const maxHp = deriveCharacter(draft).hitPoints.value
    const input = wrapper.get('[aria-label="生命值调整数量"]')

    // 空输入点 − → 减 1
    await wrapper.get('[aria-label="减少生命值"]').trigger('click')
    expect(wrapper.text()).toContain(`${maxHp - 1} / ${maxHp}`)

    // 输入 5 点 − → 再减 5
    await input.setValue('5')
    await wrapper.get('[aria-label="减少生命值"]').trigger('click')
    expect(wrapper.text()).toContain(`${maxHp - 6} / ${maxHp}`)

    // 输入 100 点 ＋ → 超过最大值被拒并提示
    await input.setValue('100')
    await wrapper.get('[aria-label="增加生命值"]').trigger('click')
    expect(wrapper.text()).toContain('生命值不能超过最大生命值')
    expect(wrapper.text()).toContain(`${maxHp - 6} / ${maxHp}`)
  })

  it('金币添加/减少/设置写回 adventureGold（与角色卡页共享事实源）', async () => {
    const { wrapper, store } = await mountPanel()
    const input = wrapper.get('[aria-label="金币调整数值"]')
    const button = (text: string) => wrapper.findAll('.session-panel__gold-actions button').find((item) => item.text() === text)!

    await input.setValue('10')
    await button('添加').trigger('click')
    expect(store.activeDraft?.adventureGold).toBe(10)

    await input.setValue('4')
    await button('减少').trigger('click')
    expect(store.activeDraft?.adventureGold).toBe(6)

    await input.setValue('99')
    await button('设置').trigger('click')
    expect(store.activeDraft?.adventureGold).toBe(99 - store.activeDraft!.currency.gp)
  })

  it('法术位「−」使用、「＋」恢复：可用/总量显示并钳制在总量内', async () => {
    const { wrapper } = await mountPanel()
    // 战斗页签：总览/能力/战斗/法术/物品/状态 → 第 3 个
    await wrapper.get('[role="tab"]:nth-child(3)').trigger('click')

    // 5 级法师：2 环 3 个 → 可用 3 / 3
    expect(wrapper.text()).toContain('可用 3 / 3')
    const use2 = wrapper.get('[aria-label="使用2环法术位"]')
    const restore2 = wrapper.get('[aria-label="恢复2环法术位"]')

    // 「−」使用：可用 3 → 2
    await use2.trigger('click')
    expect(wrapper.text()).toContain('可用 2 / 3')
    await use2.trigger('click')
    await use2.trigger('click')
    // 用尽后再点 → 提示
    await use2.trigger('click')
    expect(wrapper.text()).toContain('2环法术位已用尽')

    // 「＋」恢复：可用 0 → 1
    await restore2.trigger('click')
    expect(wrapper.text()).toContain('可用 1 / 3')
  })

  it('法术页签：已准备法术按环分组展示，施法弹层支持升环并消耗环位', async () => {
    const { wrapper, store, draft } = await mountPanel()
    // 给法师准备法术：火球术（3 环）、闪电束（3 环）
    store.updateDraft({
      spellSelections: {
        ...draft.spellSelections,
        preparedSpellIds: ['spell-2014-fireball', 'spell-2014-lightning-bolt'],
      },
    })
    await wrapper.get('[role="tab"]:nth-child(4)').trigger('click')

    expect(wrapper.text()).toContain('3环 · 已准备 2')
    expect(wrapper.text()).toContain('火球术')
    expect(wrapper.text()).toContain('法术位 可用 2 / 2')

    // 点击施法 → 弹层列出 3 环（升环 4/5 环不可用因为 5 级法师最高 3 环）
    const castButton = wrapper.findAll('.session-panel__adjust').find((item) => item.text() === '施法')!
    await castButton.trigger('click')
    expect(document.body.textContent).toContain('消耗 3 环法术位')

    // 选择 3 环 → 可用 2 → 1
    const levelButton = Array.from(document.body.querySelectorAll<HTMLButtonElement>('.session-panel__cast-level'))
      .find((button) => button.textContent?.includes('3'))!
    levelButton.click()
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(wrapper.text()).toContain('法术位 可用 1 / 2')
    expect(wrapper.text()).toContain('已使用 3 环法术位')
  })

  it('能力页签：豁免/技能网格与职业特性渲染', async () => {
    const { wrapper } = await mountPanel()
    await wrapper.get('[role="tab"]:nth-child(2)').trigger('click')

    // 豁免区块（法师：智力/感知熟练）
    expect(wrapper.text()).toContain('豁免')
    expect(wrapper.text()).toContain('智力')
    // 职业特性（法师 5 级已解锁）
    expect(wrapper.text()).toContain('职业特性 · 法师')
    expect(wrapper.text()).toContain('奥术回想')
  })

  it('debuff 挂摘与顶部 tag 联动；tag 可点击查看详情', async () => {
    const { wrapper } = await mountPanel()
    await wrapper.get('[role="tab"]:nth-child(6)').trigger('click')

    const statusCard = (name: string) => wrapper.findAll('.session-panel__status-card').find((item) => item.text() === name)!
    await statusCard('中毒').trigger('click')
    expect(wrapper.get('[aria-label="已挂载状态"]').text()).toContain('中毒')

    // 点击顶部 tag 查看详情
    await wrapper.get('.session-panel__tag').trigger('click')
    expect(document.body.textContent).toContain('攻击检定与属性检定有劣势')
    document.body.querySelector<HTMLButtonElement>('[aria-label="关闭"]')?.click()
    await new Promise((resolve) => setTimeout(resolve, 0))

    // 再点一次摘除 → tag 消失
    await statusCard('中毒').trigger('click')
    expect(wrapper.get('[aria-label="已挂载状态"]').text()).not.toContain('中毒')
  })

  it('力竭层数增减：tag 显示「力竭 ×N」，0 时消失，范围 0—6', async () => {
    const { wrapper } = await mountPanel()
    await wrapper.get('[role="tab"]:nth-child(6)').trigger('click')

    await wrapper.get('[aria-label="增加力竭层数"]').trigger('click')
    await wrapper.get('[aria-label="增加力竭层数"]').trigger('click')
    expect(wrapper.get('[aria-label="已挂载状态"]').text()).toContain('力竭 ×2')

    // 连点 10 次仍钳制在 6
    for (let i = 0; i < 10; i += 1) await wrapper.get('[aria-label="增加力竭层数"]').trigger('click')
    expect(wrapper.get('[aria-label="已挂载状态"]').text()).toContain('力竭 ×6')
    expect(wrapper.text()).toContain('力竭层数范围 0—6')

    await wrapper.get('[aria-label="减少力竭层数"]').trigger('click')
    expect(wrapper.get('[aria-label="已挂载状态"]').text()).toContain('力竭 ×5')
  })

  it('短休息回半血并保留撤回入口；撤回恢复快照且入口消失', async () => {
    const { wrapper, draft } = await mountPanel()
    const maxHp = deriveCharacter(draft).hitPoints.value

    // 先扣 20 血
    const input = wrapper.get('[aria-label="生命值调整数量"]')
    await input.setValue('20')
    await wrapper.get('[aria-label="减少生命值"]').trigger('click')
    expect(wrapper.text()).toContain(`${maxHp - 20} / ${maxHp}`)

    const shortRestButton = () => wrapper.findAll('.session-panel__rest-button').find((item) => item.text() === '短休息')!
    await shortRestButton().trigger('click')

    // 回一半损失：20 → +10
    expect(wrapper.text()).toContain(`${maxHp - 10} / ${maxHp}`)

    // 撤回
    const undoButton = () => wrapper.findAll('.session-panel__rest-button').find((item) => item.text() === '撤回上次休息')!
    await undoButton().trigger('click')
    expect(wrapper.text()).toContain(`${maxHp - 20} / ${maxHp}`)
    expect(undoButton()).toBeUndefined()
  })

  it('长休息需确认：取消不变，确认后全恢复并清空 debuff/力竭', async () => {
    const { wrapper, draft } = await mountPanel()
    const maxHp = deriveCharacter(draft).hitPoints.value

    const input = wrapper.get('[aria-label="生命值调整数量"]')
    await input.setValue('15')
    await wrapper.get('[aria-label="减少生命值"]').trigger('click')
    await wrapper.get('[role="tab"]:nth-child(6)').trigger('click')
    const statusCard = wrapper.findAll('.session-panel__status-card').find((item) => item.text() === '中毒')!
    await statusCard.trigger('click')
    await wrapper.get('[aria-label="增加力竭层数"]').trigger('click')

    const longRestButton = () => wrapper.findAll('.session-panel__rest-button').find((item) => item.text() === '长休息')!
    longRestButton().trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 0))

    // 取消：无变化
    const cancel = Array.from(document.body.querySelectorAll<HTMLButtonElement>('.ui-modal button')).find((button) => button.textContent?.trim() === '取消')
    cancel?.click()
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(wrapper.text()).toContain(`${maxHp - 15} / ${maxHp}`)

    // 确认：全恢复
    longRestButton().trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 0))
    const confirm = Array.from(document.body.querySelectorAll<HTMLButtonElement>('.ui-modal button')).find((button) => button.textContent?.trim() === '确认休息')
    confirm?.click()
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(wrapper.text()).toContain(`${maxHp} / ${maxHp}`)
    expect(wrapper.get('[aria-label="已挂载状态"]').text()).toBe('')
  })
})
