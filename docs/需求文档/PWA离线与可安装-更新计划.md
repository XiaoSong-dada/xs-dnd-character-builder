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
- 版本更新时新 SW 停在 waiting，由 `AppUpdatePrompt`（v1.9.0 前名为 `ServiceWorkerUpdatePrompt`）出顶部非阻断提示，用户点"立即刷新"才 `postMessage({ type: 'SKIP_WAITING' })`，接管后自动刷新且只刷新一次。
- 与既有「版本更新公告」保持一致口径：更新提示不阻断、不影响草稿恢复与页面导航。
- v1.9.0 起 waiting 不再是唯一的判定依据，见决策 7。

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

### 决策 7：更新检测以 git 构建标识对账为主，Service Worker waiting 为兜底（v1.9.0）

原方案（决策 3）只能回答"`sw.js` 字节变了没有"，回答不了**"现在部署的是哪个提交"**。由此有两个具体缺陷：

- 同一个提交重新构建（换了环境变量、或只是重打一次），`sw.js` 可能变化 → 误报为有新版本；
- 工作区带着未提交改动构建时，能提示有新版本，却**无法表达"这是同一提交的脏构建"**。

改为在构建期算出**构建标识**，运行时拉取比对：

- 干净工作区 → `<commit 短 hash>`；
- 有未提交改动 → `<commit 短 hash>-dirty-<未提交内容摘要>`，摘要取 `git diff HEAD --binary` 与按路径排序的未跟踪文件内容一起做 sha256 取前 8 位；
- 读不到 git → `v<package.json 版本>-nogit`，**构建日志显式告警**，不静默退化。

标识由 `app/scripts/app-build-id.ts` 计算，做三件事：注入全局常量 `__APP_BUILD_ID__`（**不要复用 `__APP_VERSION__`**，那是 package.json 的对外版本号，供更新公告比对，语义不同）、输出 `dist/version.json`、把 `APP_BUILD_ID` 环境变量作为最高优先级来源。

运行侧 `app/src/services/app-build-id.ts` 以 `cache: 'no-store'` 拉 `/version.json` 比对，`up-to-date` / `update-available` / `unavailable` 三态。离线、404、格式不符都归为 `unavailable`——离线本来就是 PWA 的正常工作状态，不该变成一个错误。

两路信号取"或"：`updateAvailable = buildIdMismatch || waitingShell`。保留 waiting 兜底是因为它只会真阳性（确实有新 `sw.js` 在等），能覆盖"标识相同但外壳字节变了"这种边缘情况。

切换动作按情况分两条路径（`applyServiceWorkerUpdate`）：

1. 已有等待中的新外壳 → 直接 `SKIP_WAITING`；
2. 还没有（对账先发现新构建、浏览器尚未查过 `sw.js`）→ 先 `registration.update()` 等新外壳就绪；超时仍没有则整页刷新兜底。

超时上限 5s（`WAITING_TIMEOUT_MS`）：超时说明外壳字节没变，刷新即可拿到新内容。

### 决策 8：构建标识在宿主机算好再注入容器，不把 `.git` 打进镜像

`app/Dockerfile` 只 `COPY app/` 与 `COPY docs/`，构建阶段没有 `.git`，容器内执行 `git rev-parse` 必然失败。

- `deploy.sh` 本来就在宿主 git 仓库里运行（会先 `git pull --ff-only`），由它算好 `APP_BUILD_ID` 并 `export`，经 `docker-compose.yml` 的 build args 传给 `Dockerfile` 的 `ARG`／`ENV`。
- `deploy.sh` 里的摘要算法必须与 `app/scripts/app-build-id.ts` **完全一致**（sha256 取前 8 位、同样的输入顺序）。若不一致，同一份工作区在"本地 `pnpm build`"与"`deploy.sh` 部署"下会得到不同标识，产生假更新提示。为兼容 macOS，`deploy.sh` 优先用 `sha256sum`，没有则退回 `shasum -a 256`。
- 丢弃"把 `.git` COPY 进 builder"的做法：会让整个仓库历史进入构建层，镜像构建更重也更慢，收益为零。
- 顺带清理：`docker-compose.yml` 里曾声明 `VITE_APP_VERSION`，但 `app/Dockerfile` 的 `ARG` 列表从未接收它，是纯无效配置（应用版本号走 `package.json`），一并移除。

