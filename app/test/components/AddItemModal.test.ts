import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import AddItemModal from '@/components/AddItemModal.vue'

/** 弹窗通过 UiModal Teleport 到 body，操作统一走 document.body。 */
function cardMains(): HTMLElement[] {
  return Array.from(document.body.querySelectorAll<HTMLElement>('.expandable-option-card__main'))
}

async function clickCard(index: number): Promise<void> {
  cardMains()[index]?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  await vi.advanceTimersByTimeAsync(300)
}

function buttonByText(text: string): HTMLButtonElement | undefined {
  return Array.from(document.body.querySelectorAll<HTMLButtonElement>('button'))
    .find((button) => button.textContent?.trim() === text)
}

function fieldsetByLegend(text: string): HTMLFieldSetElement {
  const fieldset = Array.from(document.body.querySelectorAll<HTMLFieldSetElement>('fieldset'))
    .find((candidate) => candidate.querySelector('legend')?.textContent?.trim() === text)
  if (!fieldset) throw new Error(`未找到筛选组：${text}`)
  return fieldset
}

async function toggleCheckbox(fieldset: HTMLFieldSetElement, label: string): Promise<void> {
  const target = Array.from(fieldset.querySelectorAll<HTMLLabelElement>('label'))
    .find((candidate) => candidate.textContent?.trim() === label)
  const input = target?.querySelector<HTMLInputElement>('input')
  if (!input) throw new Error(`未找到筛选项：${label}`)
  input.click()
  await vi.advanceTimersByTimeAsync(0)
}

