import { computed, inject } from 'vue'
import { routeLocationKey } from 'vue-router'

export function useOwlbearEmbed() {
  const route = inject(routeLocationKey, null)
  return computed(() => route?.name === 'session-assistant' && route.query.embed === 'owlbear')
}
