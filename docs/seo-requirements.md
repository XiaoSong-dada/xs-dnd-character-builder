# 站点 SEO 需求记录

> 本文档持续记录站点搜索引擎可见性（SEO）改造的需求澄清过程。
> 后续开始相关开发前，必须先完整阅读本文档，并以“已确认结论”为当前实现基线；未确认事项不得擅自扩展为业务功能。

## 1. 本阶段目标

- 让主要页面在关闭 JavaScript 的情况下仍能被搜索引擎读取到关键内容（标题、描述、正文入口）。
- 为全站建立完整的 meta 元数据、规范化 URL、robots 与 sitemap 体系；本期以当前主打功能（辅助车卡页）为优化重点，职业介绍、个人中心待功能开发完成后纳入（见 §7）。
- 提升移动端与性能相关的基础 SEO 指标（LCP、可访问性、语义化）。
- 建立可复验的 SEO 验收方式（Lighthouse、curl 抓取）。
- 不在本期引入 SSR 改造、不购买外链、不做关键词堆砌。

## 2. 当前 SEO 基线（现状盘点）

### 2.1 技术形态

- Vue 3 + Vite 纯客户端渲染（CSR）SPA，HTML5 History 路由。
- `index.html` 仅有 `charset`、`viewport`、`icon`、`title` 四个标签，无 description、canonical、Open Graph、结构化数据。
- 路由元信息只维护 `title`，由 `router.afterEach` 在客户端设置 `document.title`；搜索引擎首次抓取时拿不到每个页面的独立标题与描述。
- 路由懒加载已开启；移动端优先布局已建立。

### 2.2 页面清单（当前路由）

| 路由 | 页面 | 当前 title | SEO 处理范围 |
| --- | --- | --- | --- |
| `/` | 重定向到 `/character-builder` | — | 不单独收录 |
| `/character-builder` | 辅助车卡（当前主打） | 辅助车卡 \| D&D车卡辅助 | 本期重点 |
| `/dice` | 赛博骰娘 | 赛博骰娘 \| D&D车卡辅助 | 本期覆盖（已实现） |
| `/classes` | 职业介绍（未开发） | 职业介绍 \| D&D车卡辅助 | TODO：功能完成后处理 |
| `/profile` | 个人中心（未开发） | 个人中心 \| D&D车卡辅助 | TODO：功能完成后处理 |
| 任意未匹配 | 404 | 页面不存在 \| D&D车卡辅助 | 不收录 |

> 说明：职业介绍（`/classes`）与个人中心（`/profile`）功能尚未开发，本期不做这两个页面的 SEO 优化；相关条目见 §7 TODO，待功能完成后再处理。

### 2.3 部署与基础设施

- 生产域名 `your_url`（占位符，以构建配置为准，站点 URL 应走 `src/config` 环境变量注入）。
- nginx 仅配置 SPA fallback（`try_files $uri $uri/ /index.html`），无 gzip、无静态缓存头、无 robots/sitemap 显式服务。
- 已接入 Umami 统计，不影响 SEO。
- 站点信息（作者名、版本、GitHub 链接）已通过 `VITE_*` 环境变量注入 `src/config/site.ts`，SEO 相关配置应沿用同一入口，不得在业务模块直接读 `import.meta.env`。

### 2.4 内容与版权约束

- SEO 文案（title/description/结构化数据）默认使用原创中文文案。
- 未来 `/classes` 职业介绍上线后属商业资料衍生内容，受项目版权约定约束：SEO 描述与摘要必须使用项目内原创文案或许可来源，不得直接搬运规则书正文、职业表全文（见 §7 TODO）。

## 3. 需求条目

优先级约定：P0 为低成本基础项（零或低新增依赖），P1 为关键改造项，P2 为验证与运营项。

### P0-1 全站静态 meta 标签

**要求：**