describe('AddItemModal', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    document.body.innerHTML = ''
  })
  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('filters the built-in library by search and category', async () => {
    mount(AddItemModal, { props: { open: true }, attachTo: document.body })
    expect(cardMains().length).toBeGreaterThan(1)

    const search = document.body.querySelector<HTMLInputElement>('.list-shell__search input')
    search!.value = '长剑'
    search!.dispatchEvent(new Event('input'))
    await vi.advanceTimersByTimeAsync(0)

    const titles = Array.from(document.body.querySelectorAll('.expandable-option-card__title-line')).map((node) => node.textContent)
    expect(titles).toContain('长剑')
    expect(titles?.length).toBe(1)

    search!.value = ''
    search!.dispatchEvent(new Event('input'))
    await vi.advanceTimersByTimeAsync(0)
    const categoryFieldset = fieldsetByLegend('类别')
    categoryFieldset.querySelector<HTMLButtonElement>('button')!.click()
    await vi.advanceTimersByTimeAsync(0)
    await toggleCheckbox(categoryFieldset, '护甲')
    await vi.advanceTimersByTimeAsync(0)
    const armorTitles = Array.from(document.body.querySelectorAll('.expandable-option-card__title-line')).map((node) => node.textContent)
    // 官方魔法物品目录把盾牌归入护甲类，因此除普通护甲外还会包含魔法护甲与魔法盾牌。
    const plainArmor = ['衬甲', '皮甲', '镶钉皮甲', '兽皮甲', '链甲衫', '鳞甲', '胸甲', '半身板甲', '环甲', '链甲', '板条甲', '板甲']
    for (const title of plainArmor) {
      expect(armorTitles).toContain(title)
    }
    expect(armorTitles?.length).toBeGreaterThanOrEqual(19)
    expect(armorTitles).not.toContain('长剑')
  })

  it('单击物品条目即展开装备详情（下拉介绍）', async () => {
    mount(AddItemModal, { props: { open: true }, attachTo: document.body })

    const search = document.body.querySelector<HTMLInputElement>('.list-shell__search input')
    search!.value = '长剑'
    search!.dispatchEvent(new Event('input'))
    await vi.advanceTimersByTimeAsync(0)
    await clickCard(0)

    // 单击后自动展开详情区：完整介绍 + 结构化装备详情
    const growth = document.querySelector('.list-shell .expandable-option-card__growth')
    expect(growth).not.toBeNull()
    expect(growth?.textContent).toContain('装备详情')
    expect(growth?.textContent).toContain('多用 1d10（双手）')
    expect(growth?.textContent).toContain('1d8 挥砍伤害')
    expect(growth?.textContent).toContain('可装备')
  })

  it('装备详情展示护甲 AC 与药水稀有度', async () => {
    mount(AddItemModal, { props: { open: true }, attachTo: document.body })
    const search = document.body.querySelector<HTMLInputElement>('.list-shell__search input')

    // 护甲：AC 公式行
    search!.value = '衬甲'
    search!.dispatchEvent(new Event('input'))
    await vi.advanceTimersByTimeAsync(0)
    await clickCard(0)
    const armorGrowth = document.querySelector('.list-shell .expandable-option-card__growth')
    expect(armorGrowth?.textContent).toContain('AC 11 + 敏捷调整值（不限）')

    // 药水：稀有度与不可装备。先收起上一条详情，避免过渡期内读取旧节点。
    await clickCard(0)
    search!.value = '治疗药水'
    search!.dispatchEvent(new Event('input'))
    await vi.advanceTimersByTimeAsync(0)
    await clickCard(0)
    const potionGrowth = document.querySelector('.list-shell .expandable-option-card__growth')
    expect(potionGrowth?.textContent).toContain('稀有度：常见')
    expect(potionGrowth?.textContent).toContain('魔法类别：药水')
    expect(potionGrowth?.textContent).toContain('不可装备')
    expect(potionGrowth?.textContent).toContain('恢复 2d4+2 点生命值')
  })

  it('大量候选采用渐进显示，且结果总数不被截断', async () => {
    mount(AddItemModal, { props: { open: true }, attachTo: document.body })
    expect(cardMains()).toHaveLength(80)
    expect(document.body.textContent).toContain('找到 677 件物品')
    const loadMore = Array.from(document.body.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent?.includes('显示更多'))
    loadMore!.click()
    await vi.advanceTimersByTimeAsync(0)
    expect(cardMains()).toHaveLength(160)
  })

  it('supports English and stable-ID search, filter collapse, and empty filter groups', async () => {
    mount(AddItemModal, { props: { open: true }, attachTo: document.body })
    const search = document.body.querySelector<HTMLInputElement>('.list-shell__search input')!

    search.value = 'Longsword'
    search.dispatchEvent(new Event('input'))
    await vi.advanceTimersByTimeAsync(0)
    expect(cardMains()).toHaveLength(1)
    expect(document.body.textContent).toContain('长剑')

    search.value = 'potion-of-healing'
    search.dispatchEvent(new Event('input'))
    await vi.advanceTimersByTimeAsync(0)
    expect(cardMains()).toHaveLength(1)
    expect(document.body.textContent).toContain('治疗药水')

    buttonByText('隐藏筛选')!.click()
    await vi.advanceTimersByTimeAsync(0)
    expect(document.body.querySelector('.add-item-modal__filters')).toBeNull()
    buttonByText('显示筛选')!.click()
    await vi.advanceTimersByTimeAsync(0)

    fieldsetByLegend('类别').querySelector<HTMLButtonElement>('button')!.click()
    await vi.advanceTimersByTimeAsync(0)
    expect(cardMains()).toHaveLength(0)
    expect(document.body.textContent).toContain('至少有一个筛选组未选择任何条件')
  })

  it('展示特殊同调条件，并阻止直接添加多型号聚合索引', async () => {
    mount(AddItemModal, { props: { open: true }, attachTo: document.body })
    const search = document.body.querySelector<HTMLInputElement>('.list-shell__search input')!

    search.value = 'Staff of Fire'
    search.dispatchEvent(new Event('input'))
    await vi.advanceTimersByTimeAsync(0)
    await clickCard(0)
    expect(document.body.querySelector('.expandable-option-card__growth')?.textContent)
      .toContain('特殊同调：德鲁伊、术士、魔契师或法师同调')

    await clickCard(0)
    search.value = 'Ammunition, +1/+2/+3'
    search.dispatchEvent(new Event('input'))
    await vi.advanceTimersByTimeAsync(0)
    await clickCard(0)
    expect(buttonByText('加入物品栏')!.disabled).toBe(true)
    expect(document.body.textContent).toContain('该索引包含多个型号')
  })

  it('每次重新打开恢复全选，单次打开时折叠不清除条件', async () => {
    const wrapper = mount(AddItemModal, { props: { open: true }, attachTo: document.body })
    const categoryFieldset = fieldsetByLegend('类别')
    categoryFieldset.querySelector<HTMLButtonElement>('button')!.click()
    await vi.advanceTimersByTimeAsync(0)
    await toggleCheckbox(categoryFieldset, '武器')
    const filteredCount = cardMains().length
    expect(filteredCount).toBeGreaterThan(0)

    buttonByText('隐藏筛选')!.click()
    await vi.advanceTimersByTimeAsync(0)
    expect(cardMains()).toHaveLength(filteredCount)
    buttonByText('显示筛选')!.click()
    await vi.advanceTimersByTimeAsync(0)
    expect(fieldsetByLegend('类别').querySelectorAll<HTMLInputElement>('input:checked')).toHaveLength(1)

    await wrapper.setProps({ open: false })
    await wrapper.setProps({ open: true })
    await vi.advanceTimersByTimeAsync(0)
    expect(fieldsetByLegend('类别').querySelectorAll<HTMLInputElement>('input:checked'))
      .toHaveLength(fieldsetByLegend('类别').querySelectorAll<HTMLInputElement>('input').length)
  })

  it('角色启用来源决定候选池与来源复选项', async () => {
    mount(AddItemModal, { props: { open: true, enabledSourceIds: ['erftlw-2019-index'] }, attachTo: document.body })
    expect(fieldsetByLegend('来源').textContent).toContain('ERftLW')
    expect(fieldsetByLegend('来源').textContent).not.toContain('EGtW')

    const search = document.body.querySelector<HTMLInputElement>('.list-shell__search input')!
    search.value = 'Earworm'
    search.dispatchEvent(new Event('input'))
    await vi.advanceTimersByTimeAsync(0)
    expect(cardMains()).toHaveLength(1)

    search.value = 'Breathing Bubble'
    search.dispatchEvent(new Event('input'))
    await vi.advanceTimersByTimeAsync(0)
    expect(cardMains()).toHaveLength(0)
  })

  it('adds a library item to the inventory with quantity and emits add', async () => {
    const wrapper = mount(AddItemModal, { props: { open: true }, attachTo: document.body })

    const search = document.body.querySelector<HTMLInputElement>('.list-shell__search input')
    search!.value = '长剑'
    search!.dispatchEvent(new Event('input'))
    await vi.advanceTimersByTimeAsync(0)
    await clickCard(0)

    const plus = Array.from(document.body.querySelectorAll<HTMLButtonElement>('.add-item-modal__qty button'))
      .find((button) => button.textContent?.trim() === '＋')
    plus!.click()

    buttonByText('加入物品栏')!.click()
    expect(wrapper.emitted('add')).toHaveLength(1)
    expect(wrapper.emitted('add')![0][0]).toEqual({ itemId: 'longsword', quantity: 2, equip: false })
  })

  it('disables the equip action for non-equippable and custom items with a reason', async () => {
    const wrapper = mount(AddItemModal, { props: { open: true }, attachTo: document.body })

    // 非可装备物品（口粮）。
    const search = document.body.querySelector<HTMLInputElement>('.list-shell__search input')
    search!.value = '口粮'
    search!.dispatchEvent(new Event('input'))
    await vi.advanceTimersByTimeAsync(0)
    await clickCard(0)
    expect(buttonByText('加入装备栏')!.disabled).toBe(true)
    expect(document.body.textContent).toContain('该物品无法装备')

    // 自定义物品。
    const custom = document.body.querySelector<HTMLInputElement>('.add-item-modal__custom input')
    custom!.value = '治疗药水'
    custom!.dispatchEvent(new Event('focus'))
    custom!.dispatchEvent(new Event('input'))
    await vi.advanceTimersByTimeAsync(0)
    expect(buttonByText('加入装备栏')!.disabled).toBe(true)
    expect(document.body.textContent).toContain('自定义物品无法装备')
    expect(buttonByText('加入物品栏')!.disabled).toBe(false)

    buttonByText('加入物品栏')!.click()
    expect(wrapper.emitted('add')![0][0]).toEqual({ itemId: '治疗药水', quantity: 1, equip: false })
  })

  it('equips an equippable item when using the equip action', async () => {
    const wrapper = mount(AddItemModal, { props: { open: true }, attachTo: document.body })

    const search = document.body.querySelector<HTMLInputElement>('.list-shell__search input')
    search!.value = '长剑'
    search!.dispatchEvent(new Event('input'))
    await vi.advanceTimersByTimeAsync(0)
    await clickCard(0)

    buttonByText('加入装备栏')!.click()
    expect(wrapper.emitted('add')![0][0]).toEqual({ itemId: 'longsword', quantity: 1, equip: true })
  })
})
