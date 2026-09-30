import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import AddManualFeatModal from '@/views/character-builder/components/AddManualFeatModal.vue'
import type { CharacterDraft } from '@/types/character'
import { draft2024 } from '../fixtures/draft-2024'

function buttonByText(text: string): HTMLButtonElement | undefined {
  return Array.from(document.body.querySelectorAll<HTMLButtonElement>('button'))
    .find((button) => button.textContent?.trim() === text)
}

async function search(value: string): Promise<void> {
  const input = document.body.querySelector<HTMLInputElement>('input[aria-label="搜索专长"]')
  if (!input) throw new Error('未找到专长搜索框')
  input.value = value
  input.dispatchEvent(new Event('input'))
  await vi.advanceTimersByTimeAsync(0)
}

async function selectFirstCard(): Promise<void> {
  const button = document.body.querySelector<HTMLButtonElement>('.expandable-option-card__main')
  if (!button) throw new Error('未找到专长候选')
  button.click()
  await vi.advanceTimersByTimeAsync(300)
}

describe('AddManualFeatModal', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('只展示当前规则版本候选，并允许忽略前置条件手动添加', async () => {
    const draft: CharacterDraft = { ...draft2024({ targetLevel: 1 }), enabledSourceIds: [] }
    const wrapper = mount(AddManualFeatModal, { props: { open: true, draft }, attachTo: document.body })

    expect(document.body.textContent).toContain('2024 规则')
    await search('Boon of Combat Prowess')
    const warnedCard = Array.from(document.body.querySelectorAll<HTMLElement>('.expandable-option-card'))
      .find((card) => card.textContent?.includes('前置不满足'))
    expect(warnedCard).toBeDefined()

    warnedCard!.querySelector<HTMLButtonElement>('.expandable-option-card__main')!.click()
    await vi.advanceTimersByTimeAsync(300)
    expect(buttonByText('添加并配置')?.disabled).toBe(false)
    buttonByText('添加并配置')!.click()
    expect(wrapper.emitted('add')).toHaveLength(1)
    expect(String(wrapper.emitted('add')?.[0]?.[0])).toMatch(/^feat-2024-/)
  })

  it('不可重复专长在已拥有时锁定，可重复专长仍可再次添加', async () => {
    const base = draft2024({ targetLevel: 4 })
    const draft: CharacterDraft = {
      ...base,
      manualEdits: {
        ...base.manualEdits,
        addedFeats: [
          { instanceId: 'manual-tough', featId: 'feat-2024-tough', addedAt: '2026-09-30T00:00:00.000Z' },
          { instanceId: 'manual-skilled', featId: 'feat-2024-skilled', addedAt: '2026-09-30T00:00:00.000Z' },
        ],
      },
    }
    const wrapper = mount(AddManualFeatModal, { props: { open: true, draft }, attachTo: document.body })

    await search('Tough')
    expect(document.body.textContent).toContain('该专长不可重复获得')
    expect(buttonByText('添加专长')?.disabled).toBe(true)

    await search('Skilled')
    expect(document.body.textContent).not.toContain('该专长不可重复获得')
    await selectFirstCard()
    expect(buttonByText('添加并配置')?.disabled).toBe(false)
    buttonByText('添加并配置')!.click()
    expect(wrapper.emitted('add')?.[0]).toEqual(['feat-2024-skilled'])
  })
})
