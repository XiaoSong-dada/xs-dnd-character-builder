import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import UpdateNoticeModal from '@/features/update-notice/components/UpdateNoticeModal.vue'
import { UPDATE_NOTICE_STORAGE_KEY } from '@/services/update-notice-storage'
import { useUpdateNoticeStore } from '@/stores/update-notice'

describe('UpdateNoticeModal', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    localStorage.clear()
    setActivePinia(createPinia())
  })
  afterEach(() => { document.body.innerHTML = '' })

  it('展示当前版本内容，确认后关闭并标记已读', async () => {
    const store = useUpdateNoticeStore()
    const wrapper = mount(UpdateNoticeModal, { attachTo: document.body })
    store.openManual()
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(document.body.textContent).toContain('已更新至 v1.1.4')
    expect(document.body.textContent).toContain('迷踪步')
    const confirm = Array.from(document.body.querySelectorAll('button')).find((button) => button.textContent?.trim() === '我知道了')!
    expect(document.activeElement).toBe(confirm)
    confirm.click()
    await wrapper.vm.$nextTick()
    expect(store.isOpen).toBe(false)
    expect(localStorage.getItem(UPDATE_NOTICE_STORAGE_KEY)).toContain('1.1.4')
    wrapper.unmount()
  })

  it('Escape 与遮罩关闭均视为已读', async () => {
    const store = useUpdateNoticeStore()
    const wrapper = mount(UpdateNoticeModal, { attachTo: document.body })
    store.openManual()
    await wrapper.vm.$nextTick()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(store.isOpen).toBe(false)

    store.openManual()
    await wrapper.vm.$nextTick()
    ;(document.body.querySelector('.ui-scroll-modal') as HTMLElement).click()
    await wrapper.vm.$nextTick()
    expect(store.isOpen).toBe(false)
    wrapper.unmount()
  })
})
