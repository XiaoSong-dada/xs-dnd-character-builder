import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'

import { resetCustomContent } from '@/rules/repositories'
import ClassForm from '@/views/workshop/edit/components/ClassForm.vue'

const EXPANSIONS = [{ id: 'source-custom-test', title: '工坊测试书' }]

function mountClassForm() {
  return mount(ClassForm, {
    props: { ruleset: '5e-2014', expansionId: 'source-custom-test', expansions: EXPANSIONS },
  })
}

async function fillBasics(form: ReturnType<typeof mount>): Promise<void> {
  await form.get('#class-name').setValue('工坊战士')
  await form.get('#class-summary').setValue('自制职业')
  await form.get('#class-description').setValue('说明文字')
}

/** 表单里的字段组顺序：0 主属性、1 豁免熟练、2 护甲训练、3 武器训练。 */
const GROUP = { primary: 0, saves: 1, armor: 2, weapon: 3 } as const

function chipIn(form: ReturnType<typeof mount>, group: number, name: string) {
  const fieldsets = form.findAll('fieldset.class-form__group')
  const target = fieldsets[group]
  if (!target) throw new Error(`fieldset ${group} missing`)
  return target.findAll('button').find((chip) => chip.text() === name)
}

async function selectTwoSaves(form: ReturnType<typeof mount>): Promise<void> {
  await chipIn(form, GROUP.saves, '感知')?.trigger('click')
  await chipIn(form, GROUP.saves, '魅力')?.trigger('click')
}

/** 满足最小可保存条件：一项主属性 + 两项豁免。 */
async function fillMechanicalMinimum(form: ReturnType<typeof mount>): Promise<void> {
  await chipIn(form, GROUP.primary, '力量')?.trigger('click')
  await selectTwoSaves(form)
}

describe('自定义职业表单', () => {
  beforeEach(() => {
    localStorage.clear()
    resetCustomContent()
  })

  it('生命骰、主属性、豁免熟练与无甲防御写入保存结果', async () => {
    const form = mountClassForm()
    await fillBasics(form)
    await form.get('#class-hit-die').setValue('10')
    await chipIn(form, GROUP.primary, '力量')?.trigger('click')
    await selectTwoSaves(form)
    await chipIn(form, GROUP.armor, '重甲')?.trigger('click')
    await chipIn(form, GROUP.weapon, '军用武器')?.trigger('click')
    await form.find('input[type="checkbox"]').setValue(true)

    await form.get('.sticky-action-bar button:last-child').trigger('click')
    const input = form.emitted('save')?.[0]?.[0] as Record<string, unknown>
    expect(input).toMatchObject({
      kind: 'class',
      hitDie: 10,
      primaryAbilities: ['力量'],
      savingThrowAbilities: expect.arrayContaining(['wis', 'cha']),
      armorTraining: ['heavy'],
      weaponTraining: { categories: ['martial'] },
      unarmoredDefense: { ability: 'dex', allowsShield: false },
    })
  })

  it('豁免不足两项时不保存', async () => {
    const form = mountClassForm()
    await fillBasics(form)
    await chipIn(form, GROUP.saves, '感知')?.trigger('click')

    await form.get('.sticky-action-bar button:last-child').trigger('click')
    expect(form.emitted('save')).toBeUndefined()
    expect(form.text()).toContain('请选择两项豁免熟练')
  })

  it('开启施法后引用所选职业的法术表，并允许改施法属性', async () => {
    const form = mountClassForm()
    await fillBasics(form)
    await fillMechanicalMinimum(form)

    const casterSwitch = form.findAll('input[type="checkbox"]').at(-1)
    await casterSwitch?.setValue(true)
    await form.get('#class-caster-source').setValue('class-2014-wizard')
    await form.get('#class-caster-ability').setValue('cha')

    await form.get('.sticky-action-bar button:last-child').trigger('click')
    const input = form.emitted('save')?.[0]?.[0] as Record<string, unknown>
    expect(input.spellcastingSourceClassId).toBe('class-2014-wizard')
    expect(input.spellcastingAbility).toBe('cha')
  })

  it('未开启施法时不写施法字段', async () => {
    const form = mountClassForm()
    await fillBasics(form)
    await fillMechanicalMinimum(form)

    await form.get('.sticky-action-bar button:last-child').trigger('click')
    const input = form.emitted('save')?.[0]?.[0] as Record<string, unknown>
    expect(input.spellcastingSourceClassId).toBeUndefined()
  })
})