- `index.html` 补齐：`description`、`keywords`（可选，克制使用）、`author`、`theme-color`、`robots`（默认 `index,follow`）、`canonical`（首页指向站点根 URL）。
- 增加 `apple-touch-icon`，沿用现有 `DND.png` 或派生 180×180 图标。
- 追加 Open Graph 与 Twitter Card 基础标签：`og:title`、`og:description`、`og:type=website`、`og:url`、`og:image`、`og:locale=zh_CN`、`twitter:card=summary`。
- 站点 URL、图片地址等必须由 `src/config` 环境变量注入（如 `VITE_SITE_URL`、`VITE_SITE_IMAGE`），禁止硬编码域名。

**验收：**

- `curl` 抓取首页 HTML 可见以上标签，且不含硬编码域名之外的错误 URL。

### P0-2 路由级 SEO 元数据

**要求：**

- 路由 `meta` 增加 `description` 字段；本期范围为已实现页面：`/character-builder`（主打，重点打磨）与 `/dice`。`/classes`、`/profile` 待功能开发完成后补充（见 §7）。
- 由路由守卫统一维护 `document.title` 与 `meta[name=description]`、`link[rel=canonical]`，SPA 内切换页面时同步更新；未配置 description 的页面不得输出空标签。
- 优先使用轻量自实现（当前已有 `router.afterEach` 基础），不为此引入额外 head 管理依赖；如后续确需依赖，先与项目确认。
- 每个页面保留唯一 `h1`，与 `title` 语义一致；`/dice` 骰娘页维持现有 `h1`。

**验收：**

- 切换任意两个页面，`document.title`、description、canonical 均正确变化。
- 新增页面的 title 长度（中文按字符计）不超过约 30 字；description 不超过 160 字符。

### P0-3 robots.txt 与 sitemap.xml

**要求：**

- 新增 `public/robots.txt`：允许所有爬虫抓取；当前 `/profile` 占位页不收录（`Disallow`），声明 `Sitemap` 地址。
- 新增 `public/sitemap.xml`：本期收录 `/character-builder`、`/dice`（不含 `/` 与 404），URL 使用 `VITE_SITE_URL` 前缀；`lastmod` 由构建期生成或按部署版本维护。`/classes`、`/profile` 开发完成后再加入（见 §7）。
- 新增页面路由时必须同步更新 sitemap 与 robots（列入路由开发完成标准）。

**验收：**

- `robots.txt` 与 `sitemap.xml` 可公开访问；sitemap.xml 为合法 XML，收录 URL 与 `VITE_SITE_URL` 配置一致。

### P0-4 nginx 静态服务与传输优化

**要求：**

- `nginx.conf` 增加：gzip 压缩（html/js/css/json/svg）、指纹静态资源长缓存、`index.html` 与 sitemap/robots 短缓存或 `no-cache`。
- 显式声明 `location = /robots.txt` 与 `location = /sitemap.xml`，避免被 SPA fallback 兜底（当前 `try_files` 已能命中真实文件，需在配置中明确保留该行为并加注释）。
- 保持现有 SPA fallback 行为不回归。

**验收：**

- 生产环境响应头包含 `Content-Encoding: gzip` 与对应 `Cache-Control`；`/robots.txt`、`/sitemap.xml` 返回 200 且为原始文件内容。

### P1-1 构建期预渲染（关键改造）

**背景：** 纯 CSR 下爬虫（尤其国内搜索引擎）对 JS 渲染支持弱，仅靠 meta 标签无法让正文进入索引。本项目页面少、内容静态、无鉴权，适合构建期预渲染，不需要 SSR。

**要求：**

- 方案选型已确认：采用 vite-ssg（Vue 生态原生、支持路由 meta 与每页独立 HTML、无 puppeteer 下载负担，peer 依赖兼容当前 Vite 6 / Vue 3 / vue-router 4）。
- 本期预渲染 `/character-builder`（主打）与 `/dice` 两个已实现页面为静态 HTML，正文内容（h1、正文文本）直接出现在 HTML 中；`/classes`、`/profile` 待功能完成后按同一方式纳入（见 §7）。
- 预渲染产物中注入 P0-2 的每页 title/description/canonical。
- 404 页可保持 CSR（或按选型方案一并预渲染，待确认）。
- 预渲染不得破坏现有交互（骰娘 3D、车卡流程、localStorage 草稿、Umami 统计）；预渲染页面中不得残留无法水合的副作用代码。

**验收：**

