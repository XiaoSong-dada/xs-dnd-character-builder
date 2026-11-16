const statusMessage = document.getElementById('status')
const link = document.getElementById('download')
const sender = window.opener
const origin = window.location.origin

if (!sender) {
  statusMessage.textContent = '请回到车卡助手，从导出菜单重新打开下载页。'
} else {
  const timeout = setTimeout(() => {
    statusMessage.textContent = '未收到文件，请回到车卡助手重试。'
  }, 15_000)

  window.addEventListener('message', function receiveFile(event) {
    if (event.origin !== origin || event.source !== sender || !(event.data instanceof File)) return
    window.removeEventListener('message', receiveFile)
    clearTimeout(timeout)
    const url = URL.createObjectURL(event.data)
    link.href = url
    link.download = event.data.name
    link.hidden = false
    statusMessage.textContent = event.data.name
    window.opener = null
    window.addEventListener('pagehide', () => URL.revokeObjectURL(url), { once: true })
  })

  sender.postMessage('owlbear-download-ready', origin)
}
