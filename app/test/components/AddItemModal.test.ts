import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import AddItemModal from '@/components/AddItemModal.vue'
import { loadItemCatalog } from '@/rules/item-catalog-loader'

/** 弹窗通过 UiModal Teleport 到 body，操作统一走 document.body。 */
function cardMains(): HTMLElement[] {
  return Array.from(document.body.querySelectorAll<HTMLElement>('.expandable-option-card__main'))
}

/** 目录分块动态 import 需要多轮微任务，统一 flush 三次。 */
async function flush(): Promise<void> {
  await vi.advanceTimersByTimeAsync(0)
  await vi.advanceTimersByTimeAsync(0)
  await vi.advanceTimersByTimeAsync(0)
}

async function clickCard(index: number): Promise<void> {
  cardMains()[index]?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  await vi.advanceTimersByTimeAsync(300)
}

function buttonByText(text: string): HTMLButtonElement | undefined {
  return Array.from(document.body.querySelectorAll<HTMLButtonElement>('button'))
    .find((button) => button.textContent?.trim() === text)
}

function searchInput(): HTMLInputElement {
  const input = document.body.querySelector<HTMLInputElement>('.add-item-modal__search input')
  if (!input) throw new Error('未找到搜索框')
  return input
}

/** 点击筛选按钮行中指定组按钮（如“类别”），展开/收起该组条件面板。 */
async function toggleFilterPanel(label: string): Promise<void> {
  const button = Array.from(document.body.querySelectorAll<HTMLButtonElement>('.add-item-modal__filter-button'))
    .find((candidate) => candidate.textContent?.startsWith(label))
  if (!button) throw new Error(`未找到筛选按钮：${label}`)
  button.click()
  await flush()
}

async function setSearch(value: string): Promise<void> {
  const input = searchInput()
  input.value = value
  input.dispatchEvent(new Event('input'))
  await flush()
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
  await flush()
}

/** 默认行为与真实加载器一致；失败/重试用 mockRejectedValueOnce 注入。
 * 注：vitest 的 fake timers 会拦截动态 import() 的调度，因此这里直接返回
 * 静态导入的完整目录数据；加载器的真实动态 import 与缓存语义由
 * test/rules/item-catalog-loader.test.ts（无 fake timers）覆盖。 */
vi.mock('@/rules/item-catalog-loader', async () => {
  const { magicItemsCatalog2014 } = await import('@/rules/data/generated/magic-items-catalog-2014')
  return {
    loadItemCatalog: vi.fn(() => Promise.resolve(magicItemsCatalog2014)),
    resetItemCatalogCache: vi.fn(),
  }
})
const mockedLoad = vi.mocked(loadItemCatalog)

