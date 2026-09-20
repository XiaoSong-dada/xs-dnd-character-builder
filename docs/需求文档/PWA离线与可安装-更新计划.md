# PWA 离线与可安装 — 更新计划

> 本文档记录 PWA 改造的需求背景、已确认决策、变更清单与验证结果。
> 决策均按"先说明依据、再落到实现"的顺序记录，便于后续调整或回滚。

## 1. 背景与目标

应用本身已经是**纯前端、本地优先**的：角色草稿写 localStorage、头像立绘写 IndexedDB、部署产物是 nginx 托管的静态文件，运行时唯一的外部网络请求是可选访问统计脚本。

缺的只是"外壳"：没有 Web App Manifest、没有 Service Worker，因此**不能安装到桌面、断网也打不开**。本次改造只补这一层，不改动任何业务数据链路。

目标：

1. 可安装：手机上"添加到主屏幕"或桌面浏览器安装后，以独立窗口运行。
2. 可离线：断网时车卡、跑团助手、骰娘、导出角色卡全部可用。
3. 更新可控：新版本不强制刷新，玩家填表过程不被打断。
4. 数据可保：降低浏览器清理 IndexedDB／localStorage 导致角色丢失的风险。

## 2. 改造前的现状盘点

| 数据 | 介质 | 键名 |
| --- | --- | --- |
| 角色草稿（schema v8） | localStorage | `dnd-character-builder:drafts:v8` |
| 跑团局内状态 | localStorage | `dnd-session-assistant:states:v1` |
| 头像／立绘 Blob | IndexedDB | 库 `dnd-character-builder-media` |
| 导出模板（PDF／XLSX／字体） | `public/templates/` 静态托管，运行时 fetch | — |

`index.html` 只有 `theme-color` 与 `apple-touch-icon`；无 manifest、无 Service Worker；`vite-ssg` 负责 6 个路由的预渲染。

## 3. 已确认决策

### 决策 1：用 `generateSW`，注册逻辑手写，不用 `virtual:pwa-register`

`vite-ssg` 会在 Node 侧构建并预渲染页面。`vite-plugin-pwa` 的虚拟模块（`virtual:pwa-register`）必须靠"动态 import + `typeof window` 守卫"才能避开预渲染期，属于官方 FAQ 里专门标注的 SSR/SSG 坑。

改为 `injectRegister: null` + 自写 `src/services/service-worker.ts`：

- 完全不引入虚拟模块，预渲染路径零风险（`docs/seo-requirements.md` 明确要求"预渲染页面中不得残留无法水合的副作用代码"）。
- 注册时机放在 `App.vue` 的 `onMounted`，预渲染期不会执行。
- 代价是需要自己处理 `updatefound` / `controllerchange` / `SKIP_WAITING` 握手——已确认生成的 `sw.js` 内含 `SKIP_WAITING` 消息监听（`s.data&&"SKIP_WAITING"===s.data.type&&self.skipWaiting()`），握手成立。

### 决策 2：导出模板不进预缓存，改为运行时按需缓存 + 一键下载

PDF 模板 1.28 MB、中文字体 1.18 MB、XLSX 模板 0.05 MB，合计约 2.5 MB。它们只在导出时用得到，放进预缓存会明显拉长安装下载时间。

- `vite.config.ts` 加 workbox 运行时缓存：`/templates/` 前缀 → `CacheFirst`，缓存名 `dnd-character-sheet-templates-v1`。
- `src/services/offline-assets.ts` 登记同样三项资源，并提供"一键下载"（逐个 fetch、`cache: 'reload'` 跳过 HTTP 缓存、再用 `caches.match` 复查确实落盘）。
- 入口在「关于本站 → 离线使用」区块（项目没有设置页，关于本站是既有的站点级工具页）。
- 两边通过 `/templates/` 前缀耦合，由 `test/services/offline-assets.test.ts` 中的断言守卫：清单里的 URL 必须位于 `/templates/` 下，否则一键下载会"看起来成功但断网取不到"。
- 未缓存且断网时，`export-pdf` / `export-xlsx` 会抛出可执行的中文提示（`CHARACTER_SHEET_OFFLINE_MESSAGE`），而不是把 `Failed to fetch` 直接透给玩家。

> 修正一处早期口误：曾判断这几个文件"超过 workbox 默认的 2 MiB 上限所以会被跳过"。实际只有 `og-image.png`（2.3 MB）超过上限；模板文件都在上限内。所以模板不预缓存的**真实理由是安装体积**，不是尺寸限制。`og-image.png` 则确实需要排除（见决策 4）。

