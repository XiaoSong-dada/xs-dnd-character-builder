# 构建与部署环境需求记录

> 本文档持续记录**构建与部署链路**的环境基线：哪些现象属于仓库代码问题、哪些属于宿主机或工具链问题，以及各自的识别方式、隔离做法与验收基线。
> 后续遇到构建失败、部署失败或产物异常时，必须先完整阅读本文档，按 §2、§3 的判定规则先分流问题归属，再决定是否改动仓库代码；未确认事项不得直接改 Dockerfile、构建配置或业务代码去"绕开"现象。

相关文档：

- [`需求文档/PWA离线与可安装-更新计划.md`](需求文档/PWA离线与可安装-更新计划.md)：PWA 离线外壳、预缓存策略与决策 4（预缓存体积上限）的完整依据。
- [`../app/Dockerfile`](../app/Dockerfile)、[`../docker-compose.yml`](../docker-compose.yml)、[`../deploy.sh`](../deploy.sh)、[`../.dockerignore`](../.dockerignore)：本链路涉及的全部构建文件。
- [`../app/vite.config.ts`](../app/vite.config.ts)：workbox 预缓存配置的唯一来源。

## 1. 本阶段目标

- 让"部署构建失败"这类问题在**不修改仓库代码**的前提下也能被准确定位与分流，避免把宿主机环境问题当成代码缺陷反复排查。
- 固定两条高频故障的识别信号、判定依据与验收方式：构建上下文泄漏（§3）与预缓存体积顶线（§4）。
- 明确生产验收的**唯一基线**是 Linux 服务器／CI 上的 `deploy.sh` 构建，本地 Windows 构建只用于冒烟，不作为验收依据。
- 不改变现有构建产物的结构、不引入新的构建工具、不为环境问题在仓库里增加"绕开"代码。

## 2. 当前基线（现状盘点）

### 2.1 工具链版本（实测环境）

| 组件 | 版本／形态 | 说明 |
| --- | --- | --- |
| 构建机（本地） | Windows + Docker Desktop 28.5.1，BuildKit v0.25.1 | 有 `default` 与 `desktop-linux` 两个 builder |
| 构建机（生产） | Linux 服务器，`deploy.sh` 调用 `docker compose up --build --pull always` | 生产验收基线 |
| 容器内 Node | `node:22-alpine`，pnpm 10.17.1（`corepack prepare` 固定） | 见 `app/Dockerfile` |
| 运行阶段 | `nginx:1.27-alpine`，`app/nginx.conf` | 静态托管 `dist/` |

### 2.2 构建链路形态

- 构建上下文是**仓库根目录**（`docker-compose.yml` 的 `build.context: .`），Dockerfile 为 `app/Dockerfile`。
- `app/Dockerfile` 的 builder 阶段顺序固定：装 pnpm → `COPY app/package.json app/pnpm-lock.yaml` → `pnpm install --frozen-lockfile` → `COPY app/ .` → `COPY docs/ ../docs/` → `pnpm build`。
- `pnpm build` = `vue-tsc -b && vite-ssg build`；`prebuild` 会先跑 `scripts/build-item-catalog.mjs` 生成物品目录。
- `docs/` 必须在上下文内：物品目录的 Markdown 审计源在构建期参与生成，这也是 `.dockerignore` 只排除依赖与产物、不排除文档目录的原因。
- `.dockerignore`（仓库根，59 字节）排除：`node_modules`、`dist`、`.git`、`.env`、`.env.*`（保留 `.env.example`）、`*.log`、`tmp`。

### 2.3 实测的环境事实（本文档的判定依据来源）

- 上下文**过滤正常**时传输量约 **105 kB ～ 17 MB**（纯源码 + `docs/`）。
- 上下文**未过滤**时传输量 **298 MB ～ 431 MB**（含 `app/node_modules` 约 280 MB 与历史 `dist`）。
- 宿主机 `app/node_modules` 由 pnpm 建立，含大量 junction／symlink（Windows 上是 junction，指向 `node_modules/.pnpm/...`）。
- 泄漏发生后容器内 `node_modules` 约 427 MB，顶层版本仍是宿主机的（带着 `.vite-temp`、`.vite` 等宿主痕迹）。

## 3. 需求条目

优先级约定：P0 为阻塞部署必须处理项，P1 为诊断与防复发项，P2 为长期运营项。

### P0-1 生产构建以 Linux 侧为唯一验收基线

**要求：**

- 生产验收只看 Linux 服务器／CI 上经 `deploy.sh` 的构建结果；本地 Windows 构建仅用于冒烟，**不得**作为"部署可用"的依据。
- 理由：`deploy.sh` 会先 `git pull --ff-only` 后构建，Linux 上上下文来自 git 工作区且 `.dockerignore` 稳定生效；Windows Docker Desktop 存在 §3 P0-2 的宿主侧不确定性。
- 任何"本地能构建、服务器失败"或反之的分歧，先按 §2.3 的传输量信号判定归属，再决定是否改代码。

**验收：**