### 决策 9：更新对账补两个触发时机，仍然只提示不自动刷新（v1.9.0）

决策 7 的对账只在**启动时**跑一次，只能回答「打开页面的这一刻有没有新版本」。两个场景拿不到提示，只能靠用户自己刷新或去「关于本站」点按钮：

- 页面一直开着，期间发布了新版本；
- 打开时正断网（`unavailable`），之后才恢复网络。

补两个时机（`app/src/services/update-watch.ts`）：

- `online`：恢复联网。断网填卡、网络回来的那一刻，是最可能拿到新版本的时机；
- `visibilitychange` 且页面转为**可见**：覆盖「挂在后台很久再切回来」。隐藏方向不触发，避免在不可见时白拉一次网络。

两个决定：

- **仍然只提示，不自动切换。** 网络事件是「发现新版本」的时机，不是「丢掉当前操作」的理由：玩家可能刚停在车卡的某一步、或正在导出。切换动作依旧只由用户点击触发（承接决策 3）。草稿虽然每改一次都落盘（`stores/character-drafts.ts` 的 deep watch），不会因刷新丢卡，但步骤位置、展开的面板、掷骰动画与进行中的导出都会被打断。
- **两个时机的节流交给「自动检查周期」统一处理**，不再单独设一个短冷却窗口。见决策 10。

分工：策略留在 store（只有它知道上一次对账有没有结论），`update-watch.ts` 只把浏览器事件翻成一次触发信号——与 `service-worker.ts` 只负责 DOM 接线、策略上抛给 store 的分工一致。

### 决策 10：自动检查周期可配置，默认 7 天，记在本机（v1.9.0）

如果决策 9 的两个时机只是「有事件就查」，页面常驻期间切几次前后台就会打几次请求；玩家对「多久查一次」本身也有偏好。因此把自动检查收敛成一个可配置周期：

- **默认 7 天**；在「关于本站」的版本区块里可改成 1—365 之间的任意整数天。
- **约束全部自动检查**：启动、恢复联网、页面重新可见三处都只看这一个周期。距上次**有结论**的检查不满一个周期就跳过，连请求都不发。
- **手动检查不受限制**：点「检查更新」永远立即查，且查完同样算作「刚检查过」并重置周期计时——玩家已经拿到答案，没必要再自动查一遍。
- **只有拿到结论才记账**：`unavailable`（离线、404、格式不符）不写检查时间，否则「打开时断网、之后才连上」这个最需要立刻对账的场景会被周期挡掉。这一条从决策 9 早期版本的冷却窗口原样继承。

两处实现要点：

- 检查时间**必须落盘**（`update-check-preference.ts` 的 state 键）。只放内存的话刷新页面就归零，周期等于不生效。
- 周期设置与检查时间**存两个键**：前者是用户行为偏好，后者是本机运行记录；语义不同，损坏其中一个不该连累另一个。

早期实现里的 5 分钟冷却窗口（`UPDATE_TRIGGER_COOLDOWN_MS`）被本决策取代并移除：周期下界就是 1 天，天然覆盖了「网络抖动不该反复请求」，不再需要两个独立的时间参数。

判断到期用纯函数 `isAutoCheckDue(checkedAt, intervalDays, now)`。记录时间**晚于**当前时间时也视为到期——否则玩家把系统时钟往回拨一次，自动检查就被永久锁死，再也收不到更新提示。

输入校验放在 services（`parseUpdateCheckIntervalDays`），界面只负责收集原文：非法输入给中文原因、**不静默改回原值**（改回去了玩家会以为设置生效了）；写入失败（隐私模式、配额已满）同样明说，不让「看起来保存成功」蒙混过去。

## 4. 变更清单

新增：

