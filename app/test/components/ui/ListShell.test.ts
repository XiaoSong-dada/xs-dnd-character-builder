import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ListShell from '@/components/ui/ListShell.vue'

describe('ListShell', () => {
  const mountShell = (options: Parameters<typeof mount>[1] = {}) =>
    mount(ListShell, {
      props: { query: '', filter: 'all' },
      slots: { default: '<div class="entry">条目</div>' },
      ...options,
    })

  it('默认渲染条目网格与插槽内容，无头部/搜索/筛选', () => {
    const wrapper = mountShell()
    expect(wrapper.find('.list-shell__grid').exists()).toBe(true)
    expect(wrapper.find('.list-shell__grid .entry').exists()).toBe(true)
    expect(wrapper.find('.list-shell__header').exists()).toBe(false)
    expect(wrapper.find('.list-shell__search').exists()).toBe(false)
    expect(wrapper.find('.list-shell__filters').exists()).toBe(false)
  })

  it('title 与计数徽章渲染', () => {
    const wrapper = mountShell({ props: { query: '', filter: 'all', title: '专长列表', count: '3/5', countLabel: '已选 ' } })
    expect(wrapper.find('.list-shell__title').text()).toBe('专长列表')
    expect(wrapper.find('.list-shell__count').text()).toBe('已选 3/5')
  })

  it('搜索框显示与 v-model:query 双向绑定', async () => {
    const wrapper = mountShell({ props: { query: '', filter: 'all', searchable: true, searchPlaceholder: '输入名称' } })
    const input = wrapper.find('.list-shell__search input')
    expect(input.exists()).toBe(true)
    expect(input.attributes('placeholder')).toBe('输入名称')
    await input.setValue('长剑')
    expect(wrapper.emitted('update:query')![0]).toEqual(['长剑'])
  })

  it('筛选 chips 渲染、选中态与 v-model:filter 更新', async () => {
    const wrapper = mountShell({
      props: {
        query: '',
        filter: 'combat',
        filters: [
          { id: 'all', label: '全部' },
          { id: 'combat', label: '战斗' },
        ],
      },
    })
    const chips = wrapper.findAll('.list-shell__filters .ui-chip')
    expect(chips).toHaveLength(2)
    expect(chips[1]?.attributes('aria-pressed')).toBe('true')
    await chips[0]!.trigger('click')
    expect(wrapper.emitted('update:filter')![0]).toEqual(['all'])
  })

  it('空状态：empty 时显示 emptyText，支持 empty 插槽自定义', () => {
    const wrapper = mountShell({ props: { query: '', filter: 'all', empty: true, emptyText: '没有匹配' } })
    expect(wrapper.find('.list-shell__empty').text()).toBe('没有匹配')

    const custom = mountShell({
      props: { query: '', filter: 'all', empty: true },
      slots: { default: '<div class="entry">条目</div>', empty: '<button class="clear-filter">清除筛选</button>' },
    })
    expect(custom.find('.list-shell__empty .clear-filter').exists()).toBe(true)
  })

  it('maxHeight 提供外层滚动容器，内层 grid 保持独立', () => {
    const wrapper = mountShell({ props: { query: '', filter: 'all', maxHeight: '15rem' } })
    const scroll = wrapper.find('.list-shell__scroll')
    expect(scroll.exists()).toBe(true)
    expect(scroll.attributes('style')).toContain('max-height: 15rem')
    // 滚动容器在外层，内层 grid 是独立子节点（结构断言；视觉行为由无头 Chrome 回归覆盖）
    expect(scroll.find('.list-shell__grid .entry').exists()).toBe(true)
    expect(scroll.find('.list-shell__scroll .list-shell__scroll').exists()).toBe(false)
  })

  it('grid=false 时跳过网格容器，直接渲染插槽', () => {
    const wrapper = mountShell({ props: { query: '', filter: 'all', grid: false } })
    expect(wrapper.find('.list-shell__grid').exists()).toBe(false)
    expect(wrapper.find('.entry').exists()).toBe(true)
  })

  it('header 插槽可自定义头部', () => {
    const wrapper = mountShell({
      props: { query: '', filter: 'all', title: '默认标题' },
      slots: { default: '<div class="entry">条目</div>', header: '<div class="custom-header">自定义</div>' },
    })
    expect(wrapper.find('.list-shell__header .custom-header').exists()).toBe(true)
    expect(wrapper.find('.list-shell__title').exists()).toBe(false)
  })
})
