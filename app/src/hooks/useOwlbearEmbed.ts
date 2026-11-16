import { computed, inject, ref, watch, type WatchSource } from 'vue'
import { routeLocationKey, type LocationQuery, type RouteLocationNormalizedLoaded } from 'vue-router'

import { SessionStateStorageService } from '@/services/session-state-storage'

const embeddedRoutes = ['character-builder', 'session-assistant', 'workshop', 'workshop-editor']

export function owlbearWorkshopQuery(query: LocationQuery) {
  return query.embed === 'owlbear'
    ? { embed: 'owlbear', from: query.from, draft: query.draft, step: query.step, ruleset: query.ruleset }
    : {}
}

export function useOwlbearEmbed(currentRoute?: Pick<RouteLocationNormalizedLoaded, 'name' | 'query'>) {
  const route = currentRoute ?? inject(routeLocationKey, null)
  return computed(() => route?.query.embed === 'owlbear' && embeddedRoutes.some((name) => name === route.name))
}

export function useOwlbearStorageUnavailable(enabled: WatchSource<boolean>) {
  const unavailable = ref(false)
  watch(enabled, (active) => {
    unavailable.value = active && !SessionStateStorageService.canWrite()
  }, { immediate: true })
  return unavailable
}
