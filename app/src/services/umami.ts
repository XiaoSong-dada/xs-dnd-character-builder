import { siteConfig, type UmamiConfig } from '@/config/site'

const UMAMI_SCRIPT_ID = 'umami-analytics-script'

export interface UmamiRuntime {
  readonly document: Document
  readonly hostname: string
}

function getBrowserRuntime(): UmamiRuntime | undefined {
  if (typeof document === 'undefined' || typeof window === 'undefined') return undefined

  return {
    document,
    hostname: window.location.hostname,
  }
}

export function initializeUmami(
  config: UmamiConfig = siteConfig.umami,
  runtime: UmamiRuntime | undefined = getBrowserRuntime(),
): HTMLScriptElement | undefined {
  if (!runtime || !config.scriptUrl || !config.websiteId || config.domains.length === 0) {
    return undefined
  }

  const normalizedHostname = runtime.hostname.toLowerCase()
  const allowedDomains = config.domains.map((domain) => domain.toLowerCase())
  if (!allowedDomains.includes(normalizedHostname)) return undefined

  const existingScript = runtime.document.getElementById(UMAMI_SCRIPT_ID)
  if (existingScript instanceof HTMLScriptElement) return existingScript

  const script = runtime.document.createElement('script')
  script.id = UMAMI_SCRIPT_ID
  script.defer = true
  script.src = config.scriptUrl
  script.dataset.websiteId = config.websiteId
  script.dataset.domains = config.domains.join(',')
  runtime.document.head.append(script)

  return script
}
