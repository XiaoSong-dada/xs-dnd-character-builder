import { baseUrl } from '@/config/site'

export function downloadCharacterFile(file: File): void {
  const url = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = url
  link.download = file.name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function openCharacterFileDownload(file: File): boolean {
  const origin = window.location.origin
  const tab = window.open(`${baseUrl}owlbear-download.html`, '_blank')
  if (!tab) return false

  function sendFile(event: MessageEvent): void {
    if (event.origin !== origin || event.source !== tab || event.data !== 'owlbear-download-ready') return
    window.removeEventListener('message', sendFile)
    clearTimeout(timeout)
    tab?.postMessage(file, origin)
  }

  const timeout = setTimeout(() => window.removeEventListener('message', sendFile), 15_000)
  window.addEventListener('message', sendFile)
  return true
}