| 文件 | 职责 |
| --- | --- |
| `app/scripts/app-build-id.ts` | 构建期计算构建标识（git／注入／降级）、组合规则、输出 `version.json` 的 Vite 插件 |
| `app/src/services/app-build-id.ts` | 运行时拉取 `version.json` 并与本机标识对账 |
| `app/src/services/character-sheet-templates.ts` | 三个导出模板 URL 的唯一事实源 + 离线缺失提示 |
| `app/src/services/service-worker.ts` | `sw.js` 注册、按需索要新版本、激活握手与降级刷新 |
| `app/src/services/update-watch.ts` | 登记联网／回到前台两个补充对账时机，只上报触发信号不决定节流 |
| `app/src/services/update-check-preference.ts` | 自动检查周期设置与上次检查时间两处本机记录，含天数解析与到期判断纯函数 |
| `app/src/services/offline-assets.ts` | 离线资源清单、缓存状态查询、一键下载 |
| `app/src/services/persistent-storage.ts` | 持久化存储提权 |
| `app/src/stores/app-update.ts` | 两路更新信号的合并、对账与切换（v1.9.0 前名为 `stores/service-worker.ts`）；登记补充触发时机、按可配置周期做自动检查、保存周期设置 |
| `app/src/features/app-update/components/AppUpdatePrompt.vue` | 顶部非阻断更新提示（v1.9.0 前名为 `ServiceWorkerUpdatePrompt.vue`） |
| `app/src/views/about/hooks/useOfflineAssets.ts` | 关于本站离线区块状态 |
| `app/src/views/about/hooks/useAppVersion.ts` | 关于本站构建标识、手动对账入口、自动检查周期设置与输入校验 |
| `app/src/views/about/components/OfflineAssetSection.vue` | 关于本站离线区块 UI |
| `app/public/icons/*.png` | 192／512／maskable 512／apple-touch 180 图标 |

修改：

| 文件 | 变更 |
| --- | --- |
| `app/vite.config.ts` | 接入 `VitePWA`，manifest + workbox 配置；注入 `__APP_BUILD_ID__` 并挂上输出 `version.json` 的插件 |
| `app/index.html` | 标签页图标换 192px 产物；补 `apple-touch-icon` 尺寸与 iOS 独立窗口 meta |
| `app/src/App.vue` | 挂载更新提示；挂载后初始化 `app-update` store |
| `app/src/config/setting.ts` | 导出 `isDev`（供 services 判断是否注册 SW）与 `appBuildId`／`appBuildIdDirty` |
| `app/src/env.d.ts` | 声明 `__APP_BUILD_ID__` |
| `app/src/services/export-pdf.ts` | 模板 URL 改从 `character-sheet-templates` 引入；离线缺失时抛中文提示 |
| `app/src/services/export-xlsx.ts` | 同上 |
| `app/src/views/about/components/AboutIntroSection.vue` | 版本行增补构建标识、`-dirty-` 标记、「检查更新」按钮与自动检查周期输入 |
| `app/tsconfig.node.json` | `include` 增加 `scripts/**/*.ts`，让构建期脚本进入类型检查 |
| `app/nginx.conf` | `/sw.js` 与 `/version.json` 不缓存、`/manifest.webmanifest` 短期缓存、`/workbox-*.js` 长缓存 |
| `app/Dockerfile` | 新增 `ARG`／`ENV APP_BUILD_ID` |
| `docker-compose.yml` | 新增 `APP_BUILD_ID` build arg；移除无效的 `VITE_APP_VERSION` |
| `deploy.sh` | 在宿主 git 仓库计算构建标识并 `export` |
| `app/package.json` | 版本 1.9.0；新增 devDependencies |

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
| `pnpm test:run` | 156 个文件 / 1293 个用例全部通过 |
| `pnpm build`（含 vite-ssg 预渲染） | 通过，产出 `dist/sw.js`、`dist/manifest.webmanifest`、`dist/version.json` |
| 预缓存清单 | 41 个 URL（原始约 6.2 MB，gzip 约 1.7 MB）：6 个预渲染 HTML、JS/CSS 分块、4 个图标、manifest |
| `og-image.png`、`/templates/**`、`version.json` 未被预缓存 | 已确认（三者都必须能回源） |
| 4 个替换前的 1.6 MB 源图不再进入产物 | 已确认 |
| `sw.js` 含 `SKIP_WAITING` 消息监听 | 已确认（手写注册的握手前提） |
| `navigateFallback` + `/templates/` 反例名单 | 已确认（直接打开 PDF 链接不会被顶成 HTML） |
| manifest 与 `apple-touch-icon` 注入覆盖全部预渲染页面 | 已确认（6 个页面逐一核对） |
| 预缓存清单无重复 URL 版本冲突 | 已确认（41 个唯一 URL，无 revision 冲突） |
| `dist/version.json` 与打包进 JS 的 `__APP_BUILD_ID__` 一致 | 已确认：两端都是 `6067b02-dirty-52dad07b` |
| 同一次构建内多次求值得到同一标识 | 已确认。**首次核对时失败**：`vue-tsc`／客户端构建／SSR 构建三次求值出现两个不同摘要（`85cd8f09` 与 `986b8f12`）。定位为 `.vite-ssg-temp` 未被 `.gitignore` 忽略，构建中途以未跟踪目录身份进入摘要输入；补入 `.gitignore` 后三次求值一致 |

