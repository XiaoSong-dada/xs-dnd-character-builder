import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'

import AddManualSpellModal from '@/views/character-builder/components/AddManualSpellModal.vue'

afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
  document.body.innerHTML = ''
})

describe('AddManualSpellModal', () => {
  it('固定搜索控制区和页脚，仅让法术结果区滚动', () => {
    const wrapper = mount(AddManualSpellModal, {
      props: { open: true, mode: 'spellbook', existingIds: [] },
      attachTo: document.body,
    })

    const modalBody = document.body.querySelector('.ui-scroll-modal__body')
    const controls = document.body.querySelector('.manual-spell-modal__controls')
    const results = document.body.querySelector('.manual-spell-modal__result-area')
    expect(modalBody?.classList.contains('ui-scroll-modal__body--contained')).toBe(true)
    expect(controls?.querySelector('[aria-label="搜索系统法术"]')).not.toBeNull()
    expect(controls?.querySelector('[aria-label="法术加入方式"]')).not.toBeNull()
    expect(controls?.querySelector('input[type="checkbox"]')).not.toBeNull()
    expect(results?.querySelector('.expandable-option-card')).not.toBeNull()
    expect(results?.querySelector('[aria-label="搜索系统法术"]')).toBeNull()

    wrapper.unmount()
  })

  it('页脚复用 BaseButton，并保持选择后提交行为', async () => {
    vi.useFakeTimers()
    const wrapper = mount(AddManualSpellModal, {
      props: { open: true, mode: 'spellbook', existingIds: [] },
      attachTo: document.body,
    })

    const cancel = Array.from(document.body.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent?.trim() === '取消')
    const submit = Array.from(document.body.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent?.trim() === '添加法术')
    expect(cancel?.classList.contains('base-button--secondary')).toBe(true)
    expect(submit?.classList.contains('base-button--primary')).toBe(true)
    expect(submit?.disabled).toBe(true)

    document.body.querySelector<HTMLButtonElement>('.expandable-option-card__main')?.click()
    await vi.advanceTimersByTimeAsync(300)
    expect(submit?.disabled).toBe(false)
    submit?.click()
    expect(wrapper.emitted('add')).toHaveLength(1)
    expect(wrapper.emitted('close')).toHaveLength(1)

    wrapper.unmount()
  })
})
