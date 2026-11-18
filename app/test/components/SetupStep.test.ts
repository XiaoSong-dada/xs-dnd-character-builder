import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import SetupStep from '@/views/character-builder/components/SetupStep.vue'
import { draft2024 } from '../fixtures/draft-2024'

/** 第一页现在由分配控件承载等级（MC-E02），测试提供一份单职业草稿。 */
const SETUP_DRAFT = draft2024({ ruleset: '5e-2014', classId: 'class-2014-fighter', targetLevel: 3 })

type Wrapper = ReturnType<typeof mount>

/** 任务卡：进入指定任务后再断言该任务的候选与状态。 */
async function openTask(wrapper: Wrapper, id: string): Promise<void> {
  await wrapper.get(`[data-task-id="${id}"]`).trigger('click')
}

function optionCard(wrapper: Wrapper, text: string) {
  return wrapper.findAll('.option-card').find((card) => card.text().includes(text))
}

describe('SetupStep 任务式引导（参照第 4 步）', () => {
  it('按规则版本／等级与兼职／属性生成方式组织任务，展示当前项、完成状态与已选摘要', () => {
    const wrapper = mount(SetupStep, { props: { draft: SETUP_DRAFT, abilityMethod: 'standard-array', ruleset: '5e-2014' } })

    expect(wrapper.findAll('[data-task-id]').map((task) => task.attributes('data-task-id'))).toEqual(['ruleset', 'level', 'ability-method'])
    expect(wrapper.get('[data-task-id="ruleset"]').attributes('aria-selected')).toBe('true')
    expect(wrapper.get('[data-task-id="ruleset"]').text()).toContain('规则版本')
    expect(wrapper.get('[data-task-id="ruleset"]').text()).toContain('2014 核心规则')
    expect(wrapper.get('[data-task-id="level"]').text()).toContain('等级与兼职')
    expect(wrapper.get('[data-task-id="level"]').text()).toContain('战士 3 级')
    expect(wrapper.get('[data-task-id="ability-method"]').text()).toContain('标准数组')
    expect(wrapper.get('#builder-step-tasks').text()).toContain('3 / 3 已完成')
    // 当前项高亮由面板标题承接，方便读屏与键盘用户确认当前任务。
    expect(wrapper.get('.setup-step__panel h2').text()).toBe('规则版本')
  })

  it('沿用默认值时任务直接视为完成，不出现待完成提示', () => {
    const fresh = draft2024({ ruleset: '5e-2014', classId: undefined, targetLevel: 1 })
    const wrapper = mount(SetupStep, { props: { draft: fresh, abilityMethod: 'standard-array', ruleset: '5e-2014' } })

    expect(wrapper.get('#builder-step-tasks').text()).toContain('3 / 3 已完成')
    expect(wrapper.text()).not.toContain('待完成')
    expect(wrapper.get('[data-task-id="level"]').text()).toContain('目标 1 级 · 尚未选职业')
  })

  it('支持自由跳转，且每次只展示当前任务的候选', async () => {
    const wrapper = mount(SetupStep, { props: { draft: SETUP_DRAFT, abilityMethod: 'standard-array', ruleset: '5e-2014' } })

    expect(wrapper.findAll('.option-card').some((card) => card.text().includes('27点购点'))).toBe(false)
    await openTask(wrapper, 'level')
    expect(wrapper.get('[data-task-id="level"]').attributes('aria-selected')).toBe('true')
    expect(wrapper.find('.allocation__slider input[type="range"]').exists()).toBe(true)
    expect(wrapper.findAll('.option-card')).toHaveLength(0)

    await openTask(wrapper, 'ability-method')
    expect(wrapper.find('.allocation__slider').exists()).toBe(false)
    expect(optionCard(wrapper, '标准数组')).toBeTruthy()
  })

  it('当前项的值变化后自动进入下一项', async () => {
    const wrapper = mount(SetupStep, { props: { draft: SETUP_DRAFT, abilityMethod: 'standard-array', ruleset: '5e-2014' } })

    await optionCard(wrapper, '2024 核心规则')!.trigger('click')
    expect(wrapper.emitted('ruleset')).toEqual([['5e-2024']])
    await wrapper.setProps({ draft: { ...SETUP_DRAFT, ruleset: '5e-2024' }, ruleset: '5e-2024' })
    expect(wrapper.get('[data-task-id="level"]').attributes('aria-selected')).toBe('true')
    expect(wrapper.get('.setup-step__panel h2').text()).toBe('等级与兼职')

    await wrapper.setProps({ draft: { ...SETUP_DRAFT, ruleset: '5e-2024', targetLevel: 4 }, ruleset: '5e-2024' })
    expect(wrapper.get('[data-task-id="ability-method"]').attributes('aria-selected')).toBe('true')
  })

  it('最后一项变化后留在本步，并引导点击底部「继续」', async () => {
    const wrapper = mount(SetupStep, { props: { draft: { ...SETUP_DRAFT, abilityMethod: 'custom' }, abilityMethod: 'custom', ruleset: '5e-2014' } })

    await openTask(wrapper, 'ability-method')
    expect(wrapper.get('.setup-step__panel').text()).toContain('点底部「继续」进入第 2 步')

    await optionCard(wrapper, '27点购点')!.trigger('click')
    expect(wrapper.emitted('method')).toEqual([['point-buy']])
    await wrapper.setProps({ draft: { ...SETUP_DRAFT, abilityMethod: 'point-buy' }, abilityMethod: 'point-buy' })
    expect(wrapper.get('[data-task-id="ability-method"]').attributes('aria-selected')).toBe('true')
  })

  it('开启兼职时提示起始职业及其承载内容', async () => {
    const multiclassDraft = draft2024({
      ruleset: '5e-2014',
      targetLevel: 5,
      multiclass: {
        enabled: true,
        primaryClassId: 'class-2014-fighter',
        classes: [{ classId: 'class-2014-fighter', level: 3 }, { classId: 'class-2014-rogue', level: 2 }],
        levelOrder: ['class-2014-fighter', 'class-2014-fighter', 'class-2014-fighter', 'class-2014-rogue', 'class-2014-rogue'],
      },
    })
    const wrapper = mount(SetupStep, { props: { draft: multiclassDraft, abilityMethod: 'standard-array', ruleset: '5e-2014' } })

    expect(wrapper.get('[data-task-id="level"]').text()).toContain('战士3 / 游荡者2（5 级角色）')
    expect(wrapper.get('[data-task-id="level"]').text()).toContain('起始职业：战士')
    await openTask(wrapper, 'level')
    expect(wrapper.get('.setup-step__panel').text()).toContain('承载 1 级生命值、起始装备与豁免熟练')
    expect(wrapper.findAll('button').some((button) => button.text() === '设置起始职业')).toBe(true)
  })
})

