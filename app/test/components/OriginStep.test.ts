import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { rulesRepository } from '@/rules/repository'
import OriginStep from '@/views/character-builder/components/OriginStep.vue'
import type { SelectionTaskFocusHandle } from '@/views/character-builder/selection-task'

function mountOrigin(patch: Record<string, unknown> = {}) {
  return mount(OriginStep, { props: { languages: [], raceSkillChoices: [], backgroundToolIds: [], ...patch } })
}

async function openTask(wrapper: ReturnType<typeof mountOrigin>, id: string) {
  await wrapper.get(`[data-task-id="${id}"]`).trigger('click')
}

describe('OriginStep 动态任务与候选目录', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('首次只打开第一个缺项，并可自由跳转到背景任务', async () => {
    const wrapper = mountOrigin()
    expect(wrapper.get('[data-task-id="race"]').attributes('aria-selected')).toBe('true')
    expect(wrapper.find('input[aria-label="搜索种族"]').exists()).toBe(true)
    expect(wrapper.find('input[aria-label="搜索背景"]').exists()).toBe(false)
    await openTask(wrapper, 'background')
    expect(wrapper.get('[data-task-id="background"]').attributes('aria-selected')).toBe('true')
    expect(wrapper.find('input[aria-label="搜索背景"]').exists()).toBe(true)
  })

  it('默认只展示推荐/前六项，展开完整目录后可见可选规则种族', async () => {
    const wrapper = mountOrigin()
    const expand = wrapper.findAll('button').find((button) => button.text().startsWith('查看全部'))
    expect(expand).toBeTruthy()
    await expand!.trigger('click')
    const bird = wrapper.findAll('.expandable-option-card').find((card) => card.text().includes('鸟人'))
    expect(bird).toBeTruthy()
    expect(bird!.text()).toContain('可选规则')
  })

  it('搜索自动查询完整种族池，且已选摘要不会被隐藏', async () => {
    const wrapper = mountOrigin({ raceId: 'race-2014-human' })
    await openTask(wrapper, 'race')
    await wrapper.get('input[aria-label="搜索种族"]').setValue('Aarakocra')
    expect(wrapper.text()).toContain('已选择：人类')
    expect(wrapper.text()).toContain('鸟人')
  })

  it('查看全部后候选仍按推荐优先排序（v1.9.1 R1-1）', async () => {
    const wrapper = mountOrigin({ classId: 'class-2014-fighter' })
    const expand = wrapper.findAll('button').find((button) => button.text().startsWith('查看全部'))
    expect(expand).toBeTruthy()
    await expand!.trigger('click')

    // 与组件同源的候选池（基础种族、全部来源可用、未选任何种族），仅排序为被测行为
    const pool = rulesRepository.races.filter((item) => !item.parentRaceId)
    const recommendedNames = new Set(
      pool.filter((item) => item.recommendedClassIds.includes('class-2014-fighter')).map((item) => item.name),
    )
    const expected = [
      ...pool.filter((item) => item.recommendedClassIds.includes('class-2014-fighter')),
      ...pool.filter((item) => !item.recommendedClassIds.includes('class-2014-fighter')),
    ].map((item) => item.name)

    const rendered = wrapper.findAll('.expandable-option-card__title-line strong').map((node) => node.text())
    expect(recommendedNames.size, '用例需覆盖至少一个推荐项').toBeGreaterThan(0)
    expect(rendered).toEqual(expected)

    const boundary = rendered.findIndex((name) => !recommendedNames.has(name))
    expect(boundary).toBeGreaterThan(0)
    expect(rendered.slice(boundary).some((name) => recommendedNames.has(name))).toBe(false)
  })

  it('搜索结果同样推荐优先（v1.9.1 R1-1）', async () => {
    const wrapper = mountOrigin({ classId: 'class-2014-barbarian' })
    await openTask(wrapper, 'race')
    await wrapper.get('input[aria-label="搜索种族"]').setValue('a')
    const rendered = wrapper.findAll('.expandable-option-card__title-line strong').map((node) => node.text())
    const recommendedFlags = rendered.map((name) => {
      const race = rulesRepository.races.find((item) => !item.parentRaceId && item.name === name)
      return race ? race.recommendedClassIds.includes('class-2014-barbarian') : false
    })
    const boundary = recommendedFlags.indexOf(false)
    expect(boundary).toBeGreaterThan(0)
    expect(recommendedFlags.slice(boundary).some(Boolean)).toBe(false)
  })

  it('选择主种族后动态出现必选子种族任务', () => {
    const wrapper = mountOrigin({ raceId: 'race-2014-shifter' })
    expect(wrapper.find('[data-task-id="subrace"]').exists()).toBe(true)
    expect(wrapper.get('[data-task-id="subrace"]').text()).toContain('当前')
    expect(wrapper.text()).toContain('熊皮兽化人')
    expect(wrapper.text()).toContain('野猎兽化人')
  })

  it('种族卡片展开查看详情，主按钮单击后发出选择', async () => {
    const wrapper = mountOrigin()
    const dwarf = wrapper.findAll('.expandable-option-card').find((card) => card.text().includes('矮人'))!
    await dwarf.get('.expandable-option-card__arrow').trigger('click')
    expect(dwarf.text()).toContain('黑暗视觉')
    await dwarf.get('.expandable-option-card__main').trigger('click')
    await vi.advanceTimersByTimeAsync(250)
    expect(wrapper.emitted('race')?.[0]).toEqual(['race-2014-dwarf'])
  })

  it('背景变体是可选任务，不参与必选门禁', async () => {
    const wrapper = mountOrigin({ raceId: 'race-2014-human', backgroundId: 'background-2014-sailor' })
    expect(wrapper.get('[data-task-id="background-variant"]').text()).toContain('可选')
    await openTask(wrapper, 'background-variant')
    expect(wrapper.text()).toContain('海盗')
    expect(wrapper.text()).toContain('不选择背景变体也可以继续')
  })
})

