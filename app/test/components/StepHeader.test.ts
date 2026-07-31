import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import StepHeader from '@/features/quick-build/components/StepHeader.vue'

describe('StepHeader', () => {
  it('显示返回入口和自动保存状态并发出返回事件', async () => {
    const wrapper = mount(StepHeader, {
      props: {
        eyebrow: '第5步',
        title: '分配六项属性',
        current: 5,
        total: 11,
        backLabel: '返回车卡首页',
        autoSaveLabel: '进度已自动保存',
      },
    })

    const backButton = wrapper.get('button')
    expect(backButton.text()).toContain('返回车卡首页')
    expect(wrapper.text()).toContain('进度已自动保存')

    await backButton.trigger('click')

    expect(wrapper.emitted('back')).toHaveLength(1)
  })

  it('未配置返回入口时不渲染工具行', () => {
    const wrapper = mount(StepHeader, {
      props: {
        eyebrow: '第1步',
        title: '先确定冒险规模',
        current: 1,
        total: 11,
      },
    })

    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.find('.step-header__tools').exists()).toBe(false)
  })
})
