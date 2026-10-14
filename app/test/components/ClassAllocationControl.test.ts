import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ClassAllocationControl from '@/views/character-builder/components/ClassAllocationControl.vue'
import { getClassEntries, getPrimaryClassId, getTotalLevel } from '@/rules/multiclass'
import { draft2024 } from '../fixtures/draft-2024'
import type { AbilityScores, CharacterDraft } from '@/types/character'

const ABILITIES: AbilityScores = { str: 15, dex: 14, con: 13, int: 13, wis: 13, cha: 13 }

function solo(overrides: Partial<CharacterDraft> = {}): CharacterDraft {
  return draft2024({ ruleset: '5e-2014', baseAbilities: ABILITIES, classId: 'class-2014-fighter', targetLevel: 5, ...overrides })
}

function mc(): CharacterDraft {
  return draft2024({
    ruleset: '5e-2014',
    baseAbilities: ABILITIES,
    classId: 'class-2014-fighter',
    targetLevel: 5,
    multiclass: {
      enabled: true,
      primaryClassId: 'class-2014-fighter',
      classes: [{ classId: 'class-2014-fighter', level: 3 }, { classId: 'class-2014-rogue', level: 2 }],
      levelOrder: ['class-2014-fighter', 'class-2014-fighter', 'class-2014-fighter', 'class-2014-rogue', 'class-2014-rogue'],
    },
  })
}

/**
 * 分配控件测试（MC-E01）。
 * UiModal 使用 Teleport，这里把 teleport 渲染到原地，便于直接断言弹窗内容。
 */
function mountControl(draft: CharacterDraft) {
  return mount(ClassAllocationControl, { props: { draft }, global: { stubs: { teleport: true } } })
}

/** 弹窗模式（角色卡「调整等级」）：保留待定状态与底部「取消 / 确认」（D19）。 */
function mountCompact(draft: CharacterDraft) {
  return mount(ClassAllocationControl, { props: { draft, compact: true }, global: { stubs: { teleport: true } } })
}

function appliedDraft(wrapper: ReturnType<typeof mount>): CharacterDraft {
  const events = wrapper.emitted('apply')
  expect(events, '未触发 apply 事件').toBeTruthy()
  return (events as unknown[][])[events!.length - 1]![0] as CharacterDraft
}

/** 总等级滑杆走单独的 `applyTotalLevel`（需求 §3.4）：页面按更轻的确认策略处理。 */
function appliedTotalLevel(wrapper: ReturnType<typeof mount>): CharacterDraft {
  const events = wrapper.emitted('applyTotalLevel')
  expect(events, '未触发 applyTotalLevel 事件').toBeTruthy()
  return (events as unknown[][])[events!.length - 1]![0] as CharacterDraft
}

describe('MC-E01 分配控件：单职业模式', () => {
  it('上方总等级只读，显示各职业等级之和', () => {
    const wrapper = mountControl(solo())
    const total = wrapper.get('.allocation__total')
    expect(total.text()).toContain('总等级')
    expect(total.text()).toContain('5')
    expect(total.text()).toContain('战士 5')
    // 总等级构成行本身仍是只读文本（可调的滑杆在独立区域，见下方 SC-B01 用例）
    expect(total.find('input').exists()).toBe(false)
  })

  it('单职业用等级滑杆设置该职业等级（SC-B01）', async () => {
    const wrapper = mountControl(solo())
    const slider = wrapper.get('.allocation__slider input[type="range"]')
    expect(slider.attributes('min')).toBe('1')
    expect(slider.attributes('max')).toBe('20')
    expect((slider.element as HTMLInputElement).value).toBe('5')
    await slider.setValue(7)
    const draft = appliedTotalLevel(wrapper)
    expect(getTotalLevel(draft)).toBe(7)
    expect(getClassEntries(draft)).toEqual([{ classId: 'class-2014-fighter', level: 7 }])
  })

  it('滑杆拖动中不提交，松手才提交（SC-B01）', async () => {
    const wrapper = mountControl(solo())
    const slider = wrapper.get('.allocation__slider input[type="range"]')
    await slider.trigger('input')
    expect(wrapper.emitted('applyTotalLevel')).toBeFalsy()
    await slider.trigger('change')
    expect(wrapper.emitted('applyTotalLevel')).toBeTruthy()
    // 滑杆不走 apply（页面据事件区分确认策略）
    expect(wrapper.emitted('apply')).toBeFalsy()
  })

  it('单职业模式不显示职业步进列表', () => {
    const wrapper = mountControl(solo())
    expect(wrapper.find('.allocation__list').exists()).toBe(false)
    expect(wrapper.text()).toContain('开启兼职前')
  })

  it('没有职业时滑杆仍可设置目标等级（第 1 步场景，SC-B01）', async () => {
    const draft = draft2024({ ruleset: '5e-2014', classId: undefined, targetLevel: 5 })
    const wrapper = mountControl(draft)
    expect(wrapper.text()).toContain('尚未选择职业')
    const slider = wrapper.get('.allocation__slider input[type="range"]')
    expect((slider.element as HTMLInputElement).value).toBe('5')
    await slider.setValue(9)
    const next = appliedTotalLevel(wrapper)
    expect(next.targetLevel).toBe(9)
    // 未选职业时不下发职业分配
    expect(next.multiclass).toBeUndefined()
  })
})

