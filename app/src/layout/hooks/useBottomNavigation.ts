import { useRoute } from 'vue-router'

export type PrimaryRouteName = 'character-builder' | 'classes' | 'dice' | 'profile'

export interface BottomNavigationItem {
  readonly routeName: PrimaryRouteName
  readonly label: string
  readonly iconId: string
}

const navigationItems = [
  {
    routeName: 'character-builder',
    label: '辅助车卡',
    iconId: 'navigation-character-card',
  },
  {
    routeName: 'classes',
    label: '职业介绍',
    iconId: 'navigation-classes',
  },
  {
    routeName: 'dice',
    label: '赛博骰子',
    iconId: 'navigation-dice',
  },
  {
    routeName: 'profile',
    label: '个人中心',
    iconId: 'navigation-profile',
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