describe('AddItemModal', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    document.body.innerHTML = ''
    mockedLoad.mockClear()
  })
  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('filters the built-in library by search and category', async () => {
    mount(AddItemModal, { props: { open: true }, attachTo: document.body })
    await flush()
    expect(cardMains().length).toBeGreaterThan(1)

    await setSearch('长剑')
    const titles = Array.from(document.body.querySelectorAll('.expandable-option-card__title-line')).map((node) => node.textContent)
    expect(titles).toContain('长剑')
    expect(titles?.length).toBe(1)

    await setSearch('')
    await toggleFilterPanel('类别')
    fieldsetByLegend('类别').querySelector<HTMLButtonElement>('button')!.click()
    await flush()
    await toggleCheckbox(fieldsetByLegend('类别'), '护甲')
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
    await flush()

    await setSearch('长剑')
    await clickCard(0)

    // 单击后自动展开详情区：完整介绍 + 结构化装备详情
    const growth = document.querySelector('.add-item-modal__result-area .expandable-option-card__growth')
    expect(growth).not.toBeNull()
    expect(growth?.textContent).toContain('装备详情')
    expect(growth?.textContent).toContain('多用 1d10（双手）')
    expect(growth?.textContent).toContain('1d8 挥砍伤害')
    expect(growth?.textContent).toContain('可装备')
  })

  it('装备详情展示护甲 AC 与药水稀有度', async () => {
    mount(AddItemModal, { props: { open: true }, attachTo: document.body })
    await flush()

    // 护甲：AC 公式行
    await setSearch('衬甲')
    await clickCard(0)
    const armorGrowth = document.querySelector('.add-item-modal__result-area .expandable-option-card__growth')
    expect(armorGrowth?.textContent).toContain('AC 11 + 敏捷调整值（不限）')

    // 药水：稀有度与不可装备。先收起上一条详情，避免过渡期内读取旧节点。
    await clickCard(0)
    await setSearch('治疗药水')
    await clickCard(0)
    const potionGrowth = document.querySelector('.add-item-modal__result-area .expandable-option-card__growth')
    expect(potionGrowth?.textContent).toContain('稀有度：常见')
    expect(potionGrowth?.textContent).toContain('魔法类别：药水')
    expect(potionGrowth?.textContent).toContain('不可装备')
    expect(potionGrowth?.textContent).toContain('恢复 2d4+2 点生命值')
  })

  it('大量候选采用渐进显示，且结果总数不被截断', async () => {
    mount(AddItemModal, { props: { open: true }, attachTo: document.body })
    await flush()
    expect(cardMains()).toHaveLength(80)
    expect(document.body.textContent).toContain('找到 677 件物品')
    const loadMore = Array.from(document.body.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent?.includes('显示更多'))
    loadMore!.click()
    await flush()
    expect(cardMains()).toHaveLength(160)
  })

  it('supports English and stable-ID search, and empty filter groups', async () => {
    mount(AddItemModal, { props: { open: true }, attachTo: document.body })
    await flush()

    await setSearch('Longsword')
    expect(cardMains()).toHaveLength(1)
    expect(document.body.textContent).toContain('长剑')

    await setSearch('potion-of-healing')
    expect(cardMains()).toHaveLength(1)
    expect(document.body.textContent).toContain('治疗药水')

    await toggleFilterPanel('类别')
    fieldsetByLegend('类别').querySelector<HTMLButtonElement>('button')!.click()
    await flush()
    expect(cardMains()).toHaveLength(0)
    expect(document.body.textContent).toContain('至少有一个筛选组未选择任何条件')
  })

  it('展示特殊同调条件，并阻止直接添加多型号聚合索引', async () => {
    mount(AddItemModal, { props: { open: true }, attachTo: document.body })
    await flush()

    await setSearch('Staff of Fire')
    await clickCard(0)
    expect(document.body.querySelector('.expandable-option-card__growth')?.textContent)
      .toContain('特殊同调：德鲁伊、术士、魔契师或法师同调')

    await clickCard(0)
    await setSearch('Ammunition, +1/+2/+3')
    await clickCard(0)
    expect(buttonByText('加入物品栏')!.disabled).toBe(true)
    expect(document.body.textContent).toContain('该索引包含多个型号')
  })

  it('每次重新打开恢复全选，打开期间切换面板与收起不清除条件', async () => {
    const wrapper = mount(AddItemModal, { props: { open: true }, attachTo: document.body })
    await flush()
    await toggleFilterPanel('类别')
    fieldsetByLegend('类别').querySelector<HTMLButtonElement>('button')!.click()
    await flush()
    await toggleCheckbox(fieldsetByLegend('类别'), '武器')
    const filteredCount = cardMains().length
    expect(filteredCount).toBeGreaterThan(0)

    // 切换面板：类别面板收起、选择保留。
    await toggleFilterPanel('来源')
    expect(document.querySelector('#add-item-filter-category')).toBeNull()
    expect(document.querySelector('#add-item-filter-source')).not.toBeNull()
    await toggleFilterPanel('类别')
    expect(fieldsetByLegend('类别').querySelectorAll<HTMLInputElement>('input:checked')).toHaveLength(1)

    // 再次点击当前按钮收起；选择仍保留。
    await toggleFilterPanel('类别')
    expect(document.querySelector('#add-item-filter-category')).toBeNull()
    expect(cardMains()).toHaveLength(filteredCount)

    // 重新打开恢复默认全选。
    await wrapper.setProps({ open: false })
    await wrapper.setProps({ open: true })
    await flush()
    await toggleFilterPanel('类别')
    expect(fieldsetByLegend('类别').querySelectorAll<HTMLInputElement>('input:checked'))
      .toHaveLength(fieldsetByLegend('类别').querySelectorAll<HTMLInputElement>('input').length)
  })

  it('同屏只展开一个筛选组，限制后按钮显示已选数量', async () => {
    mount(AddItemModal, { props: { open: true }, attachTo: document.body })
    await flush()
    expect(document.body.querySelector('.add-item-modal__filter-panel')).toBeNull()

    await toggleFilterPanel('稀有度')
    expect(document.querySelector('#add-item-filter-rarity')).not.toBeNull()
    const rarityButton = Array.from(document.body.querySelectorAll<HTMLButtonElement>('.add-item-modal__filter-button'))
      .find((candidate) => candidate.textContent?.startsWith('稀有度'))!
    // 全选状态下按钮不显示数量徽标。
    expect(rarityButton.textContent?.trim()).toBe('稀有度')

    await toggleCheckbox(fieldsetByLegend('稀有度'), '传说')
    expect(rarityButton.textContent).toContain('6/7')
    // 收起面板后按钮仍显示限制状态。
    await toggleFilterPanel('稀有度')
    expect(rarityButton.textContent).toContain('6/7')
  })

  it('搜索框、筛选按钮与展开面板固定在滚动区域之外，仅结果列表滚动', async () => {
    mount(AddItemModal, { props: { open: true }, attachTo: document.body })
    await flush()
    await toggleFilterPanel('类别')

    const scrollArea = document.querySelector('.add-item-modal__result-area')
    const modalBody = document.querySelector('.ui-scroll-modal__body')
    expect(scrollArea).not.toBeNull()
    expect(modalBody?.classList.contains('ui-scroll-modal__body--contained')).toBe(true)
    expect(scrollArea?.querySelector('.add-item-modal__search')).toBeNull()
    expect(scrollArea?.querySelector('.add-item-modal__filter-bar')).toBeNull()
    expect(scrollArea?.querySelector('.add-item-modal__filter-panel')).toBeNull()
    expect(scrollArea?.querySelector('.expandable-option-card')).not.toBeNull()
  })

  it('筛选按钮使用同一个横向自伸缩容器且不写入内联宽度', async () => {
    mount(AddItemModal, { props: { open: true }, attachTo: document.body })
    await flush()

    const filterBar = document.body.querySelector('.add-item-modal__filter-bar')
    const buttons = Array.from(filterBar?.querySelectorAll<HTMLButtonElement>('.add-item-modal__filter-button') ?? [])
    expect(buttons).toHaveLength(4)
    expect(buttons.map((button) => button.textContent?.trim())).toEqual(['来源', '同调', '类别', '稀有度'])
    expect(buttons.every((button) => !button.style.width)).toBe(true)
  })

  it('目录加载失败时展示重试，重试成功后恢复列表', async () => {
    mockedLoad.mockRejectedValueOnce(new Error('network down'))
    mount(AddItemModal, { props: { open: true }, attachTo: document.body })
    await flush()
    expect(document.body.textContent).toContain('物品目录加载失败')

    // 失败不阻塞搜索框、筛选按钮与自定义物品入口。
    expect(searchInput()).not.toBeNull()
    expect(document.body.querySelector('.add-item-modal__filter-button')).not.toBeNull()
    expect(document.body.querySelector('.add-item-modal__custom input')).not.toBeNull()

    buttonByText('重试')!.click()
    await flush()
    expect(cardMains().length).toBeGreaterThan(1)
  })

  it('角色启用来源决定候选池与来源复选项', async () => {
    mount(AddItemModal, { props: { open: true, enabledSourceIds: ['erftlw-2019-index'] }, attachTo: document.body })
    await flush()
    await toggleFilterPanel('来源')
    expect(fieldsetByLegend('来源').textContent).toContain('ERftLW')
    expect(fieldsetByLegend('来源').textContent).not.toContain('EGtW')

    await setSearch('Earworm')
    expect(cardMains()).toHaveLength(1)

    await setSearch('Breathing Bubble')
    expect(cardMains()).toHaveLength(0)
  })

  it('adds a library item to the inventory with quantity and emits add', async () => {
    const wrapper = mount(AddItemModal, { props: { open: true }, attachTo: document.body })
    await flush()

    await setSearch('长剑')
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
    await flush()

    // 非可装备物品（口粮）。
    await setSearch('口粮')
    await clickCard(0)
    expect(buttonByText('加入装备栏')!.disabled).toBe(true)
    expect(document.body.textContent).toContain('该物品无法装备')

    // 自定义物品。
    const custom = document.body.querySelector<HTMLInputElement>('.add-item-modal__custom input')
    custom!.value = '治疗药水'
    custom!.dispatchEvent(new Event('focus'))
    custom!.dispatchEvent(new Event('input'))
    await flush()
    expect(buttonByText('加入装备栏')!.disabled).toBe(true)
    expect(document.body.textContent).toContain('自定义物品无法装备')
    expect(buttonByText('加入物品栏')!.disabled).toBe(false)

    buttonByText('加入物品栏')!.click()
    expect(wrapper.emitted('add')![0][0]).toEqual({ itemId: '治疗药水', quantity: 1, equip: false })
  })

  it('equips an equippable item when using the equip action', async () => {
    const wrapper = mount(AddItemModal, { props: { open: true }, attachTo: document.body })
    await flush()

    await setSearch('长剑')
    await clickCard(0)

    buttonByText('加入装备栏')!.click()
    expect(wrapper.emitted('add')![0][0]).toEqual({ itemId: 'longsword', quantity: 1, equip: true })
  })
})