describe('SC-B01 分配控件：兼职模式下的总等级滑杆', () => {
  it('兼职时滑杆范围下限为职业数量，拖动改总等级', async () => {
    const wrapper = mountControl(mc())
    const slider = wrapper.get('.allocation__slider input[type="range"]')
    expect(slider.attributes('min')).toBe('2')
    expect(slider.attributes('max')).toBe('20')
    await slider.setValue(7)
    const draft = appliedTotalLevel(wrapper)
    // 加级给列表最后一个职业（游荡者 2 → 4）
    expect(getClassEntries(draft)).toEqual([{ classId: 'class-2014-fighter', level: 3 }, { classId: 'class-2014-rogue', level: 4 }])
    // 等级读数移到等级卡头部（LV-B01）：标签为「总等级」，不再是「目标等级」
    expect(wrapper.get('.allocation__level-head').text()).toContain('总等级')
    expect(wrapper.get('.allocation__level-head').text()).not.toContain('目标等级')
  })

  it('兼职时滑杆减级不会移除职业（下限为职业数量）', async () => {
    const wrapper = mountControl(mc())
    await wrapper.get('.allocation__slider input[type="range"]').setValue(2)
    const draft = appliedTotalLevel(wrapper)
    expect(getClassEntries(draft)).toHaveLength(2)
    expect(getClassEntries(draft).every((entry) => entry.level >= 1)).toBe(true)
    expect(getTotalLevel(draft)).toBe(2)
  })
})

describe('MC-E01 分配控件：兼职模式', () => {
  it('兼职时显示职业行、起始职业标记与总等级构成', () => {
    const wrapper = mountControl(mc())
    const rows = wrapper.findAll('.allocation__row')
    expect(rows).toHaveLength(2)
    expect(wrapper.text()).toContain('起始职业')
    expect(wrapper.get('.allocation__total').text()).toContain('战士 3 + 游荡者 2')
    // 兼职时滑杆仍然存在（改总等级），只是范围下限变成职业数量
    expect(wrapper.find('.allocation__slider input[type="range"]').exists()).toBe(true)
  })

  it('加号提升某职业等级并同步总等级', async () => {
    const wrapper = mountControl(mc())
    const rogueRow = wrapper.findAll('.allocation__row')[1]!
    const buttons = rogueRow.findAll('button')
    await buttons[1]!.trigger('click')
    const draft = appliedDraft(wrapper)
    expect(getTotalLevel(draft)).toBe(6)
    expect(getClassEntries(draft).find((entry) => entry.classId === 'class-2014-rogue')?.level).toBe(3)
  })

  it('总等级达 20 时禁用全部加号', () => {
    const draft = draft2024({
      ruleset: '5e-2014',
      baseAbilities: ABILITIES,
      classId: 'class-2014-fighter',
      targetLevel: 20,
      multiclass: {
        enabled: true,
        primaryClassId: 'class-2014-fighter',
        classes: [{ classId: 'class-2014-fighter', level: 19 }, { classId: 'class-2014-rogue', level: 1 }],
        levelOrder: [...Array.from({ length: 19 }, () => 'class-2014-fighter'), 'class-2014-rogue'],
      },
    })
    const wrapper = mountControl(draft)
    const plusButtons = wrapper.findAll('.allocation__stepper button').filter((button) => button.text() === '＋')
    expect(plusButtons.every((button) => button.attributes('disabled') !== undefined)).toBe(true)
    expect(wrapper.text()).toContain('总等级已达 20')
  })

  it('起始职业的减号在其 1 级时禁用（不可移除起始职业）', () => {
    const draft = draft2024({
      ruleset: '5e-2014',
      baseAbilities: ABILITIES,
      classId: 'class-2014-fighter',
      targetLevel: 2,
      multiclass: {
        enabled: true,
        primaryClassId: 'class-2014-fighter',
        classes: [{ classId: 'class-2014-fighter', level: 1 }, { classId: 'class-2014-rogue', level: 1 }],
        levelOrder: ['class-2014-fighter', 'class-2014-rogue'],
      },
    })
    const wrapper = mountControl(draft)
    const firstRowMinus = wrapper.findAll('.allocation__row')[0]!.findAll('button')[0]!
    expect(firstRowMinus.attributes('disabled')).toBeDefined()
  })

  it('把非起始职业降到 0 级会移除该职业', async () => {
    const draft = draft2024({
      ruleset: '5e-2014',
      baseAbilities: ABILITIES,
      classId: 'class-2014-fighter',
      targetLevel: 4,
      multiclass: {
        enabled: true,
        primaryClassId: 'class-2014-fighter',
        classes: [{ classId: 'class-2014-fighter', level: 3 }, { classId: 'class-2014-rogue', level: 1 }],
        levelOrder: ['class-2014-fighter', 'class-2014-fighter', 'class-2014-fighter', 'class-2014-rogue'],
      },
    })
    const wrapper = mountControl(draft)
    const rogueMinus = wrapper.findAll('.allocation__row')[1]!.findAll('button')[0]!
    await rogueMinus.trigger('click')
    const result = appliedDraft(wrapper)
    expect(getClassEntries(result)).toHaveLength(1)
    expect(getTotalLevel(result)).toBe(3)
  })
})

