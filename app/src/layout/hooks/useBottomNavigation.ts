import { useRoute } from 'vue-router'

export type PrimaryRouteName = 'character-builder' | 'session-assistant' | 'dice' | 'about'

export interface BottomNavigationItem {
  readonly routeName: PrimaryRouteName
  readonly label: string
  readonly iconId: string
  /**
   * 一级功能的路径前缀。跑团助手改为父级 + 子路由后，
   * 激活判定必须按前缀，不能再用 `router-link-exact-active`。
   */
  readonly pathPrefix: string
}

export const navigationItems = [
  {
    routeName: 'character-builder',
    label: '辅助车卡',
    iconId: 'navigation-character-card',
    pathPrefix: '/character-builder',
  },
  {
    routeName: 'session-assistant',
    label: '跑团助手',
    iconId: 'navigation-classes',
    pathPrefix: '/assistant',
  },
  {
    routeName: 'dice',
    label: '赛博骰娘',
    iconId: 'navigation-dice',
    pathPrefix: '/dice',
  },
  {
    routeName: 'about',
    label: '关于本站',
    iconId: 'navigation-about',
    pathPrefix: '/about',
  },
] as const satisfies readonly BottomNavigationItem[]

export function useBottomNavigation() {
  const route = useRoute()

  /** 当前是否位于该一级功能之下（含其嵌套子路由）。 */
  function isActive(item: BottomNavigationItem): boolean {
    const path = route.path.replace(/\/+$/, '') || '/'
    const prefix = item.pathPrefix.replace(/\/+$/, '')
    return path === prefix || path.startsWith(`${prefix}/`)
  }

  /** 点击当前一级导航时不重复导航，也不触发滚动复位。 */
  function onNavigationClick(event: MouseEvent, item: BottomNavigationItem) {
    if (isActive(item)) {
      event.preventDefault()
    }
  }

  return {
    navigationItems,
    isActive,
    onNavigationClick,
  } as const
}
