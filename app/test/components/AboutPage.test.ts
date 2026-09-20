import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'

const mockConfig = vi.hoisted(() => ({
  baseUrl: '/',
  siteConfig: {
    version: '1.1.4',
    tipQrCodes: {
      wechatUrl: undefined as string | undefined,
      alipayUrl: undefined as string | undefined,
    },
  },
}))

/** 构建标识做成可变对象，便于分别覆盖「干净构建」与「含未提交改动」两种展示。 */
const mockSetting = vi.hoisted(() => ({
  isDev: false,
  appBuildId: 'c0ffee1-dirty-9f8e7d6a',
  appBuildIdDirty: true,
  APP_BUILD_ID_DIRTY_MARKER: '-dirty-',
}))

const mockBuildIdService = vi.hoisted(() => ({ checkRemoteBuildId: vi.fn() }))

vi.mock('@/config/site', () => mockConfig)
vi.mock('@/config/setting', () => mockSetting)
vi.mock('@/services/app-build-id', () => ({ checkRemoteBuildId: mockBuildIdService.checkRemoteBuildId }))

import AboutPage from '@/views/about/index.vue'
import {
  UPDATE_CHECK_PREFERENCE_STORAGE_KEY,
  UpdateCheckPreferenceService,
} from '@/services/update-check-preference'

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
    mockSetting.appBuildId = 'c0ffee1-dirty-9f8e7d6a'
    mockSetting.appBuildIdDirty = true
    mockBuildIdService.checkRemoteBuildId.mockReset().mockResolvedValue('up-to-date')
    setClipboard(vi.fn().mockResolvedValue(undefined))
    // 周期设置与上次检查时间都落在 localStorage，用例之间必须互不串味。
    localStorage.clear()
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

  it('展示离线使用区块与三项导出资源，默认全部标记为未下载', async () => {
    const wrapper = mountAbout()
    await Promise.resolve()

    expect(wrapper.text()).toContain('离线使用')
    expect(wrapper.findAll('.offline-assets__item')).toHaveLength(3)
    expect(wrapper.text()).toContain('PDF 角色卡模板')
    expect(wrapper.text()).toContain('Excel 角色卡模板')
    expect(wrapper.text()).toContain('中文字体子集')
    expect(wrapper.findAll('.ui-badge').filter((badge) => badge.text() === '未下载')).toHaveLength(3)
    expect(wrapper.get('.offline-assets__action').text()).toBe('一键下载离线资源')
    expect(wrapper.text()).toContain('本地数据保护')
  })

  it('环境不支持离线缓存时，点击下载给出可执行的说明而不是静默失败', async () => {
    vi.stubGlobal('caches', undefined)
    const wrapper = mountAbout()
    await Promise.resolve()

    await wrapper.get('.offline-assets__action').trigger('click')
    await vi.waitFor(() => {
      expect(wrapper.get('.offline-assets__feedback').text()).toContain('需要通过 HTTPS 访问')
    })
    // 失败后按钮必须恢复可点，否则玩家无法重试。
    expect(wrapper.get('.offline-assets__action').attributes('disabled')).toBeUndefined()
    vi.unstubAllGlobals()
  })

  it('展示构建标识与手动检查入口，并标出含未提交改动的构建', () => {
    const wrapper = mountAbout()

    expect(wrapper.text()).toContain('构建标识')
    // 界面只展示 commit 短 hash，脏标记用文案单独说明。
    expect(wrapper.get('.about-intro__build code').text()).toBe('c0ffee1')
    expect(wrapper.text()).toContain('含未提交改动')
    expect(wrapper.get('.about-intro__build button').text()).toBe('检查更新')
    // 还没查过时不显示任何结论文案。
    expect(wrapper.find('.about-intro__feedback').exists()).toBe(false)
  })

  it('提交产物构建不显示未提交改动标记', () => {
    mockSetting.appBuildId = 'abc1234'
    mockSetting.appBuildIdDirty = false
    const wrapper = mountAbout()

    expect(wrapper.get('.about-intro__build code').text()).toBe('abc1234')
    expect(wrapper.text()).not.toContain('含未提交改动')
  })

  it('手动检查更新后展示可执行的结论，且按钮回到可点状态', async () => {
    mockBuildIdService.checkRemoteBuildId.mockResolvedValue('update-available')
    const wrapper = mountAbout()

    await wrapper.get('.about-intro__build button').trigger('click')

    await vi.waitFor(() => {
      expect(wrapper.get('.about-intro__feedback').text()).toContain('发现新构建')
    })
    expect(wrapper.get('.about-intro__build button').attributes('disabled')).toBeUndefined()
  })

  it('离线时手动检查给出可理解的说明，而不是静默失败', async () => {
    mockBuildIdService.checkRemoteBuildId.mockResolvedValue('unavailable')
    const wrapper = mountAbout()

    await wrapper.get('.about-intro__build button').trigger('click')

    await vi.waitFor(() => {
      expect(wrapper.get('.about-intro__feedback').text()).toContain('暂时无法检查')
    })
  })

  it('展示自动检查更新周期设置与上次检查说明，默认 7 天', () => {
    const wrapper = mountAbout()

    expect(wrapper.text()).toContain('自动检查更新')
    const input = wrapper.get('#about-update-interval')
    expect(input.attributes('type')).toBe('number')
    expect(input.attributes('min')).toBe('1')
    expect(input.attributes('max')).toBe('365')
    expect((input.element as HTMLInputElement).value).toBe('7')
    expect(wrapper.get('.about-intro__interval-hint').text()).toContain('还没有成功检查过')
    expect(wrapper.find('.about-intro__interval-error').exists()).toBe(false)
  })

  it('修改周期后写入本机，下次打开按新周期运行', async () => {
    const wrapper = mountAbout()

    await wrapper.get('#about-update-interval').setValue('30')
    await wrapper.get('#about-update-interval').trigger('change')

    expect(UpdateCheckPreferenceService.loadIntervalDays()).toBe(30)
    expect(localStorage.getItem(UPDATE_CHECK_PREFERENCE_STORAGE_KEY)).toContain('30')
    expect(wrapper.find('.about-intro__interval-error').exists()).toBe(false)
  })

  it('周期超出范围时说明原因，不静默改回也不写入本机', async () => {
    const wrapper = mountAbout()

    await wrapper.get('#about-update-interval').setValue('999')
    await wrapper.get('#about-update-interval').trigger('change')

    expect(wrapper.get('.about-intro__interval-error').text()).toContain('1—365')
    expect(UpdateCheckPreferenceService.loadIntervalDays()).toBe(7)
    expect(localStorage.getItem(UPDATE_CHECK_PREFERENCE_STORAGE_KEY)).toBeNull()
  })

  it('手动检查后说明里能看到刚检查过', async () => {
    const wrapper = mountAbout()

    await wrapper.get('.about-intro__build button').trigger('click')

    await vi.waitFor(() => {
      expect(wrapper.get('.about-intro__interval-hint').text()).toContain('今天')
    })
  })
})