新增测试：

- `test/scripts/app-build-id.test.ts`（10）：标识组合规则、摘要长度与顺序敏感、`-dirty-` 解析、注入优先于 git、注入为空白视为未注入、本地 git 的干净／脏两条路径、git 不可用降级。
- `test/services/app-build-id.test.ts`（9）：清单格式校验、无运行环境不可用、开发模式跳过且不发请求、一致与不一致、`no-store` 绕过缓存、非 2xx、格式不符、离线与 JSON 解析失败。
- `test/stores/app-update.test.ts`（9）：初始化幂等、对账结论落到状态、离线不误报、两路信号取或、并发检查共享同一请求、无更新时点击不动作。
- `test/services/service-worker.test.ts`（7 → 9）：原有用例随 `applyServiceWorkerUpdate` 改为异步；新增「先请浏览器查一次、查到后走激活而不是刷新」与「查询超时整页刷新兜底」。
- `test/components/AboutPage.test.ts`（7 → 11）：构建标识与手动检查入口、干净／脏构建展示区分、手动检查结论、离线时的可理解说明。
- `test/services/offline-assets.test.ts`（8）、`test/services/persistent-storage.test.ts`（6）：v1.8.0 引入，本次未改动。

## 7. 部署要求

- **必须 HTTPS**：Service Worker 只在安全上下文生效（`localhost` 例外）。当前 `docker-compose.yml` 暴露的是 HTTP 端口，需要由外层反向代理终止 TLS，否则应用仍可用，但不会注册 SW、也没有安装能力。
- **`version.json` 与 `sw.js` 都必须 `no-cache`**：这两份文件是更新检测的依据，一旦被缓存就会长期给出错误的"已是最新"。`nginx.conf` 已为两者都加了 `no-cache`，运行侧另外用了 `cache: 'no-store'`，两边都需要。
- **构建标识必须注入**（v1.9.0 起）：用 `deploy.sh` 部署时会自动计算并传入。若绕过脚本直接 `docker compose up --build`，容器内没有 `.git`，构建会降级为 `v<版本号>-nogit` 并在日志里告警——功能不受影响，但更新检测失去区分度。本地 `pnpm build` 会直接读仓库 git，无需额外配置。
- 未做：离线可用性的人工浏览器验证（断网走查）按项目约定不列为完成条件；如需，可在 `pnpm preview` 后于 DevTools 勾选 Offline 复核。

## 8. 未做与后续

- 不做 Tauri／Electron 包装：PWA 已满足"装到桌面 + 离线可用"，且不需要维护第二套打包链路。
- 不做后台同步、推送通知、周期性同步（`sync` / `periodicsync`）。
- 不做周期性版本轮询：只在启动时对账一次，加上「关于本站」的手动检查入口。持续轮询对单页工具没有收益，反而增加无谓请求。
- 离线资源的版本失效策略：目前模板文件名不带哈希，若未来替换模板内容，需要同步提升缓存名 `dnd-character-sheet-templates-v1` 的版本号，否则老客户端会继续用缓存副本。
- 构建标识只用于"是否需要更新"的判定，不作为任何业务逻辑的输入；`-nogit` 降级态目前只在关于页如实展示，不额外提示用户。
