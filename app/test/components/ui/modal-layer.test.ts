import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'

import UiModal from '@/components/ui/UiModal.vue'
import UiScrollModal from '@/components/ui/UiScrollModal.vue'

/**
 * 弹窗层级（需求 §3.2／决策 D37）。
 *
 * 回归背景：`UiModal` 原先固定 `z-index: 100`，层叠顺序退化为 DOM 挂载顺序——
 * 常驻挂载的页面级确认弹窗会被之后才挂载的「调整等级」弹窗盖住，用户点不到「确认调整」。
 * 现在改为按打开顺序领取自增层级。
 */
function modalZIndex(title: string): number {
  const modal = Array.from(document.body.querySelectorAll('.ui-modal, .ui-scroll-modal'))
    .find((node) => node.querySelector('h2')?.textContent === title)
  if (!modal) throw new Error(`未找到弹窗：${title}`)
  return Number((modal as HTMLElement).style.zIndex)
}

describe('modal-layer 弹窗层级', () => {
  // 弹窗 Teleport 到 body，逐个用例清理，避免上一用例的节点干扰断言。
  afterEach(() => { document.body.innerHTML = '' })

  it('常驻挂载的弹窗先开、后挂载的弹窗后开：后者层级更大（覆盖原缺陷）', async () => {
    const alwaysOpen = ref(false)
    const laterOpen = ref(false)
    const Always = defineComponent({
      components: { UiModal },
      setup: () => ({ alwaysOpen }),
      template: '<UiModal :open="alwaysOpen" title="常驻确认">A</UiModal>',
    })
    const Later = defineComponent({
      components: { UiModal },
      setup: () => ({ laterOpen }),
      template: '<UiModal :open="laterOpen" title="后开等级">B</UiModal>',
    })

    mount(Always)
    await nextTick()
    alwaysOpen.value = true
    await nextTick()
    mount(Later)
    await nextTick()
    laterOpen.value = true
    await nextTick()

    expect(modalZIndex('后开等级')).toBeGreaterThan(modalZIndex('常驻确认'))
  })

  it('关闭后重新打开会领取更大的层级', async () => {
    const open = ref(false)
    const Host = defineComponent({
      components: { UiModal },
      setup: () => ({ open }),
      template: '<UiModal :open="open" title="重开">A</UiModal>',
    })
    mount(Host)
    await nextTick()
    open.value = true
    await nextTick()
    const first = modalZIndex('重开')

    open.value = false
    await nextTick()
    open.value = true
    await nextTick()

    expect(modalZIndex('重开')).toBeGreaterThan(first)
  })

  it('UiScrollModal 与 UiModal 共用同一套层级', async () => {
    const scrollOpen = ref(false)
    const plainOpen = ref(false)
    const Host = defineComponent({
      components: { UiModal, UiScrollModal },
      setup: () => ({ scrollOpen, plainOpen }),
      template: `
        <UiScrollModal :open="scrollOpen" title="滚动弹窗">A</UiScrollModal>
        <UiModal :open="plainOpen" title="普通弹窗">B</UiModal>
      `,
    })
    mount(Host)
    await nextTick()
    scrollOpen.value = true
    await nextTick()
    plainOpen.value = true
    await nextTick()

    expect(modalZIndex('普通弹窗')).toBeGreaterThan(modalZIndex('滚动弹窗'))
  })

  it('未打开的弹窗不分配层级', async () => {
    const open = ref(false)
    const Host = defineComponent({
      components: { UiModal },
      setup: () => ({ open }),
      template: '<UiModal :open="open" title="未开">A</UiModal>',
    })
    mount(Host)
    await nextTick()

    expect(document.body.querySelector('.ui-modal')).toBeNull()
  })
})
