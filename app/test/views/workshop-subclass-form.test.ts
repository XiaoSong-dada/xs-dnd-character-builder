import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'

import { emptyBundle } from '@/rules/custom-content'
import { registerCustomContent, resetCustomContent } from '@/rules/repositories'
import SubclassForm from '@/views/workshop/edit/components/SubclassForm.vue'
import type { CustomClassEntry, CustomExpansion, CustomSubclassEntry } from '@/types/custom-content'

const NOW = '2026-11-02T00:00:00.000Z'
const SOURCE = 'source-custom-test'
const EXPANSIONS = [{ id: SOURCE, title: '工坊测试书' }]

function expansion(): CustomExpansion {
  return {
    id: SOURCE,
    ruleset: '5e-2014',
    title: '工坊测试书',
    shortTitle: '工坊',
    defaultEnabled: true,
    createdAt: NOW,
    updatedAt: NOW,
  }
}

function customClass(): CustomClassEntry {
  return {
    kind: 'class',
    id: 'custom-class-1',
    expansionId: SOURCE,
    ruleset: '5e-2014',
    name: '工坊职业',
    englishName: 'Workshop Class',
    summary: '自制职业',
    description: '说明',
    createdAt: NOW,
    updatedAt: NOW,
    hitDie: 10,
    primaryAbilities: ['力量'],
    savingThrowAbilities: ['str', 'con'],
  }
}

function existingSubclass(): CustomSubclassEntry {
  return {
    kind: 'subclass',
    id: 'custom-subclass-existing',
    expansionId: SOURCE,
    ruleset: '5e-2014',
    name: '既有子职',
    englishName: 'Existing Subclass',
    summary: '既有',
    description: '说明',
    createdAt: NOW,
    updatedAt: NOW,
    classId: 'custom-class-1',
    selectionLevel: 6,
  }
}

function mountForm(entry?: CustomSubclassEntry) {
  return mount(SubclassForm, {
    props: { ruleset: '5e-2014', expansionId: SOURCE, expansions: EXPANSIONS, entry },
  })
}

async function fillBasics(form: ReturnType<typeof mount>): Promise<void> {
  await form.get('#subclass-name').setValue('烈焰誓约')
  await form.get('#subclass-summary').setValue('以誓言换取火焰庇护')
  await form.get('#subclass-description').setValue('详细说明')
}

describe('自定义子职表单', () => {
  beforeEach(() => {
    localStorage.clear()
    resetCustomContent()
  })

  it('内置职业已有子职时选择等级自动锁定，保存写入父职业与等级', async () => {
    const form = mountForm()
    await fillBasics(form)
    await form.get('#subclass-class').setValue('class-2014-wizard')

    const level = form.get('#subclass-level')
    expect((level.element as HTMLInputElement).disabled).toBe(true)
    expect((level.element as HTMLInputElement).value).toBe('2')

    await form.get('.sticky-action-bar button:last-child').trigger('click')
    const input = form.emitted('save')?.[0]?.[0] as Record<string, unknown>
    expect(input).toMatchObject({
      kind: 'subclass',
      classId: 'class-2014-wizard',
      selectionLevel: 2,
      name: '烈焰誓约',
    })
  })

  it('自定义职业没有子职时允许选择 1—20，默认 3', async () => {
    registerCustomContent('5e-2014', {
      ...emptyBundle(),
      expansions: [expansion()],
      classes: [customClass()],
    })
    const form = mountForm()
    await fillBasics(form)
    await form.get('#subclass-class').setValue('custom-class-1')

    const level = form.get('#subclass-level')
    expect((level.element as HTMLInputElement).disabled).toBe(false)
    expect((level.element as HTMLInputElement).value).toBe('3')
    await level.setValue('7')

    await form.get('.sticky-action-bar button:last-child').trigger('click')
    const input = form.emitted('save')?.[0]?.[0] as Record<string, unknown>
    expect(input.selectionLevel).toBe(7)
  })

  it('父职业已有自定义子职时沿用其等级并提示', async () => {
    registerCustomContent('5e-2014', {
      ...emptyBundle(),
      expansions: [expansion()],
      classes: [customClass()],
      subclasses: [existingSubclass()],
    })
    const form = mountForm()
    await fillBasics(form)
    await form.get('#subclass-class').setValue('custom-class-1')

    expect((form.get('#subclass-level').element as HTMLInputElement).disabled).toBe(true)
    expect((form.get('#subclass-level').element as HTMLInputElement).value).toBe('6')
    expect(form.text()).toContain('该职业已有子职')
    expect(form.text()).toContain('固定为 6 级')
  })

  it('缺少名称时不保存并显示中文提示', async () => {
    const form = mountForm()
    await form.get('#subclass-summary').setValue('概括')
    await form.get('#subclass-description').setValue('说明')
    await form.get('#subclass-class').setValue('class-2014-wizard')
    await form.get('.sticky-action-bar button:last-child').trigger('click')

    expect(form.emitted('save')).toBeUndefined()
    expect(form.text()).toContain('请填写子职名称。')
  })
})
