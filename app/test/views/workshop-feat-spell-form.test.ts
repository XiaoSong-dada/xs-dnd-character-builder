import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { createMemoryHistory, createRouter, RouterView } from 'vue-router'

import { routes } from '@/router/router'
import { resetCustomContent } from '@/rules/repositories'
import { useCustomContentStore } from '@/stores/custom-content'
import type { CustomFeatEntry } from '@/types/custom-content'
import FeatForm from '@/views/workshop/edit/components/FeatForm.vue'
import SpellForm from '@/views/workshop/edit/components/SpellForm.vue'

const EXPANSIONS = [{ id: 'source-custom-test', title: '工坊测试书' }]

/** 路由渲染外壳：让编辑器作为真正的路由组件挂载（离开确认需要活动路由记录）。 */
const Harness = defineComponent({ render: () => h(RouterView) })

function mountFeatForm(ruleset: '5e-2014' | '5e-2024') {
  return mount(FeatForm, {
    props: { ruleset, expansionId: 'source-custom-test', expansions: EXPANSIONS },
  })
}

function mountSpellForm(ruleset: '5e-2014' | '5e-2024') {
  return mount(SpellForm, {
    props: { ruleset, expansionId: 'source-custom-test', expansions: EXPANSIONS },
  })
}

afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
  document.body.innerHTML = ''
})

async function openSpellPicker(form: ReturnType<typeof mount>): Promise<void> {
  await form.get('.feat-form__add-spell').trigger('click')
  await nextTick()
}

async function searchInPicker(keyword: string): Promise<void> {
  const input = document.body.querySelector<HTMLInputElement>('[aria-label="搜索法术"]')
  expect(input).not.toBeNull()
  input!.value = keyword
  input!.dispatchEvent(new Event('input', { bubbles: true }))
  await nextTick()
}

async function pickSpellCard(index: number): Promise<void> {
  const card = document.body.querySelectorAll<HTMLButtonElement>(
    '.spell-picker-modal .expandable-option-card__main',
  )[index]
  expect(card).toBeDefined()
  card!.click()
  await vi.advanceTimersByTimeAsync(300)
  await nextTick()
}

async function pickUnselectedSpellCard(): Promise<void> {
  const card = Array.from(
    document.body.querySelectorAll<HTMLButtonElement>(
      '.spell-picker-modal .expandable-option-card__main',
    ),
  ).find((item) => item.getAttribute('aria-pressed') !== 'true')
  expect(card).toBeDefined()
  card!.click()
  await vi.advanceTimersByTimeAsync(300)
  await nextTick()
}

async function confirmSpellPicker(count: number): Promise<void> {
  const button = Array.from(document.body.querySelectorAll<HTMLButtonElement>('button')).find(
    (item) => item.textContent?.trim() === `添加 ${count} 个`,
  )
  expect(button).toBeDefined()
  button!.click()
  await nextTick()
}

function savedFeatInput(form: ReturnType<typeof mount>): Record<string, unknown> {
  return form.emitted('save')?.[0]?.[0] as Record<string, unknown>
}

async function fillFeatBasics(form: ReturnType<typeof mount>): Promise<void> {
  await form.get('#feat-name').setValue('工坊专长')
  await form.get('#feat-summary').setValue('自制专长')
  await form.get('#feat-description').setValue('说明文字')
}

