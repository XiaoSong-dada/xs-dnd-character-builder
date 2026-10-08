import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { describe, expect, it } from 'vitest'
import OriginStep from '@/views/character-builder/components/OriginStep.vue'
import LineageTransformationModal from '@/views/character-builder/components/LineageTransformationModal.vue'
import { useLineageTransformation } from '@/views/character-builder/hooks/useLineageTransformation'
import { getSpeciesProficiencyBlockers } from '@/rules/origins'
import { rulesRepository } from '@/rules/repository'
import { officialDraft } from '../fixtures/official-expansions-2014'

describe('S03—S07页面任务及转化确认', () => {
  it('自动侏儒两项具体工具任务、错误与修复', async () => {
    const draft = { ...officialDraft('race-2014-autognome'), raceToolChoices: [] }
    const wrapper = mount(OriginStep, { props: { ...draft, languages: [], blockers: getSpeciesProficiencyBlockers(draft, rulesRepository) } })
    await wrapper.get('[data-task-id="race-proficiencies"]').trigger('click')
    expect(wrapper.text()).toContain('选择2项')
    const button = wrapper.findAll('button').find((item) => item.text().includes('炼金'))
    if (!button) throw new Error('缺少具体工具')
    await button.trigger('click')
    expect(wrapper.emitted('raceTools')?.[0]?.[0]).toHaveLength(1)
    await wrapper.setProps({ raceToolChoices: ['alchemists-supplies', 'brewers-supplies'], blockers: [] })
    expect(wrapper.get('[data-task-id="race-proficiencies"]').text()).toContain('2')
    wrapper.unmount()
  })
  it('中文鼯猴人与英文搜索指向同一条目', async () => {
    const wrapper = mount(OriginStep, { props: { ...officialDraft('race-2014-hadozee'), languages: [] } })
    await wrapper.get('[data-task-id="race"]').trigger('click')
    for (const term of ['鼯猴人', 'Hadozee']) {
      await wrapper.get('input[aria-label="搜索种族"]').setValue(term)
      expect(wrapper.findAll('.expandable-option-card__title-line strong').map((item) => item.text()).filter((name) => !name.startsWith('已选择：'))).toEqual(['鼯猴人'])
    }
    wrapper.unmount()
  })
  it('预览与取消不写草稿，确认才应用，重复确认不产生记录', async () => {
    const draft = ref(officialDraft('race-2014-owlin'))
    const flow = useLineageTransformation(draft, (patch) => { draft.value = { ...draft.value, ...patch } })
    const original = JSON.stringify(draft.value)
    flow.start()
    flow.target.value = 'race-2014-reborn'
    flow.toggle('movement:race-2014-owlin:fly')
    const wrapper = mount(LineageTransformationModal, { props: { open: true, target: flow.target.value, targets: flow.targets.value, retained: flow.retained.value, candidates: flow.candidates.value, preview: flow.result.value.preview, error: '' } })
    expect(document.body.textContent).toContain('数值变化')
    expect(document.body.textContent).toContain('原种族收益失效')
    flow.close()
    expect(JSON.stringify(draft.value)).toBe(original)
    flow.start(); flow.target.value = 'race-2014-reborn'; flow.confirm()
    expect(draft.value.raceId).toBe('race-2014-reborn')
    expect(draft.value.lineageHistory).toHaveLength(1)
    flow.confirm()
    expect(draft.value.lineageHistory).toHaveLength(1)
    wrapper.unmount()
  })
})
