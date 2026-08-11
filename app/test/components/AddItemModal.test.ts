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
    expect(armorTitles.length).toBeGreaterThan(0)
    expect(armorTitles.every((title) => ['衬甲', '皮甲', '镶钉皮甲', '兽皮甲', '链甲衫', '鳞甲', '胸甲', '半身板甲', '环甲', '链甲', '板条甲', '板甲'].includes(title ?? ''))).toBe(true)
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
