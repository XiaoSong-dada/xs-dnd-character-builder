import { useRoute } from 'vue-router'

export type PrimaryRouteName = 'character-builder' | 'session-assistant' | 'dice' | 'about'

export interface BottomNavigationItem {
  readonly routeName: PrimaryRouteName
  readonly label: string
  readonly iconId: string
}

export const navigationItems = [
  {
    routeName: 'character-builder',
    label: '辅助车卡',
    iconId: 'navigation-character-card',
  },
  {
    routeName: 'session-assistant',
    label: '跑团助手',
    iconId: 'navigation-classes',
  },
  {
    routeName: 'dice',
    label: '赛博骰娘',
    iconId: 'navigation-dice',
  },
  {
    routeName: 'about',
    label: '关于本站',
    iconId: 'navigation-about',
  },
] as const satisfies readonly BottomNavigationItem[]

export function useBottomNavigation() {
  const route = useRoute()

  const onNavigationClick = (event: MouseEvent, routeName: PrimaryRouteName) => {
    if (route.name === routeName) {
      event.preventDefault()
    }
  }

  return {
    navigationItems,
    onNavigationClick,
  } as const
}