describe('SetupStep 属性生成方式选择', () => {
  it('选中非标准数组时，标准数组卡片不带选中/推荐样式', async () => {
    const wrapper = mount(SetupStep, { props: { draft: SETUP_DRAFT, abilityMethod: 'point-buy', ruleset: '5e-2014' } })
    await openTask(wrapper, 'ability-method')

    const standard = optionCard(wrapper, '标准数组')
    expect(standard).toBeTruthy()
    expect(standard!.classes()).toContain('option-card--default')
    expect(standard!.classes()).not.toContain('option-card--selected')
    expect(standard!.classes()).not.toContain('option-card--recommended')

    const pointBuy = optionCard(wrapper, '27点购点')
    expect(pointBuy!.classes()).toContain('option-card--selected')
  })

  it('选中标准数组时仅标准数组卡片带选中样式', async () => {
    const wrapper = mount(SetupStep, { props: { draft: SETUP_DRAFT, abilityMethod: 'standard-array', ruleset: '5e-2014' } })
    await openTask(wrapper, 'ability-method')

    expect(optionCard(wrapper, '标准数组')!.classes()).toContain('option-card--selected')
    const others = wrapper.findAll('.option-card').filter((card) => !card.text().includes('标准数组') && !card.text().includes('核心规则'))
    expect(others.every((card) => !card.classes().includes('option-card--selected'))).toBe(true)
  })

  it('点击卡片触发 method 事件', async () => {
    const wrapper = mount(SetupStep, { props: { draft: SETUP_DRAFT, abilityMethod: 'standard-array', ruleset: '5e-2014' } })
    await openTask(wrapper, 'ability-method')

    await optionCard(wrapper, '自定义')!.trigger('click')

    expect(wrapper.emitted('method')).toEqual([['custom']])
  })
})

describe('SetupStep 规则版本选择（B09-01）', () => {
  function rulesetCard(wrapper: Wrapper, label: string) {
    return wrapper.findAll('.option-card').find((card) => card.text().includes(label))
  }

  it('规则版本任务展示两版卡片，27 点购点说明随版本变化', async () => {
    const wrapper = mount(SetupStep, { props: { draft: SETUP_DRAFT, abilityMethod: 'standard-array', ruleset: '5e-2024' } })

    expect(rulesetCard(wrapper, '2014 核心规则')).toBeTruthy()
    expect(rulesetCard(wrapper, '2024 核心规则')!.classes()).toContain('option-card--selected')
    expect(rulesetCard(wrapper, '2014 核心规则')!.classes()).not.toContain('option-card--selected')

    await openTask(wrapper, 'ability-method')
    expect(optionCard(wrapper, '27点购点')!.text()).toContain('2024 官方购点')
  })

  it('选择版本触发 ruleset 事件，且不改动等级与属性方式事件', async () => {
    const wrapper = mount(SetupStep, { props: { draft: SETUP_DRAFT, abilityMethod: 'point-buy', ruleset: '5e-2014' } })
    await openTask(wrapper, 'ruleset')

    await rulesetCard(wrapper, '2024 核心规则')!.trigger('click')

    expect(wrapper.emitted('ruleset')).toEqual([['5e-2024']])
    expect(wrapper.emitted('level')).toBeUndefined()
    expect(wrapper.emitted('method')).toBeUndefined()
  })

  it('已有构筑时点击另一版本触发另建（不锁定卡片）并给出说明', async () => {
    const wrapper = mount(SetupStep, { props: { draft: SETUP_DRAFT, abilityMethod: 'standard-array', ruleset: '5e-2014', rulesetLocked: true } })

    const modern = rulesetCard(wrapper, '2024 核心规则')!
    expect(modern.classes()).not.toContain('option-card--locked')
    expect(wrapper.text()).toContain('已有构筑选择：改用另一版本会另建角色')
    await modern.trigger('click')
    expect(wrapper.emitted('ruleset')).toEqual([['5e-2024']])
    // 另建确认未完成前不推进：只有草稿真正换版后才进入下一项。
    expect(wrapper.get('[data-task-id="ruleset"]').attributes('aria-selected')).toBe('true')
  })

  it('记忆版本未开放时给出回退说明', () => {
    const wrapper = mount(SetupStep, { props: { draft: SETUP_DRAFT, abilityMethod: 'standard-array', ruleset: '5e-2014', rulesetFallback: '5e-2024' } })

    expect(wrapper.text()).toContain('已改用 2014 新建')
    expect(wrapper.text()).toContain('暂未开放')
  })
})