- 对预渲染产物执行 `curl`（或禁用 JS 的无头浏览器抓取），`/character-builder` 与 `/dice` 两个页面 HTML 均可见完整 h1 与正文片段。
- `pnpm build` 通过，预渲染页面在浏览器中水合后功能与改造前一致（手机宽度走查车卡、骰娘主要流程）。
- Lighthouse SEO 审计 ≥ 90（本地对预渲染产物跑分）。

### P2-1 结构化数据（JSON-LD）

**要求：**

- 全站注入 `WebSite` 结构化数据（含 `name`、`url`、`inLanguage=zh-CN`）。
- 首页或全站注入 `WebApplication`（工具类应用，含 `name`、`url`、`applicationCategory=UtilitiesApplication` 与可选的 `offers` 免费说明）；是否追加 `Organization` 待确认（作者名来源 `src/config/site.ts`）。
- 结构化数据使用原创文案，不得虚构评分、评论等未实现字段。
- 可通过 Google 富结果测试工具校验。

**验收：**

- 抓取首页 HTML 可见合法 JSON-LD，无 schema 校验错误。

### P2-2 长期 SEO 策略（本期只记录，不实施）

- 当前主打为 `/character-builder` 辅助车卡页，持续打磨其 title/description 与正文关键词自然分布，观察工具类搜索词的收录与点击。
- 所有对外文案（title/description/页面摘要）遵守版权约定，使用原创转述。
- 不实施：外链购买、关键词堆砌、门页、自动采集等黑帽手段。

## 4. 实施顺序建议

1. P0-1、P0-2、P0-3（无新依赖，一次性提交）。
2. P0-4（nginx，随部署验证）。
3. P1-1（vite-ssg 预渲染，独立提交并跑全量测试与构建）。
4. P2-1（随 P0/P1 交付后执行）。
5. 长期跟进；任何新路由（含后续 `/classes`、`/profile` 正式页）必须同步更新 sitemap 与路由 meta（见 §7）。

## 5. 待确认事项

以下事项在开发前需要确认，确认后更新到 §3 或本列表：

1. `VITE_SITE_URL` 等环境变量的命名、默认值与 `.env.example` 同步方式；正式站点 URL 是否固定为 `https://your_url`。
2. `/character-builder` 与 `/dice` 的 description 具体文案（本文档只约定长度与唯一性要求）。
3. `/classes`、`/profile` 当前保持占位（路由存在但功能未开发），不做 SEO 处理；未来上线时再评估收录方式（见 §7）。
4. 是否追加 `Organization` 结构化数据，以及 `og:image` 图片素材（建议 1200×630）是否单独制作。
5. JSON-LD 采用全站统一注入还是按页面差异化注入。

## 6. 完成标准

本阶段全部完成需同时满足：

- §3 中所有 P0 条目通过各自验收。
- P1-1 预渲染后 `/character-builder` 与 `/dice` 在禁用 JS 情况下可读到正文与独立 meta；Lighthouse SEO ≥ 90。
- `pnpm test:run` 与 `pnpm build` 通过；预渲染引入的依赖与模块拓扑已同步更新 `docs/frontend-architecture.md`。
- 手机宽度下预渲染页面主要流程（车卡、骰娘）无回归，无浏览器控制台错误。
- `/classes`、`/profile` 的 SEO 条目保持 §7 TODO 状态，未擅自开展。

## 7. TODO：功能完成后补充的 SEO 条目

以下条目依赖职业介绍、个人中心功能开发完成，当前不实施：

1. `/classes` 职业介绍页：功能完成后补充独立 title/description、加入 sitemap、纳入预渲染；上线后评估为每个职业建立独立 URL（如 `/classes/<职业ID>`）承接长尾搜索（产品级变更，需另行确认）。
2. `/profile` 个人中心页：功能上线后评估收录策略（个人数据页面默认不收录）与 robots 处理。
3. 职业介绍属商业资料衍生内容，届时相关 SEO 文案须遵守版权约定，使用原创转述。
4. 以上页面加入路由 meta 体系与 sitemap 的时机，以对应功能开发完成并验收为准；在功能完成前，不得以 SEO 为由提前新建或改造这些页面。
