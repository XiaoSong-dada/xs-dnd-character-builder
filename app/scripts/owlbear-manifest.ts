import type { Plugin } from 'vite'

export function owlbearManifestPlugin(base: string, version: string): Plugin {
  const icon = `${base}icons/icon-192.png`
  const manifest = JSON.stringify({
    manifest_version: 1,
    version,
    name: 'D&D 车卡助手',
    description: '在枭熊房间导入角色卡，查看护甲等级并记录生命值。',
    icon,
    action: {
      title: '车卡助手',
      icon,
      popover: `${base}assistant/session?embed=owlbear`,
      width: 440,
      height: 640,
    },
  }, null, 2)

  return {
    name: 'owlbear-manifest',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const path = request.url?.split('?')[0]
        if (path === icon) {
          response.setHeader('Access-Control-Allow-Origin', '*')
          return next()
        }
        if (path !== `${base}owlbear-manifest.json`) return next()
        response.setHeader('Content-Type', 'application/json; charset=utf-8')
        response.setHeader('Access-Control-Allow-Origin', '*')
        response.end(manifest)
      })
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'owlbear-manifest.json', source: manifest })
    },
    apply: (_config, { isSsrBuild }) => !isSsrBuild,
  }
}
