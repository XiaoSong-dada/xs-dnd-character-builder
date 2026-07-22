# 前端目录权限与依赖拓扑

## 1. 文档目的

本文档定义 `app/src` 下各目录能够承担的职责、允许访问的下游以及禁止越过的边界。目标不是提前创建完整目录树，而是让每个模块只拥有完成自身职责所需的最小权限，避免页面、状态、规则和外部副作用逐渐耦合。

开发前应先定位目标入口，并检查目标节点的：

- 扇入：哪些页面、组件或模块调用它；
- 扇出：它依赖哪些 hooks、stores、rules、services、types 或公共能力；
- 影响面：修改后需要同步验证的调用方、数据结构与规则结果。

## 2. 总体依赖方向

```text
main
  -> router
      -> layout / views
          -> features / 页面私有 hooks
              -> stores / services / rules
                  -> types / constants / config / utils

views / features
  -> components
      -> components/ui

所有界面层
  -> styles
```

箭头表示“允许依赖”。下层不得反向导入上层。例如 `rules` 不得导入 `features`，`components` 不得导入 `views`，`stores` 不得导入 `router`。

## 3. 目录权限矩阵

| 目录 | 负责内容 | 可以依赖 | 禁止内容 |
|---|---|---|---|
| `src/router` | 路由注册、路由元信息、页面入口映射 | `views`、`layout`、路由私有类型 | 规则计算、持久化、请求、页面业务状态 |
| `src/views` | 页面级装配、串联功能模块 | `features`、页面私有 hooks、`components` | 直接访问 API、存储、Cookie；实现规则公式 |
| `src/layout` | 页面骨架、导航、公共布局 | `components`、全局 hooks、必要的 stores | 具体车卡步骤和 D&D 规则逻辑 |
| `src/features` | 按业务能力内聚 UI、配置、私有 hooks 与流程编排 | `components`、`stores`、`services`、`rules`、`types`、`constants`、`utils` | 导入 `views`、`layout`、`router`；访问其他 feature 内部文件 |
| `src/components/ui` | Reka UI 的项目级封装与基础视觉组件 | Reka UI、组件私有类型、styles | D&D 业务、stores、rules、services、路由 |
| `src/components` | 已确认跨功能复用的展示组件 | `components/ui`、共享 types、styles | 页面装配、外部请求、持久化、单业务专用逻辑 |
| `src/hooks` | 跨多个功能复用的响应式编排 | `stores`、`services`、`rules`、共享 types | 只服务单页面或单 feature 的 hook |
| `src/stores` | 跨页面共享的原始响应式状态 | `services`、`rules`、types、constants、utils | UI 组件、views、router；重复保存可计算派生值 |
| `src/rules` | 规则数据、派生计算、合法性校验 | rules 内部模块、types、constants、纯 utils | Vue、Pinia、Router、DOM、Cookie、存储、请求和 UI 文案装配 |
| `src/services` | localStorage、Cookie、文件导入导出、未来外部接口编排 | `api`、config、types、纯 utils | views、components、layout、router |
| `src/api` | 真实后端请求封装 | config、协议 types、纯 utils | UI、页面流程、状态管理、规则计算 |
| `src/types` | 跨模块共享类型和协议类型 | 其他 type-only 模块 | 运行时逻辑和副作用 |
| `src/config` | 环境变量与运行配置唯一入口 | `import.meta.env` | 页面或业务流程 |
| `src/constants` | 跨模块稳定常量 | 无，或 type-only 依赖 | 响应式状态、请求、页面逻辑 |
| `src/styles` | 主题令牌、全局样式、通用布局工具、覆盖层 | SCSS 内部模块和静态资源 | 业务状态与组件行为 |
| `src/utils` | 无状态、纯函数、通用工具 | types、constants | Vue 状态、DOM 副作用、请求、Cookie、业务流程 |

## 4. 就近内聚与公共上提

- 仅服务一个页面的 hook 放在 `views/<page>/hooks`。
- 仅服务一个 feature 的组件、hook、配置和类型优先放在 `features/<feature>` 内。
- 只有出现至少两个明确调用方，且语义确实一致时，才允许上提到 `hooks`、`components`、`types`、`constants` 或 `utils`。
- 组件私有类型留在组件目录；跨模块共享类型才进入 `src/types`。
- 不得以“以后可能复用”为理由提前建立公共抽象。
- feature 之间不能深层导入内部文件。如确需共享，抽取公共模块或通过该 feature 的公开入口导出。

## 5. 调用边界

### 页面与外部能力

页面不能直接调用 `localStorage`、Cookie、文件 API 或未来的 HTTP API。推荐调用链为：

```text
view -> feature/page hook -> store或service -> api（如果存在）
```

### 页面与规则

页面不能自行计算属性调整值、HP、AC、技能或法术 DC。推荐调用链为：

```text
view -> feature hook/store -> rules -> derived result
```

### 规则纯度

`rules` 接收普通数据并返回普通数据或校验结果。同一输入必须得到同一输出，不读取浏览器状态，也不直接生成依赖具体页面结构的 UI。

## 6. 导入约定

所有 `src` 内部模块引用使用 `@` 别名：

```ts
import HomeView from '@/views/HomeView.vue'
import type { CharacterDraft } from '@/types/character'
```

禁止：

```ts
import HomeView from '../views/HomeView.vue'
import type { CharacterDraft } from '../../types/character'
```

第三方包使用包名导入。SCSS 模块之间同样优先通过 `@/styles/...` 定位。

## 7. 当前实际拓扑

截至当前基础版本：

```text
src/main.ts
  -> src/App.vue
  -> src/router/router.ts
  -> src/styles/index.scss
  -> Pinia

src/App.vue
  -> Vue Router 的 RouterView

src/router/router.ts
  -> src/views/HomeView.vue

src/styles/index.scss
  -> src/styles/flex.scss
```

当前尚未创建 `features`、`stores`、`rules`、`services`、`api` 等目录。只有出现对应真实职责时才创建。

## 8. 变更复核

完成修改后必须检查：

1. 新文件是否位于职责正确的目录；
2. 是否出现下层反向导入上层；
3. views、components 或 stores 是否越过中间层直接访问外部能力；
4. 单业务逻辑是否被过早上提；
5. 新增、删除、移动模块是否改变本文件的“当前实际拓扑”；
6. 所有 `src` 内部导入是否使用 `@` 别名。

如果依赖关系有变化，在同一修改中更新本文件；如果没有变化，在交付说明中明确写出“已复核前端依赖拓扑，无需更新”。
