import { computed } from 'vue'
import { useRoute } from 'vue-router'

/** 跑团助手的一级分段：局内模式 / 内容工坊。 */
export interface AssistantSection {
  readonly routeName: 'session-assistant' | 'workshop'
  readonly label: string
  /** 归属该分段的全部路由名（编辑器属于内容工坊）。 */
  readonly routeNames: readonly string[]
}

export const assistantSections = [
  { routeName: 'session-assistant', label: '局内模式', routeNames: ['session-assistant'] },
  { routeName: 'workshop', label: '内容工坊', routeNames: ['workshop', 'workshop-editor'] },
] as const satisfies readonly AssistantSection[]

/**
 * 跑团助手外壳：一级分段由路由驱动（不用组件内 tab 状态）。
 * 分段激活按路由名归属集合判定，因此编辑器页仍高亮「内容工坊」。
 */
export function useAssistantShell() {
  const route = useRoute()
  const currentRouteName = computed(() => String(route.name ?? ''))

  function isActive(section: AssistantSection): boolean {
    return section.routeNames.includes(currentRouteName.value)
  }

  return { sections: assistantSections, isActive } as const
}