describe('自定义专长表单', () => {
  beforeEach(() => {
    localStorage.clear()
    resetCustomContent()
  })

  it('2014 不显示类别选择，保存时也不带类别', async () => {
    const form = mountFeatForm('5e-2014')
    expect(form.text()).toContain('2014 专长没有类别体系')
    expect(form.find('#feat-category').exists()).toBe(false)

    await fillFeatBasics(form)
    await form.get('.sticky-action-bar button:last-child').trigger('click')
    const input = form.emitted('save')?.[0]?.[0] as Record<string, unknown>
    expect(input.kind).toBe('feat')
    expect(input.category).toBeUndefined()
  })

  it('2024 选择起源专长类别后写入 category', async () => {
    const form = mountFeatForm('5e-2024')
    await fillFeatBasics(form)
    await form.get('#feat-category').setValue('origin')
    await form.get('.sticky-action-bar button:last-child').trigger('click')
    const input = form.emitted('save')?.[0]?.[0] as Record<string, unknown>
    expect(input.category).toBe('origin')
  })

  it('前置与结构化效果被正确转换', async () => {
    const form = mountFeatForm('5e-2024')
    await fillFeatBasics(form)
    await form.get('#feat-min-level').setValue('4')
    await form.get('#feat-hp-level').setValue('2')
    await form.get('#feat-speed').setValue('10')
    const heavyArmor = form.findAll('.feat-form__chip').find((chip) => chip.text() === '重甲')
    await heavyArmor?.trigger('click')

    await form.get('.sticky-action-bar button:last-child').trigger('click')
    const input = form.emitted('save')?.[0]?.[0] as Record<string, unknown>
    expect(input.hitPointBonusPerLevel).toBe(2)
    expect(input.speedBonus).toBe(10)
    expect(input.armorTraining).toContain('heavy')
    expect(input.prerequisite).toMatchObject({ minimumLevel: 4 })
  })

  it('可搜索并一次授予多个法术', async () => {
    vi.useFakeTimers()
    const form = mountFeatForm('5e-2014')
    await fillFeatBasics(form)
    await openSpellPicker(form)
    await searchInPicker('火焰')
    await pickSpellCard(0)
    await searchInPicker('')
    await pickUnselectedSpellCard()
    await confirmSpellPicker(2)

    expect(form.findAll('.feat-form__grant')).toHaveLength(2)

    await form.get('.sticky-action-bar button:last-child').trigger('click')
    expect((savedFeatInput(form).grantedSpellIds as readonly string[]).length).toBe(2)
  })

  it('授予行可展开效果并单独移除', async () => {
    vi.useFakeTimers()
    const form = mountFeatForm('5e-2014')
    await fillFeatBasics(form)
    await openSpellPicker(form)
    await pickSpellCard(0)
    await pickSpellCard(1)
    await confirmSpellPicker(2)

    const rows = form.findAll('.feat-form__grant')
    expect(rows).toHaveLength(2)
    await rows[0]!.get('.feat-form__grant-main').trigger('click')
    expect(rows[0]!.get('.feat-form__grant-detail').exists()).toBe(true)

    await rows[0]!.get('.feat-form__grant-remove').trigger('click')
    expect(form.findAll('.feat-form__grant')).toHaveLength(1)

    await form.get('.sticky-action-bar button:last-child').trigger('click')
    expect((savedFeatInput(form).grantedSpellIds as readonly string[]).length).toBe(1)
  })

  it('已归档的授予法术显示徽标、弹窗中锁定，且可移除', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useCustomContentStore()
    const expansion = store.saveExpansion({
      ruleset: '5e-2014',
      title: '工坊测试书',
      shortTitle: '工坊',
      defaultEnabled: true,
    })
    const grantedSpell = store.createEntry({
      kind: 'spell',
      expansionId: expansion.id,
      ruleset: '5e-2014',
      name: '归档之火',
      englishName: 'Archived Flame',
      summary: '自制法术',
      description: '归档后的说明。',
      level: 1,
      classIds: [],
    })
    const otherSpell = store.createEntry({
      kind: 'spell',
      expansionId: expansion.id,
      ruleset: '5e-2014',
      name: '另一归档法术',
      englishName: 'Another Archived Flame',
      summary: '自制法术',
      description: '另一条说明。',
      level: 1,
      classIds: [],
    })
    store.archiveEntry('5e-2014', grantedSpell.id)
    store.archiveEntry('5e-2014', otherSpell.id)

    const entry: CustomFeatEntry = {
      kind: 'feat',
      id: 'custom-feat-archived-grant',
      expansionId: expansion.id,
      ruleset: '5e-2014',
      name: '归档授予专长',
      englishName: '',
      summary: '摘要',
      description: '说明',
      createdAt: '',
      updatedAt: '',
      grantedSpellIds: [grantedSpell.id],
    }
    const form = mount(FeatForm, {
      props: {
        ruleset: '5e-2014',
        expansionId: expansion.id,
        expansions: [{ id: expansion.id, title: expansion.title }],
        entry,
      },
    })

    expect(form.text()).toContain('已归档')
    await form.get('.feat-form__grant-main').trigger('click')
    expect(form.get('.feat-form__grant-detail').text()).toBe('归档后的说明。')

    await form.get('.feat-form__add-spell').trigger('click')
    await nextTick()
    const archivedCard = Array.from(
      document.body.querySelectorAll<HTMLElement>('.spell-picker-modal .expandable-option-card'),
    ).find((card) => card.textContent?.includes('另一归档法术'))
    expect(archivedCard).toBeDefined()
    expect(archivedCard!.classList.contains('expandable-option-card--locked')).toBe(true)

    await form.get('.feat-form__grant-remove').trigger('click')
    expect(form.findAll('.feat-form__grant')).toHaveLength(0)

    await form.get('.sticky-action-bar button:last-child').trigger('click')
    expect(savedFeatInput(form).grantedSpellIds).toBeUndefined()
  })

  it('必填缺失时不保存', async () => {
    const form = mountFeatForm('5e-2024')
    await form.get('.sticky-action-bar button:last-child').trigger('click')
    expect(form.emitted('save')).toBeUndefined()
    expect(form.text()).toContain('请填写专长名称')
  })
})

