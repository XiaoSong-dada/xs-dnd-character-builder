# D&D 5e 2014 快速车卡

一个面向新玩家、移动端优先的 D&D 5e 2014 单职业车卡 Web 应用。项目通过分步引导、规则校验和自动计算，帮助玩家从玩法偏好开始创建角色，并在完成后查看和继续调整角色卡。

> 当前运行时仅支持 `5e-2014`。仓库中的 2024 资料用于未来规则集建设，不会混入当前可编辑草稿。

## 当前能力

- 创建 1—20 级单职业角色，按时间线完成职业技能、子职、专长或属性提升等选择。
- 使用标准数组、27 点自由购点或自定义录入生成六项属性。
- 根据玩法偏好提供可解释的职业推荐；推荐只影响排序，不限制自由选择。
- 选择 2014 种族、子种族、背景、正式背景变体、初始装备和职业法术。
- 自动派生熟练加值、生命值、护甲等级、先攻、技能、攻击、法术攻击和法术豁免 DC，并展示数值来源。
- 校验缺失、冲突或不合法的选择，并引导返回对应步骤修正。
- 在角色完成后调整等级或重新编辑；失效选择会保留并提示复查，不会静默删除。
- 将草稿自动保存在当前浏览器，并支持角色 JSON 导入、导出。
- 隔离旧版 2024 草稿，保留原始数据导出能力。

当前未包含多职业、2024 规则编辑、云同步、PDF 导出和 DM 房规编辑器。“职业介绍”“赛博骰子”“个人中心”目前为开发中占位页。

更完整的规则与实现范围请阅读[规则约定](../docs/rules.md)和[快速车卡实现说明](../docs/quick-build-implementation.md)。

## 技术栈

- Vue 3、TypeScript、Vite
- Vue Router、Pinia
- Reka UI
- SCSS、CSS Variables
- Vitest、Vue Test Utils、happy-dom
- Nginx（容器部署）

## 本地运行

建议使用 Node.js 22 和 pnpm 10。项目的容器构建固定使用 Node.js 22 与 pnpm 10.17.1。

```sh
cd app
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

启动后打开终端显示的本地地址，Vite 默认使用 `http://localhost:5173`。

## 常用命令

```sh
# 启动开发服务器
pnpm dev

# 交互式运行测试
pnpm test

# 单次运行全部测试
pnpm test:run

# 执行 TypeScript 检查并生成生产构建
pnpm build

# 本地预览生产构建
pnpm preview
```

生产构建输出到 `app/dist`。提交修改前至少应运行 `pnpm test:run` 和 `pnpm build`。

## 可选站点配置

复制 `.env.example` 为 `.env.local`，即可配置主页署名。所有字段均为可选；未配置时不会显示对应内容。

```sh
cp .env.example .env.local
```

| 变量 | 用途 |
|---|---|
| `VITE_AUTHOR_NAME` | 主页显示的作者名 |
| `VITE_GITHUB_URL` | 主页 GitHub 图标的跳转地址 |
| `VITE_AUTHOR_TAGLINE` | 预留的作者标语，当前尚未展示 |
| `VITE_APP_VERSION` | 主页显示的版本号 |

Vite 环境变量会在构建时写入前端资源，不要在这些变量中保存密钥或其他敏感信息。

## 数据保存与导入导出

角色草稿保存在浏览器 `localStorage` 中，没有后端或账号同步。清理站点数据、使用无痕窗口或更换浏览器后，原草稿可能不可用；重要角色请及时导出 JSON 备份。

当前角色文件使用 schema v3，并可导入符合要求的 v2 文件；导入时只接受 `5e-2014` 角色。旧 2024 草稿只读隔离，不会自动转换或删除。

## 项目结构

```text
app/
├─ src/
│  ├─ views/        # 路由页面与页面私有流程
│  ├─ features/     # 按业务能力组织的界面模块
│  ├─ components/   # 可复用组件与 UI 基础组件
│  ├─ stores/       # 跨页面原始状态
│  ├─ services/     # 本地存储与 JSON 文件边界
│  ├─ rules/        # 框架无关的规则数据、计算与校验
│  ├─ types/        # 共享业务类型
│  ├─ config/       # 环境变量与运行配置
│  └─ styles/       # 全局主题和布局样式
├─ test/            # 单元测试与组件测试
├─ Dockerfile       # 多阶段生产镜像
└─ nginx.conf       # 静态资源与 SPA 回退配置
```

模块职责、允许依赖与当前拓扑以[前端架构文档](../docs/frontend-architecture.md)为准。规则层保持框架无关，角色草稿只保存原始选择，可计算结果由规则函数重新派生。

## 部署

### 静态部署

运行 `pnpm build` 后，将 `dist` 目录部署到静态服务器。项目使用 Vue Router HTML5 History 模式，服务器必须在找不到真实静态文件时回退到 `index.html`，否则直接访问或刷新以下前端路由会返回 404：

```text
/character-builder
/classes
/dice
/profile
/:pathMatch(.*)*
```

仓库中的 `nginx.conf` 已配置该回退行为。

### Docker

在 `app` 目录构建并运行镜像：

```sh
docker build -t dnd-character-builder .
docker run --rm -p 8080:80 dnd-character-builder
```

然后访问 `http://localhost:8080`。站点信息需要通过构建参数注入，例如：

```sh
docker build \
  --build-arg VITE_AUTHOR_NAME="小宋哒哒" \
  --build-arg VITE_GITHUB_URL="https://github.com/XiaoSong-dada" \
  --build-arg VITE_APP_VERSION="0.1.0" \
  -t dnd-character-builder .
```

## 开发约定

- 产品代码固定在 `app`；`跑团车卡辅助` 仅作为视觉原型项目。
- 当前产品规则基线是 D&D 5e 2014、1—20 级单职业，不得隐式混用 2024 数据。
- `src` 内部模块统一使用 `@` 别名导入。
- Vue 页面负责展示和收集输入，规则计算、持久化与共享状态按目录职责分层。
- 商业资料只保留必要索引与原创摘要；未核验效果不能参与自动计算。
- 修改规则行为时同步更新规则文档和测试；改变模块拓扑时同步更新架构文档。

参与开发前请先阅读仓库根目录的 [`AGENTS.md`](../AGENTS.md)、[规则约定](../docs/rules.md)与[前端架构文档](../docs/frontend-architecture.md)。
