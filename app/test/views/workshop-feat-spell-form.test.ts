import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { createMemoryHistory, createRouter, RouterView } from 'vue-router'

import { routes } from '@/router/router'
import { resetCustomContent } from '@/rules/repositories'
import { useCustomContentStore } from '@/stores/custom-content'
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

  it('可搜索并授予法术', async () => {
    const form = mountFeatForm('5e-2014')
    await fillFeatBasics(form)
    await form.get('#feat-spell-search').setValue('火焰')
    const firstOption = form.get('.feat-form__option')
    const label = firstOption.text()
    await firstOption.trigger('click')
    expect(form.text()).toContain(label.split(' · ')[0] ?? label)

    await form.get('.sticky-action-bar button:last-child').trigger('click')
    const input = form.emitted('save')?.[0]?.[0] as Record<string, unknown>
    expect((input.grantedSpellIds as readonly string[]).length).toBe(1)
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
