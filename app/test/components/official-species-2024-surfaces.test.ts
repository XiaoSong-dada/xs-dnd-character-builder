import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import OriginStep from '@/views/character-builder/components/OriginStep.vue'
import TimelineStep from '@/views/character-builder/components/TimelineStep.vue'
import { validateDraft } from '@/rules/validate'
import { officialSpeciesDraft } from '../fixtures/official-species-2024'
import { selection } from '../fixtures/draft-2024'

describe('S08—S10物种页面与必选任务', () => {
  it.each(['霜身', 'Rimekin'])('搜索%s显示已登记霜身', async (term) => {
    const wrapper = mount(OriginStep, { props: { ...officialSpeciesDraft('species-2024-lfl-rimekin'), languages: [] } })
    await wrapper.get('[data-task-id="race"]').trigger('click')
    await wrapper.get('input[aria-label="搜索种族"]').setValue(term)
    expect(wrapper.text()).toContain('霜身')
    expect(wrapper.text()).not.toContain('未找到')
    wrapper.unmount()
  })
  it('默认交友术可见且可更换为实际中文戏法，不显示裸ID', async () => {
    const draft = officialSpeciesDraft('species-2024-efa-khoravar')
    const wrapper = mount(TimelineStep, { props: { classId: draft.classId ?? '', targetLevel: draft.targetLevel, backgroundSkillIds: [], selections: draft.selections, draft } })
    const button = wrapper.findAll('button').find((item) => item.text().includes('当前戏法'))
    if (!button) throw new Error('Missing cantrip checkpoint')
    await button.trigger('click')
    expect(wrapper.text()).toContain('交友术')
    expect(wrapper.text()).toContain('长休')
    expect(wrapper.text()).not.toContain('spell-2024-friends')
    wrapper.unmount()
  })
  it('非法、重复和失效选择给出可修复提示，修复后清除', () => {
    const draft = officialSpeciesDraft('species-2024-rthw-reborn')
    const checkpoint = `${draft.raceId}-resistance`
    const invalid = { ...draft, selections: [selection(checkpoint, ['invalid'])] }
    expect(validateDraft(invalid).some((item) => item.id === `species-choice-invalid-${checkpoint}`)).toBe(true)
    expect(validateDraft(draft).some((item) => item.id === `species-choice-invalid-${checkpoint}`)).toBe(false)
    expect(validateDraft({ ...draft, selections: [...draft.selections, selection(checkpoint, [`${draft.raceId}-cold`])] }).some((item) => item.id === `species-choice-invalid-${checkpoint}`)).toBe(true)
  })
})
