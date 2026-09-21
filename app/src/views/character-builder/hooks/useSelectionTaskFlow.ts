import { computed, nextTick, ref, watch, type ComputedRef } from 'vue'

import type { SelectionTask } from '@/views/character-builder/selection-task'

/** 管理步骤内任务的默认定位、自由跳转、完成后自动推进与标题聚焦。 */
export function useSelectionTaskFlow(tasks: ComputedRef<readonly SelectionTask[]>) {
  const activeTaskId = ref('')
  const heading = ref<HTMLElement>()

  const firstIncompleteTask = computed(() => tasks.value.find((task) => task.required && task.status !== 'complete'))
  const completedCount = computed(() => tasks.value.filter((task) => task.status === 'complete').length)
  const activeTask = computed(() => tasks.value.find((task) => task.id === activeTaskId.value) ?? tasks.value[0])

  function selectTask(id: string): void {
    if (!tasks.value.some((task) => task.id === id)) return
    activeTaskId.value = id
  }

  function focusFirstIncomplete(): void {
    const next = firstIncompleteTask.value ?? tasks.value[0]
    if (next) selectTask(next.id)
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