describe('MC-E01 分配控件：添加职业', () => {
  it('开关打开时提供添加职业入口，候选排除已选职业', async () => {
    const wrapper = mountControl(mc())
    const addButton = wrapper.findAll('button').find((button) => button.text() === '添加职业')
    expect(addButton).toBeTruthy()
    await addButton!.trigger('click')
    const options = wrapper.findAll('.allocation__options button')
    expect(options.length).toBeGreaterThan(0)
    // 只看选项标题（职业名）；说明文字里可能提到其他职业名
    const names = options.map((button) => button.get('b').text())
    expect(names).not.toContain('战士')
    expect(names).not.toContain('游荡者')
    expect(names).toContain('法师')
  })

  it('添加职业后该职业以 1 级加入并自动打开开关', async () => {
    const wrapper = mountControl(mc())
    await wrapper.findAll('button').find((button) => button.text() === '添加职业')!.trigger('click')
    const wizard = wrapper.findAll('.allocation__options button').find((button) => button.text().includes('法师'))!
    await wizard.trigger('click')
    const draft = appliedDraft(wrapper)
    expect(getClassEntries(draft).some((entry) => entry.classId === 'class-2014-wizard' && entry.level === 1)).toBe(true)
    expect(draft.multiclass?.enabled).toBe(true)
    expect(getTotalLevel(draft)).toBe(6)
  })

  it('开关关闭时不提供添加职业入口', () => {
    const wrapper = mountControl(solo())
    expect(wrapper.findAll('button').some((button) => button.text() === '添加职业')).toBe(false)
    expect(wrapper.text()).toContain('开启「启用兼职」后可以添加第二个职业')
  })
})

describe('MC-E01 分配控件：关闭兼职的防误触（D7）', () => {
  it('关闭开关时弹出确认，明细列出将被合并的职业与等级', async () => {
    const wrapper = mountControl(mc())
    await wrapper.get('.allocation__switch input').setValue(false)
    expect(wrapper.text()).toContain('关闭兼职')
    expect(wrapper.text()).toContain('不可撤销')
    expect(wrapper.text()).toContain('将合并：游荡者 2 级')
    // 取消为主操作，破坏性按钮为警示样式
    expect(wrapper.find('.base-button--danger').exists()).toBe(true)
  })

  it('确认合并且总等级不变、只保留起始职业', async () => {
    const wrapper = mountControl(mc())
    await wrapper.get('.allocation__switch input').setValue(false)
    await wrapper.get('.base-button--danger').trigger('click')
    const draft = appliedDraft(wrapper)
    expect(getClassEntries(draft)).toEqual([{ classId: 'class-2014-fighter', level: 5 }])
    expect(getTotalLevel(draft)).toBe(5)
    expect(draft.multiclass?.enabled).toBe(false)
  })

  it('取消关闭会恢复开关状态，不改动职业集合', async () => {
    const wrapper = mountControl(mc())
    await wrapper.get('.allocation__switch input').setValue(false)
    const keep = wrapper.findAll('.base-button--secondary').find((button) => button.text() === '保留兼职')!
    await keep.trigger('click')
    const draft = appliedDraft(wrapper)
    expect(draft.multiclass?.enabled).toBe(true)
    expect(getClassEntries(draft)).toHaveLength(2)
  })

  it('只有一个职业时关闭开关不弹确认', async () => {
    const single = draft2024({
      ruleset: '5e-2014',
      baseAbilities: ABILITIES,
      classId: 'class-2014-fighter',
      targetLevel: 5,
      multiclass: { enabled: true, primaryClassId: 'class-2014-fighter', classes: [{ classId: 'class-2014-fighter', level: 5 }], levelOrder: Array.from({ length: 5 }, () => 'class-2014-fighter') },
    })
    const wrapper = mountControl(single)
    await wrapper.get('.allocation__switch input').setValue(false)
    expect(wrapper.text()).not.toContain('不可撤销')
    expect(appliedDraft(wrapper).multiclass?.enabled).toBe(false)
  })
})