describe('OriginStep 动态附加选择', () => {
  it('半精灵熟练任务展示全技能二选并发出选择', async () => {
    const wrapper = mountOrigin({ raceId: 'race-2014-half-elf' })
    await openTask(wrapper, 'race-proficiencies')
    const buttons = wrapper.findAll('.origin-step__choices button')
    expect(buttons).toHaveLength(18)
    await buttons.find((button) => button.text().includes('欺瞒'))!.trigger('click')
    expect(wrapper.emitted('raceSkills')?.[0]).toEqual([['skill-deception']])
  })

  it('工具型种族熟练作为独立任务，选择后发出 raceTool', async () => {
    const wrapper = mountOrigin({ raceId: 'race-2014-dwarf', subraceId: 'race-2014-dwarf-mountain' })
    await openTask(wrapper, 'race-proficiencies')
    const thieves = wrapper.findAll('.origin-step__choices button').find((button) => button.text().includes('盗贼工具'))!
    await thieves.trigger('click')
    expect(wrapper.emitted('raceTool')?.[0]).toEqual(['tool-thieves-tools'])
  })

  it('吉斯洋基技能与工具互斥', async () => {
    const wrapper = mountOrigin({ raceId: 'race-2014-gith-githyanki', raceSkillChoices: ['skill-arcana'] })
    await openTask(wrapper, 'race-proficiencies')
    const thieves = wrapper.findAll('.origin-step__choices button').find((button) => button.text().includes('盗贼工具'))!
    await thieves.trigger('click')
    expect(wrapper.emitted('raceTool')?.[0]).toEqual(['tool-thieves-tools'])
    expect(wrapper.emitted('raceSkills')?.[0]).toEqual([[]])
  })

  it('背景属性、固定专长与结构化工具分别生成任务', async () => {
    const wrapper = mountOrigin({
      ruleset: '5e-2024', raceId: 'species-2024-dwarf', backgroundId: 'background-2024-artisan',
      backgroundAbilities: { str: 2, dex: 1 },
      blockers: [{ id: 'background-tool-choice-count', message: '工具未完成', resolution: '请选择工具。' }],
    })
    expect(wrapper.find('[data-task-id="background-abilities"]').exists()).toBe(true)
    expect(wrapper.find('[data-task-id="background-feat"]').exists()).toBe(true)
    expect(wrapper.find('[data-task-id="background-tools"]').exists()).toBe(true)
    await openTask(wrapper, 'background-feat')
    expect(wrapper.text()).toContain('自动获得')
    expect(wrapper.text()).toContain('巧匠')
    await openTask(wrapper, 'background-tools')
    const firstTool = wrapper.find('.origin-step__choices button')
    expect(firstTool.exists()).toBe(true)
    await firstTool.trigger('click')
    expect(wrapper.emitted('backgroundTools')?.[0]?.[0]).toHaveLength(1)
  })

  it('候选型起源专长在独立任务中写入检查点', async () => {
    vi.useFakeTimers()
    const wrapper = mountOrigin({ ruleset: '5e-2024', raceId: 'species-2024-dwarf', backgroundId: 'background-2024-tp-vtm-ritualist' })
    await openTask(wrapper, 'background-feat')
    const thinBlooded = wrapper.findAll('.expandable-option-card').find((card) => card.text().includes('薄血'))!
    await thinBlooded.get('.expandable-option-card__main').trigger('click')
    await vi.advanceTimersByTimeAsync(260)
    vi.useRealTimers()
    expect(wrapper.emitted('backgroundFeat')?.[0]).toEqual(['background-2024-tp-vtm-ritualist-origin-feat', ['feat-2024-tp-thin-blooded']])
  })
})