- 一次发布中，Linux 侧 `deploy.sh` 输出的 `APP_BUILD_ID` 与 `app/scripts/app-build-id.ts` 规则一致。
- Linux 侧构建日志中 `transferring context` 为 MB 级（不含 `node_modules`），且 `pnpm build` 完整退出码为 0。

### P0-2 构建上下文泄漏的识别与隔离（Windows 本地）

**现象与根因（已实测确认）：**

- 现象：`RUN pnpm build` 报 `Cannot find module '/app/node_modules/vue-tsc/bin/vue-tsc.js'`，或 `vue-tsc -b` 之外的阶段出现莫名其妙的模块缺失。
- 根因：`.dockerignore` 在该环境下**间歇性失效**，`COPY app/ .` 把宿主机 `node_modules` 覆盖进容器，其中 pnpm 的软链接被解析成 Windows 绝对路径（`C:/Users/.../node_modules/.pnpm/...`），在 Linux 容器内全部成为断链。
- 对照实验（同机、同文件、同一份 `.dockerignore`）：

  | 组 | 条件 | `transferring context` | 容器内结果 |
  | --- | --- | --- | --- |
  | A | 保留构建缓存 | 298.43 MB | `.vite-temp` 在场、`vue-tsc → C:/Users/...`、427 MB |
  | B | `docker builder prune -af` 后 | 343.32 MB | 同样泄漏 |

  结论：**清构建缓存不解决问题**；`.dockerignore` 文件内容本身合法（59 字节、无 BOM、LF、纯源码时传输量 105.81 kB），失效发生在 Docker Desktop 的上下文传输环节。

**要求：**

- 判定只看构建日志的 `transferring context` 体积：**超过约 20 MB 即判定泄漏**（正常应在 105 kB～17 MB 区间）。
- 出现泄漏时，本地隔离做法（全部为环境操作，不修改仓库文件）：
  1. 构建前把 `app/node_modules` 移出工作区（如移到临时目录）；
  2. 执行 `docker compose build app`；
  3. 构建结束后立刻移回原位，并用 `ls app/node_modules/vue-tsc/bin/vue-tsc.js` 复核依赖完整。
- **禁止**为了绕开该现象去改 `app/Dockerfile`、`.dockerignore` 或引入 `npm install` 之类的替代安装步骤：那会把宿主机问题固化进仓库，并破坏 `docs/` 参与构建的既有设计。
- 宿主机重新安装依赖后（pnpm 可能在无 TTY 下中止），先确认 `vue-tsc`、`vite`、`vite-ssg` 三个入口存在再尝试构建。

**验收：**

- 在泄漏状态下能仅凭日志一行（`transferring context: <体积>`）判定问题归属，不需要读完整个构建输出。
- 按上述隔离步骤构建后，容器内 `node /app/node_modules/vue-tsc/bin/vue-tsc.js --version` 正常输出，`pnpm build` 走完全流程。

### P0-3 预缓存体积不得被"上限文案"误判

**现象与根因（已实测确认）：**

- 现象：`vite-ssg build` 在 `closeBundle` 阶段抛错，构建失败，报错形如：

  ```
  Configure "workbox.maximumFileSizeToCacheInBytes" to change the limit: the default value is 2 MiB.
  Assets exceeding the limit:
    - assets/CharacterMediaEditor.vue_vue_type_style_index_0_scoped_eb1be509_lang-<hash>.js is 3.52 MB, and won't be precached.
  ```

- 机制：workbox 只把超限文件记成一条 warning 并跳过；`vite-plugin-pwa` 在 `closeBundle` 阶段**把这条 warning 升级成异常**，于是 `dist/` 已经产出、`sw.js` 没写成、整个构建以非零码结束。
- 判定陷阱：那句 "the default value is 2 MiB." 是插件源码里**硬编码**的文案，配了 3 MiB 或 5 MiB 也照样这么印。**不得**据此推断"配置没生效"，否则会跑去查容器里的 `vite.config.ts`、`.dockerignore`、构建缓存等错误方向。
- 唯一判定依据：`ls -l app/dist/assets` 里最大 chunk 的字节数，与 `app/vite.config.ts` 中 `maximumFileSizeToCacheInBytes` 的实际取值对比。

**要求：**

- 体积上限的唯一事实源是 `app/vite.config.ts` 的 `maximumFileSizeToCacheInBytes`（当前 4 MiB），本文档与 PWA 文档只记录其数值演进，不另立配置。
- 上限调整必须同时更新三处：`app/vite.config.ts` 的注释、[`需求文档/PWA离线与可安装-更新计划.md`](需求文档/PWA离线与可安装-更新计划.md) 决策 4、本文档 §4 的实测数据。
- 该 chunk 的文件名（`CharacterMediaEditor...`）与内容无关：Rollup 按 chunk 内某个模块名命名，实际内容是骰娘页的 3D 引擎（three + cannon-es）。排障时不得按文件名推断内容。

**验收：**

- 构建日志出现 `precache <N> entries (<体积>)` 与 `files generated`，且退出码为 0。
- 生成的 `dist/sw.js` 中该 3D 引擎 chunk 在清单内，`og-image.png` 不在清单内。

### P1-1 体积基线与复测方式

**要求：**