/**
 * 变更摘要与底部「取消 / 确认」只属于**弹窗模式**（D19／PC-A02）：
 * 内联时每次操作已立即生效，没有待定状态。因此本节用例统一改用 `compact: true` 挂载
 * （改写自原先的内联挂载——验证的本意就是弹窗的确认语义，改写后更准确）。
 */
describe('MC-E01 分配控件：变更摘要与确认（弹窗模式）', () => {
  it('变更摘要列出总等级前后与各职业等级变化', async () => {
    const wrapper = mountCompact(mc())
    const rogueRow = wrapper.findAll('.allocation__row')[1]!
    await rogueRow.findAll('button')[1]!.trigger('click')
    const summary = wrapper.get('.allocation__summary')
    expect(summary.text()).toContain('总等级 5 → 6')
    expect(summary.text()).toContain('游荡者 2 → 3 级')
    expect(summary.text()).toContain('战士 保持 3 级')
  })

  it('没有变更时不显示摘要，确认按钮仍可提交当前草稿', async () => {
    const wrapper = mountCompact(mc())
    expect(wrapper.find('.allocation__summary').exists()).toBe(false)
    await wrapper.findAll('button').find((button) => button.text() === '确认')!.trigger('click')
    expect(getTotalLevel(appliedDraft(wrapper))).toBe(5)
  })

  it('取消按钮只发 cancel，不提交草稿', async () => {
    const wrapper = mountCompact(mc())
    await wrapper.findAll('.base-button--secondary').find((button) => button.text() === '取消')!.trigger('click')
    expect(wrapper.emitted('apply')).toBeFalsy()
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('先决不满足时在对应职业行给出中文原因', () => {
    // 基础感知 12 < 13，不能兼职德鲁伊
    const draft = draft2024({
      ruleset: '5e-2014',
      baseAbilities: { ...ABILITIES, wis: 12 },
      classId: 'class-2014-rogue',
      targetLevel: 5,
      multiclass: {
        enabled: true,
        primaryClassId: 'class-2014-rogue',
        classes: [{ classId: 'class-2014-rogue', level: 3 }, { classId: 'class-2014-druid', level: 2 }],
        levelOrder: ['class-2014-rogue', 'class-2014-rogue', 'class-2014-rogue', 'class-2014-druid', 'class-2014-druid'],
      },
    })
    const wrapper = mountCompact(draft)
    const warn = wrapper.findAll('.allocation__warn').map((item) => item.text()).join('|')
    expect(warn).toContain('感知需提高到 13')
    // 不阻断确认
    expect(wrapper.findAll('button').find((button) => button.text() === '确认')!.attributes('disabled')).toBeUndefined()
  })
})

describe('SC-B02 分配控件：启用兼职时选择起始职业', () => {
  /** 弹窗里的候选按钮（排除底部「取消／确认」与开关）。 */
  function optionButtons(wrapper: ReturnType<typeof mount>) {
    return wrapper.findAll('.allocation__options button')
  }

  it('开启开关先弹窗，不立即写入数据', async () => {
    const wrapper = mountControl(solo())
    await wrapper.get('.allocation__switch input').setValue(true)
    expect(wrapper.text()).toContain('选择起始职业')
    expect(wrapper.text()).toContain('1 级生命值、起始装备与豁免熟练')
    // 未确认前不下发任何变更
    expect(wrapper.emitted('apply')).toBeFalsy()
  })

  it('没有职业时列出全部可用职业，选中后成为第一个职业与起始职业', async () => {
    const draft = draft2024({ ruleset: '5e-2014', classId: undefined, targetLevel: 5 })
    const wrapper = mountControl(draft)
    await wrapper.get('.allocation__switch input').setValue(true)
    const options = optionButtons(wrapper)
    expect(options.length).toBeGreaterThan(5)
    const rogue = options.find((button) => button.text().includes('游荡者'))!
    await rogue.trigger('click')
    await wrapper.findAll('button').filter((button) => button.text() === '确认').at(-1)!.trigger('click')
    const next = appliedDraft(wrapper)
    // 选中的职业成为唯一职业，等级 = 当前目标等级
    expect(getClassEntries(next)).toEqual([{ classId: 'class-2014-rogue', level: 5 }])
    expect(getPrimaryClassId(next)).toBe('class-2014-rogue')
    expect(next.classId).toBe('class-2014-rogue')
    expect(next.multiclass?.enabled).toBe(true)
    expect(getTotalLevel(next)).toBe(5)
  })

  it('已有职业时只列当前已加入的职业，默认选中当前起始职业', async () => {
    // 触发条件是「开关由关到开」：构造「已有两个职业但兼职尚未开启」的真实状态
    // （关闭开关不清空职业列表，重新打开时若尚未合并就显示原分配）。
    const dormant = draft2024({
      ruleset: '5e-2014',
      baseAbilities: ABILITIES,
      classId: 'class-2014-fighter',
      targetLevel: 5,
      multiclass: {
        enabled: false,
        primaryClassId: 'class-2014-fighter',
        classes: [{ classId: 'class-2014-fighter', level: 3 }, { classId: 'class-2014-rogue', level: 2 }],
        levelOrder: ['class-2014-fighter', 'class-2014-fighter', 'class-2014-fighter', 'class-2014-rogue', 'class-2014-rogue'],
      },
    })
    const wrapper = mountControl(dormant)
    await wrapper.get('.allocation__switch input').setValue(true)
    const options = optionButtons(wrapper)
    expect(options).toHaveLength(2)
    expect(options.map((button) => button.text()).join('|')).toContain('战士')
    expect(options.map((button) => button.text()).join('|')).toContain('游荡者')
    // 默认选中当前起始职业 → 直接确认不改变任何等级
    await wrapper.findAll('button').filter((button) => button.text() === '确认').at(-1)!.trigger('click')
    const next = appliedDraft(wrapper)
    expect(getClassEntries(next)).toEqual([{ classId: 'class-2014-fighter', level: 3 }, { classId: 'class-2014-rogue', level: 2 }])
    expect(getPrimaryClassId(next)).toBe('class-2014-fighter')
  })

  it('取消弹窗等于取消开启兼职，不写入任何数据', async () => {
    const wrapper = mountControl(solo())
    await wrapper.get('.allocation__switch input').setValue(true)
    const cancel = wrapper.findAll('.allocation__modal button').find((button) => button.text() === '取消')
      ?? wrapper.findAll('button').filter((button) => button.text() === '取消').at(-1)!
    await cancel.trigger('click')
    expect(wrapper.emitted('apply')).toBeFalsy()
  })
})

describe('SC-B03 分配控件：起始职业的说明、切换与移除路径', () => {
  it('起始职业行说明「切换到其他职业后可以移除」，且没有「设为起始职业」按钮', () => {
    const wrapper = mountControl(mc())
    const primaryRow = wrapper.findAll('.allocation__row')[0]!
    expect(primaryRow.text()).toContain('起始职业不可移除')
    expect(primaryRow.text()).toContain('可以降到 0 移除')
    expect(primaryRow.findAll('button').some((button) => button.text() === '设为起始职业')).toBe(false)
    // 起始职业 1 级时减号禁用；这里战士 3 级仍可减
    expect(primaryRow.findAll('button')[0]!.attributes('disabled')).toBeUndefined()
  })

  it('起始职业为 1 级时减号禁用', () => {
    const draft = draft2024({
      ruleset: '5e-2014',
      baseAbilities: ABILITIES,
      classId: 'class-2014-fighter',
      targetLevel: 3,
      multiclass: {
        enabled: true,
        primaryClassId: 'class-2014-fighter',
        classes: [{ classId: 'class-2014-fighter', level: 1 }, { classId: 'class-2014-rogue', level: 2 }],
        levelOrder: ['class-2014-fighter', 'class-2014-rogue', 'class-2014-rogue'],
      },
    })
    const wrapper = mountControl(draft)
    expect(wrapper.findAll('.allocation__row')[0]!.findAll('button')[0]!.attributes('disabled')).toBeDefined()
  })

  it('行内「设为起始职业」切换后原起始职业可被减到 0 移除', async () => {
    const wrapper = mountControl(mc())
    const rogueRow = wrapper.findAll('.allocation__row')[1]!
    await rogueRow.findAll('button').find((button) => button.text() === '设为起始职业')!.trigger('click')
    const switched = appliedDraft(wrapper)
    expect(getPrimaryClassId(switched)).toBe('class-2014-rogue')
    expect(getClassEntries(switched)[0]!.classId).toBe('class-2014-rogue')
    expect(switched.classId).toBe('class-2014-rogue')
    expect(getTotalLevel(switched)).toBe(5)

    // 用切换后的草稿继续操作：原起始职业（战士）现在可以降到 0
    const wrapper2 = mountControl(switched)
    const fighterRow = wrapper2.findAll('.allocation__row').find((row) => row.text().includes('战士'))!
    const minus = fighterRow.findAll('button')[0]!
    expect(minus.attributes('disabled')).toBeUndefined()
  })

  it('工具区「设置起始职业」按钮与行内入口等价', async () => {
    const wrapper = mountControl(mc())
    await wrapper.findAll('button').find((button) => button.text() === '设置起始职业')!.trigger('click')
    const options = wrapper.findAll('.allocation__options button')
    expect(options).toHaveLength(2)
    await options.find((button) => button.text().includes('游荡者'))!.trigger('click')
    await wrapper.findAll('button').filter((button) => button.text() === '确认').at(-1)!.trigger('click')
    expect(getPrimaryClassId(appliedDraft(wrapper))).toBe('class-2014-rogue')
  })

  it('没有职业时不显示「设置起始职业」按钮', () => {
    const draft = draft2024({ ruleset: '5e-2014', classId: undefined, targetLevel: 5 })
    const wrapper = mountControl(draft)
    expect(wrapper.findAll('button').some((button) => button.text() === '设置起始职业')).toBe(false)
  })
})

describe('PC-A 显示条件：兼职关闭时不露出兼职专属元素（D18／D19）', () => {
  /** 兼职开启但只有一个职业（刚打开开关、还没添加第二个）。 */
  function enabledSingleClass(): CharacterDraft {
    return draft2024({
      ruleset: '5e-2014',
      baseAbilities: ABILITIES,
      classId: 'class-2014-fighter',
      targetLevel: 5,
      multiclass: {
        enabled: true,
        primaryClassId: 'class-2014-fighter',
        classes: [{ classId: 'class-2014-fighter', level: 5 }],
        levelOrder: Array.from({ length: 5 }, () => 'class-2014-fighter'),
      },
    })
  }

  /** 兼职已关闭但草稿仍保留两个职业（例如上次关闭时取消了合并）。 */
  function disabledWithTwoClasses(): CharacterDraft {
    return draft2024({
      ruleset: '5e-2014',
      baseAbilities: ABILITIES,
      classId: 'class-2014-fighter',
      targetLevel: 5,
      multiclass: {
        enabled: false,
        primaryClassId: 'class-2014-fighter',
        classes: [{ classId: 'class-2014-fighter', level: 3 }, { classId: 'class-2014-rogue', level: 2 }],
        levelOrder: ['class-2014-fighter', 'class-2014-fighter', 'class-2014-fighter', 'class-2014-rogue', 'class-2014-rogue'],
      },
    })
  }

  function hasButton(wrapper: ReturnType<typeof mount>, text: string): boolean {
    return wrapper.findAll('button').some((button) => button.text() === text)
  }

  it('兼职关闭 + 单职业：不出现「设置起始职业」「取消」「确认」「本次变更」', () => {
    const wrapper = mountControl(solo())
    expect(hasButton(wrapper, '设置起始职业')).toBe(false)
    expect(hasButton(wrapper, '取消')).toBe(false)
    expect(hasButton(wrapper, '确认')).toBe(false)
    expect(wrapper.find('.allocation__summary').exists()).toBe(false)
    // 单职业主流程仍然完整：开关、滑杆、总等级行、说明
    expect(wrapper.find('.allocation__switch input').exists()).toBe(true)
    expect(wrapper.find('.allocation__slider input[type="range"]').exists()).toBe(true)
    expect(wrapper.get('.allocation__total').text()).toContain('战士 5')
    expect(wrapper.text()).toContain('开启兼职前')
    expect(wrapper.text()).toContain('开启「启用兼职」后可以添加第二个职业')
    // 职业列表与添加职业本来就隐藏
    expect(wrapper.find('.allocation__list').exists()).toBe(false)
    expect(hasButton(wrapper, '添加职业')).toBe(false)
  })

  it('兼职关闭 + 单职业的弹窗：保留「取消 / 确认」，但仍不出现「设置起始职业」', () => {
    const wrapper = mountCompact(solo())
    expect(hasButton(wrapper, '取消')).toBe(true)
    expect(hasButton(wrapper, '确认')).toBe(true)
    expect(hasButton(wrapper, '设置起始职业')).toBe(false)
  })

  it('兼职开启但只有 1 个职业：不出现「设置起始职业」（没有可切换对象）', () => {
    const wrapper = mountControl(enabledSingleClass())
    expect(hasButton(wrapper, '设置起始职业')).toBe(false)
    expect(wrapper.find('.allocation__list').exists()).toBe(false)
    expect(hasButton(wrapper, '添加职业')).toBe(true)
  })

  it('兼职开启 + 2 个职业：职业列表与「设置起始职业」恢复，内联仍无「取消 / 确认」', () => {
    const wrapper = mountControl(mc())
    expect(wrapper.find('.allocation__list').exists()).toBe(true)
    expect(hasButton(wrapper, '设置起始职业')).toBe(true)
    expect(hasButton(wrapper, '取消')).toBe(false)
    expect(hasButton(wrapper, '确认')).toBe(false)
    expect(wrapper.find('.allocation__summary').exists()).toBe(false)
  })

  it('兼职关闭但保留 2 个职业：显示保留分配提示，且不显示列表与「设置起始职业」', () => {
    const wrapper = mountControl(disabledWithTwoClasses())
    expect(wrapper.text()).toContain('已保留兼职分配：战士3 / 游荡者2，重新启用后可继续编辑。')
    expect(wrapper.find('.allocation__list').exists()).toBe(false)
    expect(hasButton(wrapper, '设置起始职业')).toBe(false)
    // 开关仍可用来重新启用
    expect(wrapper.find('.allocation__switch input').exists()).toBe(true)
  })

  it('保留分配提示只在「关闭 + ≥2 职业」时出现', () => {
    expect(mountControl(solo()).text()).not.toContain('已保留兼职分配')
    expect(mountControl(enabledSingleClass()).text()).not.toContain('已保留兼职分配')
    expect(mountControl(mc()).text()).not.toContain('已保留兼职分配')
  })
})

describe('PC-B 内联一致性：提交未被采纳时不残留未生效的显示（R3／D21）', () => {
  it('滑杆提交后若页面未采纳（依赖确认被取消），显示回到已提交值', async () => {
    const wrapper = mountControl(solo())
    const slider = wrapper.get('.allocation__slider input[type="range"]')
    await slider.setValue(7)
    // 事件已发出，但本用例不更新 props —— 等价于页面弹确认后被取消
    expect(wrapper.emitted('applyTotalLevel')).toBeTruthy()
    await flushPromises()
    // 等级读数在等级卡头部（LV-B01）：仍验证显示回到已提交值
    expect(wrapper.get('.allocation__level-head').text()).toContain('目标等级')
    expect(wrapper.get('.allocation__level-head').text()).toContain('5级')
    expect(wrapper.get('.allocation__total').text()).toContain('总等级 5')
    expect(wrapper.find('.allocation__summary').exists()).toBe(false)
  })

  it('滑杆提交被采纳后显示跟随新草稿', async () => {
    const wrapper = mountControl(solo())
    await wrapper.get('.allocation__slider input[type="range"]').setValue(7)
    await flushPromises()
    const next = appliedTotalLevel(wrapper)
    await wrapper.setProps({ draft: next })
    await flushPromises()
    expect(wrapper.get('.allocation__level-head').text()).toContain('7级')
    expect(wrapper.get('.allocation__total').text()).toContain('总等级 7')
  })

  it('内联的加减职业按钮也不残留待定摘要', async () => {
    const wrapper = mountControl(mc())
    const rogueRow = wrapper.findAll('.allocation__row')[1]!
    await rogueRow.findAll('button')[1]!.trigger('click')
    await flushPromises()
    expect(wrapper.find('.allocation__summary').exists()).toBe(false)
  })
})

describe('LV 等级卡 ±1 步进（D34—D36）', () => {
  /** 等级卡头部（等级名 + 步进）的降 / 升按钮。 */
  function stepButtons(wrapper: ReturnType<typeof mount>) {
    const buttons = wrapper.get('.allocation__level-head').findAll('button')
    return { minus: buttons[0]!, plus: buttons[1]! }
  }

  it('单职业：加号升一级，只发 applyTotalLevel（不走 apply）', async () => {
    const wrapper = mountControl(solo())
    const { minus, plus } = stepButtons(wrapper)

    expect(minus.attributes('aria-label')).toBe('目标等级降一级')
    expect(plus.attributes('aria-label')).toBe('目标等级升一级')
    // 步进不在 <label> 内：避免点按钮同时命中滑杆
    expect(wrapper.get('.allocation__slider').findAll('button')).toHaveLength(0)

    await plus.trigger('click')
    expect(getClassEntries(appliedTotalLevel(wrapper))).toEqual([{ classId: 'class-2014-fighter', level: 6 }])
    expect(wrapper.emitted('apply')).toBeFalsy()
  })

  it('单职业：减号降一级', async () => {
    const wrapper = mountControl(solo())
    await stepButtons(wrapper).minus.trigger('click')
    expect(getClassEntries(appliedTotalLevel(wrapper))).toEqual([{ classId: 'class-2014-fighter', level: 4 }])
    expect(wrapper.emitted('apply')).toBeFalsy()
  })

  it('没有职业时步进改目标等级', async () => {
    const wrapper = mountControl(draft2024({ ruleset: '5e-2014', classId: undefined, targetLevel: 5 }))
    await stepButtons(wrapper).plus.trigger('click')
    const next = appliedTotalLevel(wrapper)
    expect(next.targetLevel).toBe(6)
    expect(next.multiclass).toBeUndefined()
  })

  it('边界：1 级时减号禁用，20 级时加号禁用', async () => {
    const lowest = mountControl(solo({ targetLevel: 1 }))
    const lowestButtons = stepButtons(lowest)
    expect(lowestButtons.minus.attributes('disabled')).toBeDefined()
    expect(lowestButtons.plus.attributes('disabled')).toBeUndefined()
    await lowestButtons.minus.trigger('click')
    // 越界不产生事件
    expect(lowest.emitted('applyTotalLevel')).toBeFalsy()

    const highest = mountControl(solo({ targetLevel: 20 }))
    const highestButtons = stepButtons(highest)
    expect(highestButtons.plus.attributes('disabled')).toBeDefined()
    await highestButtons.plus.trigger('click')
    expect(highest.emitted('applyTotalLevel')).toBeFalsy()
  })

  it('兼职：加号加给列表最后一个职业，减号从末尾往前扣', async () => {
    const plusWrapper = mountControl(mc())
    const plusButtons = stepButtons(plusWrapper)
    expect(plusButtons.plus.attributes('aria-label')).toBe('总等级升一级')
    await plusButtons.plus.trigger('click')
    expect(getClassEntries(appliedTotalLevel(plusWrapper))).toEqual([
      { classId: 'class-2014-fighter', level: 3 },
      { classId: 'class-2014-rogue', level: 3 },
    ])

    const minusWrapper = mountControl(mc())
    await stepButtons(minusWrapper).minus.trigger('click')
    expect(getClassEntries(appliedTotalLevel(minusWrapper))).toEqual([
      { classId: 'class-2014-fighter', level: 3 },
      { classId: 'class-2014-rogue', level: 1 },
    ])
  })

  it('兼职：总等级达下限（职业数量）时减号禁用，不会移除职业', async () => {
    const draft = draft2024({
      ruleset: '5e-2014',
      baseAbilities: ABILITIES,
      classId: 'class-2014-fighter',
      targetLevel: 2,
      multiclass: {
        enabled: true,
        primaryClassId: 'class-2014-fighter',
        classes: [{ classId: 'class-2014-fighter', level: 1 }, { classId: 'class-2014-rogue', level: 1 }],
        levelOrder: ['class-2014-fighter', 'class-2014-rogue'],
      },
    })
    const wrapper = mountControl(draft)
    const { minus, plus } = stepButtons(wrapper)
    expect(minus.attributes('disabled')).toBeDefined()
    await minus.trigger('click')
    expect(wrapper.emitted('applyTotalLevel')).toBeFalsy()

    await plus.trigger('click')
    const next = appliedTotalLevel(wrapper)
    expect(getTotalLevel(next)).toBe(3)
    expect(getClassEntries(next)).toHaveLength(2)
  })

  it('弹窗模式：步进进入本地待定摘要，确认才提交步进后的草稿', async () => {
    const wrapper = mountCompact(mc())
    await stepButtons(wrapper).plus.trigger('click')

    expect(wrapper.get('.allocation__level-head').text()).toContain('6级')
    expect(wrapper.get('.allocation__summary').text()).toContain('总等级 5 → 6')

    await wrapper.findAll('.allocation__footer button')[1]!.trigger('click')
    const applied = appliedDraft(wrapper)
    expect(getTotalLevel(applied)).toBe(6)
    expect(getClassEntries(applied).find((entry) => entry.classId === 'class-2014-rogue')?.level).toBe(3)
  })

  it('内联：页面未采纳时显示回到已提交值（与滑杆同一不变式）', async () => {
    const wrapper = mountControl(solo())
    await stepButtons(wrapper).plus.trigger('click')
    expect(wrapper.emitted('applyTotalLevel')).toBeTruthy()
    await flushPromises()

    expect(wrapper.get('.allocation__level-head').text()).toContain('5级')
    expect(wrapper.get('.allocation__total').text()).toContain('总等级 5')
  })

  it('弹窗模式：连续步进可累计（每次采纳后继续 +1）', async () => {
    const wrapper = mountCompact(solo())
    await stepButtons(wrapper).plus.trigger('click')
    await wrapper.setProps({ draft: appliedTotalLevel(wrapper) })
    await flushPromises()

    await stepButtons(wrapper).plus.trigger('click')
    const events = wrapper.emitted('applyTotalLevel')!
    expect(getTotalLevel(events[events.length - 1]![0] as CharacterDraft)).toBe(7)
    expect(wrapper.get('.allocation__level-head').text()).toContain('7级')
  })

  it('内联：页面采纳后显示跟随新草稿，且滑杆位置同步', async () => {
    const wrapper = mountControl(solo())
    await stepButtons(wrapper).plus.trigger('click')
    await flushPromises()
    const next = appliedTotalLevel(wrapper)
    await wrapper.setProps({ draft: next })
    await flushPromises()

    expect(wrapper.get('.allocation__level-head').text()).toContain('6级')
    expect((wrapper.get('.allocation__slider input[type="range"]').element as HTMLInputElement).value).toBe('6')
  })
})