### 决策 3：更新策略用 `prompt`，不自动刷新

`skipWaiting: false` + `clientsClaim: true`：

- 首次安装没有旧 SW 接管，新 SW 当场激活，`clientsClaim` 让它立刻控制当前页面，**本次访问就能离线**。
- 版本更新时新 SW 停在 waiting，由 `ServiceWorkerUpdatePrompt` 出顶部非阻断提示，用户点"立即刷新"才 `postMessage({ type: 'SKIP_WAITING' })`，接管后自动刷新且只刷新一次。
- 与既有「版本更新公告」保持一致口径：更新提示不阻断、不影响草稿恢复与页面导航。

### 决策 4：放宽预缓存体积上限，但排除 `og-image.png`

workbox 默认 2 MiB 上限会静默跳过超限文件，构建直接失败并提示。

- 骰娘页的 3D 引擎（three + cannon-es）被打成一个约 2.6 MB 的懒加载 chunk，超出上限。它是**核心交互功能**而非仅导出用的资源，故把 `maximumFileSizeToCacheInBytes` 放宽到 3 MiB 让它进入预缓存（gzip 后约 0.6 MB），保证装完离线也能掷骰。
- 注意：Rollup 用 chunk 内某个模块名给块命名，这个块叫 `CharacterMediaEditor...`，与实际内容（3D 引擎）无关，排障时不要被文件名误导。
- `og-image.png`（2.3 MB）仅用于社交分享、客户端永不请求，用 `globIgnores` 排除。

### 决策 5：标签页图标改用 192px 派生产物

改造前 `index.html` 的 `rel="icon"` 直接指向 1024×1024 的 `src/assets/icons/DND.png`（1.6 MB），浏览器每次访问都会下载它。改为指向 `public/icons/icon-192.png` 后：

- 页面不再加载 1.6 MB 的图标，预缓存清单里也不再出现该资源。
- 源图仍保留在 `src/assets/icons/DND.png`，作为 PWA 图标的派生源头。

### 决策 6：`navigator.storage.persist()` 在"一键下载"时申请

默认 localStorage／IndexedDB 属"尽力而为"型存储，磁盘紧张时浏览器可清理，角色会一起丢失。浏览器只在满足条件时授予（通常已安装为 PWA、被收藏或达到使用度），页面刚打开就申请基本会被拒。

因此调用时机放在用户点击"一键下载离线资源"（明确表达离线意图）时，并在区块内展示"本地数据保护：已开启／未开启"。拒绝是正常结果，不报错、不阻断。

## 4. 变更清单

新增：

| 文件 | 职责 |
| --- | --- |
| `app/src/services/character-sheet-templates.ts` | 三个导出模板 URL 的唯一事实源 + 离线缺失提示 |
| `app/src/services/service-worker.ts` | `sw.js` 注册与更新握手 |
| `app/src/services/offline-assets.ts` | 离线资源清单、缓存状态查询、一键下载 |
| `app/src/services/persistent-storage.ts` | 持久化存储提权 |
| `app/src/stores/service-worker.ts` | 注册幂等、待更新版本、激活进行中 |
| `app/src/features/service-worker/components/ServiceWorkerUpdatePrompt.vue` | 顶部非阻断更新提示 |
| `app/src/views/about/hooks/useOfflineAssets.ts` | 关于本站离线区块状态 |
| `app/src/views/about/components/OfflineAssetSection.vue` | 关于本站离线区块 UI |
| `app/public/icons/*.png` | 192／512／maskable 512／apple-touch 180 图标 |

修改：

| 文件 | 变更 |
| --- | --- |
| `app/vite.config.ts` | 接入 `VitePWA`，manifest + workbox 配置 |
| `app/index.html` | 标签页图标换 192px 产物；补 `apple-touch-icon` 尺寸与 iOS 独立窗口 meta |
| `app/src/App.vue` | 挂载更新提示；挂载后初始化 Service Worker store |
| `app/src/config/setting.ts` | 由空占位改为导出 `isDev`（供 services 判断是否注册 SW） |
| `app/src/services/export-pdf.ts` | 模板 URL 改从 `character-sheet-templates` 引入；离线缺失时抛中文提示 |
| `app/src/services/export-xlsx.ts` | 同上 |
| `app/nginx.conf` | `/sw.js` 不缓存、`/manifest.webmanifest` 短期缓存、`/workbox-*.js` 长缓存 |
| `app/package.json` | 版本 1.8.0；新增 devDependencies |