- 以下数据为 v1.10.0 实测基线，后续每次规则数据或 3D 资源扩容后复测并更新：

  | 项目 | 基线值 |
  | --- | --- |
  | 3D 引擎 chunk | 3,521,662 字节（3.36 MiB / 3.52 MB），gzip 约 0.87 MB |
  | `maximumFileSizeToCacheInBytes` | 4 MiB（余量约 0.64 MiB） |
  | 预缓存清单 | 41 条，原始体积 7167.70 KiB |
  | 预渲染页面 | 6 个（`/`、`/character-builder`、`/assistant`、`/dice`、`/about`、404） |
  | 上限阈值实测 | 2 MiB / 3 MiB：33 条、3.62 MiB、1 条 warning、**不含**该 chunk；4 MiB：34 条、6.98 MiB、0 warning、**含**该 chunk |

- 复测方式（只读，不需要完整构建）：对 `app/dist` 调用 `workbox-build` 的 `getManifest`，分别传入不同 `maximumFileSizeToCacheInBytes`，比较条目数、体积、warning 数与是否包含目标 chunk。
- 余量不足时的决策顺序：先量实际最大 chunk → 判断是继续放宽上限，还是改走 PWA 文档决策 2 的"运行时按需缓存 + 一键下载"路线。**不得**在不量化的情况下反复上调上限。

**验收：**

- 每次调整上限后，上表四项数据与实际产物一致，且三处文档同步。

### P1-2 故障分流的固定动作

**要求：**

遇到构建失败时，按以下顺序执行，避免直接改代码：

1. 看 `transferring context` 体积 → 判定是否上下文泄漏（§3 P0-2）。
2. 看失败阶段：`vue-tsc -b` 之前的模块缺失属依赖层（多半是 §3 P0-2）；`closeBundle` 阶段报 `Assets exceeding the limit` 属体积层（§3 P0-3）。
3. 看报错里的文件路径与体积，对照 `app/dist/assets` 实测值，不采信插件的"默认值"文案。
4. 上述都不成立时，才回到代码层排查，并按 `.agents/AGENTS.md` 的修改流程执行。

**验收：**

- 一次故障排查中，能在改任何代码之前给出问题归属结论（仓库代码 / 宿主机环境 / 工具链），并留下对应日志依据。

### P2-1 长期跟进（本期只记录，不实施）

- 是否在钩子或 CI 前置一步"上下文体积预检"，把泄漏挡在构建之前。
- 是否在 Linux 侧固定 Docker/BuildKit 版本，避免宿主机升级改变上下文传输行为。
- 是否把 3D 引擎拆成独立 vendor chunk（`manualChunks`）以缩小单个体积单元——属于结构优化，需单独评估离线可用性影响。
- 本地 Windows 环境若能通过 Docker Desktop 配置（如文件共享方式）稳定消除泄漏，可把 §3 P0-2 的隔离步骤降级为备选方案。

## 4. 已确认结论

1. 构建上下文泄漏属**宿主机环境现象**，不是仓库缺陷；仓库侧不改 Dockerfile、不改 `.dockerignore`、不改安装步骤。判定信号是 `transferring context` 体积。
2. 清构建缓存（`docker builder prune`）**不能**解决泄漏；实测两组都泄漏。
3. 生产验收基线是 Linux 侧 `deploy.sh` 构建；本地 Windows 构建只做冒烟。
4. 预缓存体积上限的唯一事实源是 `app/vite.config.ts`；插件的 "default value is 2 MiB" 文案不可作为配置是否生效的依据。
5. 上限数值演进（v1.9.0 接入时 3 MiB → v1.10.0 起 4 MiB）与其依据，统一记录在 PWA 文档决策 4，本文档只引用不重述理由。

## 5. 实施顺序建议

1. §3 P0-2、P0-3 的识别步骤：遇故障时立即执行，无需提前改动。
2. §3 P1-1 的复测脚本化：下次体积变更时执行。
3. §3 P1-2 的分流动作：随本文档生效。
4. §3 P2-1：按需要单独立项。

## 6. 待确认事项

以下事项在动手前需要确认，确认后更新到 §3 或本列表：

1. 是否需要在 `deploy.sh` 或钩子中加入"上下文体积预检"（会改动脚本，属代码变更，需单独确认）。
2. Linux 服务器上是否曾出现同类上下文泄漏（目前无证据，判定为 Windows 本地特有）。
3. 3D 引擎拆 chunk 的收益与离线影响是否需要单独立项评估。
4. 本机 Docker Desktop 的文件共享方式（同步文件共享 / 传统共享）是否与泄漏相关，尚未验证。

## 7. 完成标准

本阶段全部完成需同时满足：

- §3 的 P0 条目各自通过验收，且识别步骤在无文档作者在场时也能照做。
- 连续两次部署构建（Linux 侧）在构建日志中留下可核对的 `transferring context` 体积与 `precache <N> entries` 记录。
- 三处文档（本文档、PWA 文档决策 4、`app/vite.config.ts` 注释）中的体积数据一致。
- 未因环境问题修改 `app/Dockerfile`、`.dockerignore` 或构建脚本。