describe('自定义法术表单', () => {
  beforeEach(() => {
    localStorage.clear()
    resetCustomContent()
  })

  it('环级与职业归属写入保存结果', async () => {
    const form = mountSpellForm('5e-2014')
    await form.get('#spell-name').setValue('工坊法术')
    await form.get('#spell-summary').setValue('自制法术')
    await form.get('#spell-description').setValue('说明文字')
    await form.get('#spell-level').setValue('3')
    const wizardChip = form.findAll('.spell-form__chip').find((chip) => chip.text() === '法师')
    await wizardChip?.trigger('click')

    await form.get('.sticky-action-bar button:last-child').trigger('click')
    const input = form.emitted('save')?.[0]?.[0] as Record<string, unknown>
    expect(input.kind).toBe('spell')
    expect(input.level).toBe(3)
    expect(input.classIds).toContain('class-2014-wizard')
  })

  it('展示字段可选填，填了才写入', async () => {
    const form = mountSpellForm('5e-2024')
    await form.get('#spell-name').setValue('工坊法术')
    await form.get('#spell-summary').setValue('自制法术')
    await form.get('#spell-description').setValue('说明文字')
    await form.get('#spell-school').setValue('塑能')
    await form.get('#spell-range').setValue('60 尺')

    await form.get('.sticky-action-bar button:last-child').trigger('click')
    const input = form.emitted('save')?.[0]?.[0] as Record<string, unknown>
    expect(input.school).toBe('塑能')
    expect(input.range).toBe('60 尺')
    expect(input.castingTime).toBeUndefined()
  })
})

describe('编辑器页接线：专长与法术', () => {
  function setupStore() {
    localStorage.clear()
    resetCustomContent()
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useCustomContentStore()
    store.saveExpansion({ ruleset: '5e-2014', title: '工坊测试书', shortTitle: '工坊', defaultEnabled: true })
    return { pinia, store }
  }

  async function mountEditorAt(pinia: ReturnType<typeof createPinia>, path: string) {
    const router = createRouter({ history: createMemoryHistory(), routes })
    await router.push(path)
    await router.isReady()
    const wrapper = mount(Harness, { global: { plugins: [pinia, router] } })
    return { wrapper, router }
  }

  it('专长编辑器保存后写入内容库', async () => {
    const { pinia, store } = setupStore()
    const { wrapper } = await mountEditorAt(pinia, '/assistant/workshop/feat/new')
    await fillFeatBasics(wrapper)
    const saveButton = wrapper.findAll('button').find((button) => button.text() === '保存专长')
    await saveButton?.trigger('click')

    const feats = store.entriesOf('5e-2014').filter((entry) => entry.kind === 'feat')
    expect(feats).toHaveLength(1)
    expect(feats[0]?.name).toBe('工坊专长')
  })

  it('法术编辑器保存后写入内容库', async () => {
    const { pinia, store } = setupStore()
    const { wrapper } = await mountEditorAt(pinia, '/assistant/workshop/spell/new')
    await wrapper.get('#spell-name').setValue('工坊法术')
    await wrapper.get('#spell-summary').setValue('自制法术')
    await wrapper.get('#spell-description').setValue('说明文字')
    const saveButton = wrapper.findAll('button').find((button) => button.text() === '保存法术')
    await saveButton?.trigger('click')

    const spells = store.entriesOf('5e-2014').filter((entry) => entry.kind === 'spell')
    expect(spells).toHaveLength(1)
    expect(spells[0]?.name).toBe('工坊法术')
  })
})