describe('OriginStep 去完成聚焦出口（v1.9.1 R3-6）', () => {
  // 聚焦断言需要元素真实连到文档（happy-dom 下未挂载的元素 focus() 不更新 activeElement）
  const mountAttached = (patch: Record<string, unknown> = {}) =>
    mount(OriginStep, {
      props: { languages: [], raceSkillChoices: [], backgroundToolIds: [], ...patch },
      attachTo: document.body,
    })
  const handleOf = (wrapper: ReturnType<typeof mountAttached>) =>
    wrapper.vm as unknown as SelectionTaskFocusHandle

  afterEach(() => { document.body.innerHTML = '' })

  it('切到首个未完成任务并聚焦该任务标题', async () => {
    const wrapper = mountAttached({ classId: 'class-2014-fighter' })
    await openTask(wrapper, 'background')
    expect(wrapper.get('[data-task-id="background"]').attributes('aria-selected')).toBe('true')

    await handleOf(wrapper).focusFirstIncomplete()

    expect(wrapper.get('[data-task-id="race"]').attributes('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(wrapper.get('.origin-step__panel h2').element)
  })

  it('活动任务未变化时重复调用仍有聚焦反馈（R3-7）', async () => {
    const wrapper = mountAttached({ classId: 'class-2014-fighter' })
    await handleOf(wrapper).focusFirstIncomplete()
    const heading = wrapper.get('.origin-step__panel h2').element
    expect(document.activeElement).toBe(heading)

    ;(document.activeElement as HTMLElement | null)?.blur()
    expect(document.activeElement).not.toBe(heading)

    await handleOf(wrapper).focusFirstIncomplete()
    expect(document.activeElement).toBe(heading)
  })
})

describe('OriginStep 候选保留已选项（v1.9.1 追加）', () => {
  const titleOf = (card: { find: (selector: string) => { text: () => string } }) =>
    card.find('.expandable-option-card__title-line strong').text()
  const badgeOf = (card: { find: (selector: string) => { text: () => string } }) =>
    card.find('.expandable-option-card__badges').text()
  const candidateCard = (wrapper: ReturnType<typeof mountOrigin>, name: string) =>
    wrapper.findAll('.list-shell').at(-1)!.findAll('.expandable-option-card').find((card) => titleOf(card) === name)

  it('已选种族留在候选目录并显示已选，顶部摘要保留', async () => {
    const human = rulesRepository.getRace('race-2014-human')!.name
    const wrapper = mountOrigin({ classId: 'class-2014-fighter', raceId: 'race-2014-human' })
    await openTask(wrapper, 'race')

    const card = candidateCard(wrapper, human)
    expect(card, '已选种族应留在候选目录中').toBeTruthy()
    expect(badgeOf(card!)).toContain('已选')
    expect(wrapper.text()).toContain(`已选择：${human}`)
  })

  it('已选背景留在候选目录并显示已选，顶部摘要保留', async () => {
    const soldier = rulesRepository.getBackground('background-2014-soldier')!.name
    const wrapper = mountOrigin({ classId: 'class-2014-fighter', backgroundId: 'background-2014-soldier' })
    await openTask(wrapper, 'background')

    const card = candidateCard(wrapper, soldier)
    expect(card, '已选背景应留在候选目录中').toBeTruthy()
    expect(badgeOf(card!)).toContain('已选')
    expect(wrapper.text()).toContain(`已选择：${soldier}`)
  })

  it('点击已选种族不发出选择事件（必选项保持选中）', async () => {
    vi.useFakeTimers()
    const human = rulesRepository.getRace('race-2014-human')!.name
    const wrapper = mountOrigin({ classId: 'class-2014-fighter', raceId: 'race-2014-human' })
    await openTask(wrapper, 'race')
    const card = candidateCard(wrapper, human)!

    await card.get('.expandable-option-card__main').trigger('click')
    await vi.advanceTimersByTimeAsync(260)
    vi.useRealTimers()

    expect(wrapper.emitted('race')).toBeUndefined()
  })

  it('子种族与背景变体带已选徽标，且再点仍可取消', async () => {
    vi.useFakeTimers()
    const dwarf = rulesRepository.getRace('race-2014-dwarf')!
    const mountain = rulesRepository.getRace('race-2014-dwarf-mountain')!
    const subraceWrapper = mountOrigin({ raceId: dwarf.id, subraceId: mountain.id })
    await openTask(subraceWrapper, 'subrace')
    const subraceCard = candidateCard(subraceWrapper, mountain.name)!
    expect(badgeOf(subraceCard)).toContain('已选')
    await subraceCard.get('.expandable-option-card__main').trigger('click')
    await vi.advanceTimersByTimeAsync(260)
    expect(subraceWrapper.emitted('subrace')?.[0]).toEqual([undefined])

    const variant = rulesRepository.backgrounds.find((item) => item.parentBackgroundId === 'background-2014-sailor')!
    const variantWrapper = mountOrigin({
      raceId: 'race-2014-human',
      backgroundId: 'background-2014-sailor',
      backgroundVariantId: variant.id,
    })
    await openTask(variantWrapper, 'background-variant')
    const variantCard = candidateCard(variantWrapper, variant.name)!
    expect(badgeOf(variantCard)).toContain('已选')
    vi.useRealTimers()
  })
})
