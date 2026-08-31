import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'

const mockConfig = vi.hoisted(() => ({
  siteConfig: {
    version: '1.1.4',
    tipQrCodes: {
      wechatUrl: undefined as string | undefined,
      alipayUrl: undefined as string | undefined,
    },
  },
}))

vi.mock('@/config/site', () => mockConfig)

import AboutPage from '@/views/about/index.vue'

function mountAbout(options: Parameters<typeof mount>[1] = {}) {
  return mount(AboutPage, {
    ...options,
    global: {
      ...options?.global,
      plugins: [createPinia(), ...(options?.global?.plugins ?? [])],
    },
  })
}

function setClipboard(writeText: (value: string) => Promise<void>): void {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  })
}

describe('关于本站页面', () => {
  beforeEach(() => {
    mockConfig.siteConfig.tipQrCodes.wechatUrl = undefined
    mockConfig.siteConfig.tipQrCodes.alipayUrl = undefined
    setClipboard(vi.fn().mockResolvedValue(undefined))
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('展示项目、永久免费声明与三个公开入口，不展示已移除内容', () => {
    const wrapper = mountAbout()

    expect(wrapper.get('h1').text()).toBe('关于本站')
    expect(wrapper.text()).toContain('一个面向 D&D 5e 2014 玩家、尤其是新手的免费车卡与跑团辅助工具')
    expect(wrapper.text()).toContain('本站永久免费')
    expect(wrapper.text()).toContain('B站个人空间')
    expect(wrapper.text()).toContain('GitHub 项目')
    expect(wrapper.text()).toContain('群号 831306509')
    expect(wrapper.text()).toContain('当前版本 v1.1.4')
    expect(wrapper.text()).toContain('查看本次更新')
    expect(wrapper.text()).not.toContain('小宋哒哒')
    expect(wrapper.text()).not.toContain('赞助鸣谢')
    expect(wrapper.text()).not.toContain('友情链接')

    const links = wrapper.findAll('a')
    expect(links.map((link) => link.attributes('href'))).toEqual([
      'https://space.bilibili.com/122674342',
      'https://github.com/XiaoSong-dada/xs-dnd-character-builder',
    ])
    for (const link of links) {
      expect(link.attributes('target')).toBe('_blank')
      expect(link.attributes('rel')).toBe('noopener noreferrer')
    }
    expect(wrapper.find('.tip-qr').exists()).toBe(false)
  })

  it('复制 QQ 群号成功时展示可见反馈', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    setClipboard(writeText)
    const wrapper = mountAbout()

    await wrapper.get('.about-links__card--qq button').trigger('click')
    await Promise.resolve()

    expect(writeText).toHaveBeenCalledWith('831306509')
    expect(wrapper.get('[role="status"]').text()).toContain('已复制')
  })

  it('剪贴板不可用时提示手动复制', async () => {
    setClipboard(vi.fn().mockRejectedValue(new Error('denied')))
    const wrapper = mountAbout()

    await wrapper.get('.about-links__card--qq button').trigger('click')
    await Promise.resolve()

    expect(wrapper.get('[role="status"]').text()).toBe('复制失败，请手动复制QQ群号：831306509')
  })

  it('双收款码直接展示，点击后打开并关闭大图弹窗', async () => {
    mockConfig.siteConfig.tipQrCodes.wechatUrl = '/tips/wechat.jpg'
    mockConfig.siteConfig.tipQrCodes.alipayUrl = '/tips/alipay.jpg'
    const wrapper = mountAbout({ attachTo: document.body })

    expect(wrapper.findAll('.tip-qr__card')).toHaveLength(2)
    await wrapper.findAll('.tip-qr__card')[0]!.trigger('click')
    expect(document.body.textContent).toContain('微信支付收款码')
    expect(document.body.querySelector('.tip-qr__preview')).not.toBeNull()

    ;(document.body.querySelector('button[aria-label="关闭"]') as HTMLButtonElement).click()
    await wrapper.vm.$nextTick()
    expect(document.body.querySelector('.tip-qr__preview')).toBeNull()
    wrapper.unmount()
  })

  it('单项配置只显示对应收款码，图片失败后隐藏整个打赏区', async () => {
    mockConfig.siteConfig.tipQrCodes.wechatUrl = '/tips/wechat.jpg'
    const wrapper = mountAbout()

    expect(wrapper.findAll('.tip-qr__card')).toHaveLength(1)
    expect(wrapper.text()).toContain('微信支付')
    expect(wrapper.text()).not.toContain('支付宝')

    await wrapper.get('.tip-qr__card img').trigger('error')
    expect(wrapper.find('.tip-qr').exists()).toBe(false)
  })
})
