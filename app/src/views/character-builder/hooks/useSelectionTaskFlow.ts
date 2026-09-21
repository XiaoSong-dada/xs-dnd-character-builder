import { computed, nextTick, ref, watch, type ComputedRef, type Ref } from 'vue'

import type { SelectionTask } from '@/views/character-builder/selection-task'

/** 管理步骤内任务的默认定位、自由跳转、完成后自动推进与标题聚焦。 */
export function useSelectionTaskFlow(
  tasks: ComputedRef<readonly SelectionTask[]>,
  /**
   * 任务标题元素（组件用本地 `ref="headingEl"` 声明后传入）。
   * 必须由调用方提供模板 ref：`ref="flow.heading"` 这类嵌套字符串 ref 只会写入 `$refs`，
   * 不会回填 hook 内的 ref，聚焦会静默失效（v1.9.1 修正）。
   */
  headingRef?: Ref<HTMLElement | undefined>,
) {
  const activeTaskId = ref('')
  const heading = headingRef ?? ref<HTMLElement | undefined>()

  const firstIncompleteTask = computed(() => tasks.value.find((task) => task.required && task.status !== 'complete'))
  const completedCount = computed(() => tasks.value.filter((task) => task.status === 'complete').length)
  const activeTask = computed(() => tasks.value.find((task) => task.id === activeTaskId.value) ?? tasks.value[0])

  function selectTask(id: string): void {
    if (!tasks.value.some((task) => task.id === id)) return
    activeTaskId.value = id
  }

  /**
   * 切换到首个未完成任务并聚焦任务标题（v1.9.1 R3-6）。
   * 显式聚焦保证重复点击「去完成」（任务 ID 未变化）也能把焦点与视图带回该任务（R3-7）；
   * 与 `activeTaskId` 的 watch 聚焦同一元素，因而重复聚焦是幂等的。
   */
  async function focusFirstIncomplete(): Promise<void> {
    const next = firstIncompleteTask.value ?? tasks.value[0]
    if (!next) return
    selectTask(next.id)
    await nextTick()
    heading.value?.focus()
  }

  watch(tasks, (next, previous) => {
    if (!next.length) {
      activeTaskId.value = ''
      return
    }
    const current = next.find((task) => task.id === activeTaskId.value)
    if (!current) {
      activeTaskId.value = next.find((task) => task.required && task.status !== 'complete')?.id ?? next[0]!.id
      return
    }
    const previousCurrent = previous?.find((task) => task.id === current.id)
    if (previousCurrent && previousCurrent.status !== 'complete' && current.status === 'complete') {
      const currentIndex = next.findIndex((task) => task.id === current.id)
      const following = [...next.slice(currentIndex + 1), ...next.slice(0, currentIndex)]
        .find((task) => task.required && task.status !== 'complete')
      if (following) activeTaskId.value = following.id
    }
  }, { immediate: true })

  watch(activeTaskId, async () => {
    await nextTick()
    heading.value?.focus()
  })

  return { activeTaskId, activeTask, completedCount, firstIncompleteTask, heading, selectTask, focusFirstIncomplete }
}
