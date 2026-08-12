import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import AddItemModal from '@/views/character-builder/components/AddItemModal.vue'

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

    const search = document.body.querySelector<HTMLInputElement>('.add-item-modal__search input')
    search!.value = '长剑'
    search!.dispatchEvent(new Event('input'))
    await vi.advanceTimersByTimeAsync(0)

    const titles = Array.from(document.body.querySelectorAll('.expandable-option-card__title-line')).map((node) => node.textContent)
    expect(titles).toContain('长剑')
    expect(titles?.length).toBe(1)

    search!.value = ''
    search!.dispatchEvent(new Event('input'))
    await vi.advanceTimersByTimeAsync(0)
    const armorButton = Array.from(document.body.querySelectorAll<HTMLButtonElement>('.add-item-modal__categories button'))
      .find((button) => button.textContent?.trim() === '护甲')
    armorButton!.click()
    await vi.advanceTimersByTimeAsync(0)
    const armorTitles = Array.from(document.body.querySelectorAll('.expandable-option-card__title-line')).map((node) => node.textContent)
    // 护甲分类 = 12 种普通护甲 + 4 件 DMG 魔法护甲（护甲+1、精金/秘银/水手护甲）+ 3 件 XGtE 魔法护甲（光亮/脱卸/闷燃）
    const plainArmor = ['衬甲', '皮甲', '镶钉皮甲', '兽皮甲', '链甲衫', '鳞甲', '胸甲', '半身板甲', '环甲', '链甲', '板条甲', '板甲']
    for (const title of plainArmor) {
      expect(armorTitles).toContain(title)
    }
    expect(armorTitles?.length).toBe(19)
  })

  it('单击物品条目即展开装备详情（下拉介绍）', async () => {
    mount(AddItemModal, { props: { open: true }, attachTo: document.body })

    const search = document.body.querySelector<HTMLInputElement>('.add-item-modal__search input')
    search!.value = '长剑'
    search!.dispatchEvent(new Event('input'))
    await vi.advanceTimersByTimeAsync(0)
    await clickCard(0)

    // 单击后自动展开详情区：完整介绍 + 结构化装备详情
    const growth = document.querySelector('.add-item-modal__list .expandable-option-card__growth')
    expect(growth).not.toBeNull()
    expect(growth?.textContent).toContain('装备详情')
    expect(growth?.textContent).toContain('多用 1d10（双手）')
    expect(growth?.textContent).toContain('1d8 挥砍伤害')
    expect(growth?.textContent).toContain('可装备')
  })

  it('装备详情展示护甲 AC 与药水稀有度', async () => {
    mount(AddItemModal, { props: { open: true }, attachTo: document.body })
    const search = document.body.querySelector<HTMLInputElement>('.add-item-modal__search input')

    // 护甲：AC 公式行
    search!.value = '衬甲'
    search!.dispatchEvent(new Event('input'))
    await vi.advanceTimersByTimeAsync(0)
    await clickCard(0)
    const armorGrowth = document.querySelector('.add-item-modal__list .expandable-option-card__growth')
    expect(armorGrowth?.textContent).toContain('AC 11 + 敏捷调整值（不限）')

    // 药水：稀有度与不可装备
    search!.value = '治疗药水'
    search!.dispatchEvent(new Event('input'))
    await vi.advanceTimersByTimeAsync(0)
    await clickCard(0)
    const potionGrowth = document.querySelector('.add-item-modal__list .expandable-option-card__growth')
    expect(potionGrowth?.textContent).toContain('稀有度：常见')
    expect(potionGrowth?.textContent).toContain('不可装备')
    expect(potionGrowth?.textContent).toContain('恢复 2d4+2 点生命值')
  })

  it('adds a library item to the inventory with quantity and emits add', async () => {
    const wrapper = mount(AddItemModal, { props: { open: true }, attachTo: document.body })

    const search = document.body.querySelector<HTMLInputElement>('.add-item-modal__search input')
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
    const search = document.body.querySelector<HTMLInputElement>('.add-item-modal__search input')
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

    const search = document.body.querySelector<HTMLInputElement>('.add-item-modal__search input')
    search!.value = '长剑'
    search!.dispatchEvent(new Event('input'))
    await vi.advanceTimersByTimeAsync(0)
    await clickCard(0)

    buttonByText('加入装备栏')!.click()
    expect(wrapper.emitted('add')![0][0]).toEqual({ itemId: 'longsword', quantity: 1, equip: true })
  })
})