新增依赖（全部为 devDependencies，不进入运行时包）：

- `vite-plugin-pwa@^1.3.0`
- `workbox-build@^7.4.1`、`workbox-window@^7.4.1`（插件的 peer 依赖）

## 5. 图标生成命令

图标由 `app/src/assets/icons/DND.png`（1024×1024）用 ImageMagick 派生，命令如下（一次性执行，不纳入构建流程，避免给构建机增加 ImageMagick 依赖）：

```bash
SRC=app/src/assets/icons/DND.png
OUT=app/public/icons
magick "$SRC" -background black -alpha remove -alpha off -resize 512x512 "$OUT/icon-512.png"
magick "$SRC" -background black -alpha remove -alpha off -resize 192x192 "$OUT/icon-192.png"
magick "$SRC" -background black -alpha remove -alpha off -resize 180x180 "$OUT/apple-touch-icon.png"
magick "$SRC" -background black -alpha remove -alpha off -resize 400x400 \
  -background black -gravity center -extent 512x512 "$OUT/icon-maskable-512.png"
```

maskable 版本额外留出安全边距：图形缩到 512 画布的约 78%，避免被 Android 的圆形／圆角遮罩裁掉龙翼与剑尖。iOS 不接受透明通道，因此全部先 `-alpha remove` 压到黑底。

## 6. 验收与验证结果

| 验收项 | 结果 |
| --- | --- |
| `vue-tsc -b` 类型检查 | 通过 |
| `pnpm test:run` | 153 个文件 / 1259 个用例全部通过 |
| `pnpm build`（含 vite-ssg 预渲染） | 通过，产出 `dist/sw.js`、`dist/manifest.webmanifest` |
| 预缓存清单 | 36 个 URL（原始约 6.2 MB，gzip 约 1.7 MB）：6 个预渲染 HTML、JS/CSS 分块、4 个图标、manifest |
| `og-image.png`、`/templates/**` 未被预缓存 | 已确认 |
| 4 个替换前的 1.6 MB 源图不再进入产物 | 已确认 |
| `sw.js` 含 `SKIP_WAITING` 消息监听 | 已确认（手写注册的握手前提） |
| `navigateFallback` + `/templates/` 反例名单 | 已确认（直接打开 PDF 链接不会被顶成 HTML） |
| manifest 与 `apple-touch-icon` 注入覆盖全部预渲染页面 | 已确认（5 个页面逐一核对） |
| 预缓存清单无重复 URL 版本冲突 | 已确认（36 个唯一 URL，无 revision 冲突） |

新增测试：

- `test/services/service-worker.test.ts`（7）：首次安装不提示、有旧 SW 时提示、遗留等待版本、激活指令与只刷新一次、注册失败静默降级、无环境不可用。
- `test/services/offline-assets.test.ts`（8）：清单与 `/templates/` 前缀的耦合守卫、状态查询、不可用环境、逐个下载成功／部分失败／"请求成功但未落缓存"／网络异常。
- `test/services/persistent-storage.test.ts`（6）：已授予不再申请、授予、拒绝、抛错、不支持、状态读取容错。
- `test/components/AboutPage.test.ts`（+2）：离线区块渲染与三项资源状态、不支持环境下的可执行提示与按钮恢复。

## 7. 部署要求

- **必须 HTTPS**：Service Worker 只在安全上下文生效（`localhost` 例外）。当前 `docker-compose.yml` 暴露的是 HTTP 端口，需要由外层反向代理终止 TLS，否则应用仍可用，但不会注册 SW、也没有安装能力。
- `nginx.conf` 已为 `/sw.js` 加 `no-cache`：若被长缓存，浏览器可能长时间拿不到新版本，更新提示永远不会出现。
- 未做：离线可用性的人工浏览器验证（断网走查）按项目约定不列为完成条件；如需，可在 `pnpm preview` 后于 DevTools 勾选 Offline 复核。

## 8. 未做与后续

- 不做 Tauri／Electron 包装：PWA 已满足"装到桌面 + 离线可用"，且不需要维护第二套打包链路。
- 不做后台同步、推送通知、周期性同步（`sync` / `periodicsync`）。
- 不做 SW 主动版本轮询；浏览器自身的更新检查已够用。
- 离线资源的版本失效策略：目前模板文件名不带哈希，若未来替换模板内容，需要同步提升缓存名 `dnd-character-sheet-templates-v1` 的版本号，否则老客户端会继续用缓存副本。
