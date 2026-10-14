import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'

/**
 * 弹窗层级（需求 §3.2，决策 D37）。
 *
 * `UiModal`／`UiScrollModal` 都 Teleport 到 `body` 并使用同一 z-index，
 * 层叠顺序会退化成「DOM 挂载顺序」——常驻挂载的弹窗（如页面级依赖影响确认弹窗）
 * 会被之后才挂载的弹窗（如角色卡「调整等级」弹窗）盖住，用户点不到确认按钮。
 *
 * 这里改为**显式层级**：弹窗在每次「打开」时领取一个自增层级，
 * 后打开者必在上层，与挂载顺序无关。
 */
const BASE_Z_INDEX = 100

let nextLayer = 0

export function useModalLayer(open: Readonly<Ref<boolean>>): ComputedRef<{ zIndex: number }> {
  const layer = ref(0)
  watch(open, (value) => {
    if (!value) return
    nextLayer += 1
    layer.value = nextLayer
  }, { immediate: true })
  return computed(() => ({ zIndex: BASE_Z_INDEX + layer.value }))
}
