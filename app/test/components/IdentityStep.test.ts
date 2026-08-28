import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import IdentityStep from '@/views/character-builder/components/IdentityStep.vue'
import type { CharacterDraft } from '@/types/character'

const alignments = [
  '守序善良',
  '中立善良',
  '混乱善良',
  '守序中立',
  '绝对中立',
  '混乱中立',
  '守序邪恶',
  '中立邪恶',
  '混乱邪恶',
]

describe('IdentityStep', () => {
  it('提供伦理轴与道德轴组成的全部九种阵营', () => {
    const wrapper = mount(IdentityStep, {
      props: { name: '', alignment: '', notes: '' },
    })

    expect(wrapper.findAll('select option').map((option) => option.text())).toEqual([
      '请选择',
      ...alignments,
    ])
  })

  it('选择阵营时保留姓名和人物细节', async () => {
    const wrapper = mount(IdentityStep, {
      props: { name: '凯恩', alignment: '', notes: '前士兵' },
    })

    await wrapper.get('select').setValue('守序邪恶')

    expect(wrapper.emitted('change')?.[0]?.[0]).toEqual({
      name: '凯恩',
      alignment: '守序邪恶',
      notes: '前士兵',
    })
  })

  it('传入角色草稿时显示角色形象编辑区并转发媒体变更', async () => {
    const media = { avatar: { mediaId: 'avatar-1', mimeType: 'image/webp' as const, width: 512, height: 512 } }
    const wrapper = mount(IdentityStep, {
      props: { name: '凯恩', alignment: '', notes: '', draft: { name: '凯恩' } as CharacterDraft },
      global: { stubs: { CharacterMediaEditor: { emits: ['change'], template: '<button class="media-stub" @click="$emit(\'change\', media)">媒体</button>', data: () => ({ media }) } } },
    })
    await wrapper.get('.media-stub').trigger('click')
    expect(wrapper.emitted('changeMedia')?.[0]?.[0]).toEqual(media)
  })
})
