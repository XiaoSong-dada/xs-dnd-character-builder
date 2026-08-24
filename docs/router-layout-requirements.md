# 主布局与路由需求记录

> 本文档持续记录主页面、Layout、底部导航和 Vue Router 基础框架的需求澄清过程。
> 后续开始相关开发前，必须先完整阅读本文档，并以“已确认结论”为当前实现基线；未确认事项不得擅自扩展为业务功能。

## 1. 本阶段目标

- 规划 Vue Router 的基础路由树。
- 规划一个上方内容区、下方导航栏的主 Layout。
- 为四个一级功能建立独立页面入口。
- 当前只搭基础框架，不实现辅助车卡、职业资料、骰子或个人中心的具体业务。
- 在正式开发前通过多轮问答明确路由、布局、导航、占位页面和异常页面要求。

## 2. 当前项目基线

当前已有：

```text
src/main.ts
  -> src/App.vue
      -> RouterView
  -> src/router/router.ts
      -> src/views/HomeView.vue
```

现有 `/` 直接渲染 `HomeView`，尚未建立主 Layout、嵌套路由或四个功能页面。

## 3. 已确认结论

### 第一轮：默认入口与一级路由

#### 问题 1

打开应用时，默认选中哪个功能？

**用户回答：** 打开应用时默认为辅助车卡页面。

**确认结论：**

- 根路径 `/` 进入主框架后，默认显示“辅助车卡”。
- 推荐通过显式重定向进入 `/character-builder`，避免 `/` 和功能页形成两个等价地址。

#### 问题 2

四个导航是否需要各自独立 URL，并支持浏览器前进、后退？

**用户回答：** 需要独立的 URL。

**确认结论：**

- 四个一级功能均建立独立路由。
- 导航切换由 Vue Router 驱动，不使用只存在于组件内部的标签页状态。
- 浏览器刷新、前进和后退应保持当前功能页。

#### 问题 3

是否接受以下英文路径命名？

```text
/character-builder
/assistant
/dice
/profile
```

**用户回答：** 接受以上英文名。

**确认结论：**

| 功能 | 路径 |
| --- | --- |
| 辅助车卡 | `/character-builder` |
| 跑团助手 | `/assistant` |
| 赛博骰子 | `/dice` |
| 个人中心 | `/profile` |

## 4. 已确认路由结构

最终路由结构为：

```text
/
├─ MainLayout
│  ├─ / -> redirect /character-builder
│  ├─ /character-builder
│  ├─ /assistant
│  ├─ /dice
│  └─ /profile
└─ /:pathMatch(.*)* -> 404（MainLayout 外）
```

- `/` 使用显式重定向，不建立第二个辅助车卡页面地址。
- 四个一级页面是 Main Layout 的子路由并显示底部导航。
- 404 位于 Main Layout 之外，不显示底部导航。

## 5. 第二轮：底部导航布局

### 问题 1

导航栏是否固定在屏幕底部，页面内容在上方独立滚动？

**用户回答：** 按照建议，导航栏固定在屏幕底部，内容区独立滚动。

**确认结论：**

- 主 Layout 占满当前视口。
- 内容区是主要滚动容器，滚动时底部导航保持可见。
- 内容区必须为底部导航预留空间，页面末尾内容不能被导航遮挡。
- 移动设备底部安全区域应计入导航栏占位。

### 问题 2

每个导航按钮使用“图标 + 中文文字”，还是只显示文字？

**用户回答：** 使用图标加文字。

**确认结论：**

- 四个一级导航按钮都包含图标和中文名称。
- 图标属于导航配置的一部分，并与对应路由一一映射。
- 当前尚未确认具体图标来源与图形，不能在实施计划中擅自锁定图标库。
- 激活状态不能只依赖颜色，图标或文字还应有可识别的状态变化。

### 问题 3

桌面端是否仍保持底部导航，还是在宽屏下改为左侧导航？

**用户回答：** 所有尺寸都使用底部导航；当前不考虑桌面端，桌面端后续单独制作。

**确认结论：**

- 本阶段只按移动端主框架设计。
- 当前不建立桌面端侧栏、顶栏或响应式导航变体。
- 即使浏览器窗口较宽，也继续显示移动端底部导航结构。
- 桌面版属于后续独立需求，不在本阶段预留未经确认的复杂适配逻辑。

## 6. 第三轮：内容区与占位页面

### 问题 1

Layout 顶部是否需要统一的标题栏？

**用户回答：** 暂时不设置公共标题栏。

**确认结论：**

- Main Layout 只负责内容容器和底部导航，不渲染公共顶部标题栏。
- 页面标题与页面专属操作由各页面自行负责。
- 当前不得为了视觉完整度增加未经确认的返回按钮、工具栏或品牌栏。

### 问题 2

四个页面当前是否只放“页面名称 + 简短的功能开发中提示”？

**用户回答：** 页面名称加简短的功能开发中提示。

**确认结论：**

- 四个一级页面都建立独立 View。
- 每个 View 仅展示对应页面名称和简短占位提示。
- 当前不实现车卡步骤、职业列表、骰子交互、登录、用户资料或本地存储等业务。

### 问题 3

切换底部导航后，页面滚动位置如何处理？

**用户回答：** 首次进入或普通切换时回到顶部。

**确认结论：**

- 首次进入任一一级页面时，内容区位于顶部。
- 通过底部导航普通切换到另一页面时，新页面回到顶部。
- 当前未要求保存四个一级页面各自的滚动位置。
- 浏览器后退时是否恢复历史位置尚未单独确认，暂不作为本阶段验收条件。

## 7. 第四轮：异常路由与页面标题

### 问题 1

用户访问不存在的地址时，是显示独立的“页面不存在”页面，还是直接跳回辅助车卡？

**用户回答：** 显示 404 页面。

**确认结论：**

- 路由表设置最终兜底路由，匹配所有未定义路径。
- 未定义路径渲染独立的 404 View，不静默重定向。
- 404 页面应明确告诉用户当前地址不存在。

### 问题 2

404 页面是否隐藏底部导航，并提供“返回辅助车卡”按钮？

**用户回答：** 隐藏底部导航，并提供“返回辅助车卡”按钮。

**确认结论：**

- 404 路由位于 Main Layout 之外，或通过等价结构确保不渲染底部导航。
- 页面提供明确按钮，目标为 `/character-builder`。
- 返回按钮使用路由导航，不依赖浏览器必须存在可返回的历史记录。

### 问题 3

是否需要根据路由修改浏览器标签页标题？

**用户回答：** 按照建议，根据路由设置浏览器标签页标题。

**确认结论：**

- 每个一级路由和 404 路由都在路由元信息中提供页面标题。
- 路由切换完成后统一更新 `document.title`，不由各 View 分散维护。
- 采用以下标题：

```text
辅助车卡 | D&D车卡辅助
跑团助手 | D&D车卡辅助
赛博骰子 | D&D车卡辅助
个人中心 | D&D车卡辅助
页面不存在 | D&D车卡辅助
```

## 8. 第五轮：导航图标与激活状态

### 问题 1

基础框架是引入图标库，还是先使用项目内的 SVG 图标？

**用户回答：** 先使用项目内的 SVG 图标。

**确认结论：**

- 本阶段不为底部导航新增图标依赖。
- 四个图标作为项目本地静态或组件资源维护。
- SVG 应继承当前文字颜色，便于统一表现激活和未激活状态。

### 问题 2

是否接受“角色卡、打开的书、骰子、用户头像”四种图标含义？

**用户回答：** 接受。

**确认结论：**

| 功能 | 图标语义 |
| --- | --- |
| 辅助车卡 | 剪贴板或角色卡 |
| 跑团助手 | 打开的书 |
| 赛博骰子 | 骰子 |
| 个人中心 | 用户头像 |

- 图标只承担辅助识别作用，导航必须同时保留中文文字。
- SVG 本身应对辅助技术隐藏，由链接文字提供可访问名称，避免重复朗读。

### 问题 3

激活项是否使用“主题色图标和文字 + 浅色背景”，未激活项使用灰色？

**用户回答：** 接受建议。

**确认结论：**

- 激活项使用主题色图标、主题色文字和浅色背景。
- 未激活项使用较弱的中性色。
- 激活状态还需要通过背景、字重或形状等非颜色线索表达。
- 当前只确认状态表达方式，具体颜色值由后续视觉规范决定。

## 9. 第六轮：文件职责与命名

### 问题 1

是否接受初步提出的 Layout、页面和路由文件名称？

**用户回答：** 接受 Layout 和其他基础文件方向，但不接受把页面直接平铺在 `views` 下。每个页面必须拥有自己的页面目录，目录内可包含页面私有的 `hooks` 与 `components`，入口使用 `index.vue`，并且入口只负责组装，不处理实际逻辑。

**确认结论：**

- 页面不得以多个 `*View.vue` 文件直接平铺在 `src/views` 根目录。
- 每个页面使用独立目录。
- 页面目录约定为：

```text
src/views/<页面目录>/index.vue
src/views/<页面目录>/hooks/**
src/views/<页面目录>/components/**
```

- `index.vue` 是路由页面入口，只负责页面级组装和占位展示。
- 页面私有状态编排放在该页面的 `hooks` 下，页面私有组件放在 `components` 下。
- 目前尚未确认五个页面目录的精确英文命名方式。

### 问题 2

现有 `HomeView.vue` 是否由辅助车卡页面取代？

**用户回答：** 接受由 CharacterBuilderView 取代。

**确认结论：**

- 现有 `HomeView.vue` 不再保留为独立首页。
- `/` 只负责重定向，默认业务入口是辅助车卡页面。
- 辅助车卡页面的最终文件路径仍需结合页面目录命名规则确认。

### 问题 3

底部导航是否单独拆成 `BottomNavigation.vue`，Main Layout 只负责内容区和整体骨架？

**用户回答：** 接受。

**确认结论：**

```text
src/layout/MainLayout.vue
src/layout/components/BottomNavigation.vue
```

- `MainLayout.vue` 负责全高骨架、内容滚动容器、嵌套 `RouterView` 和底部导航装配。
- `BottomNavigation.vue` 负责四个一级导航入口、图标、文字和激活状态。
- `BottomNavigation.vue` 不承载任何具体页面业务逻辑。

## 10. 第七轮：页面目录命名与 Hook 强制规则

### 问题 1

页面目录是否采用与 URL 对应的 kebab-case 小写命名？

**用户回答：** 接受。

**确认结论：**

```text
src/views/character-builder/index.vue
src/views/session-assistant/index.vue
src/views/dice/index.vue
src/views/profile/index.vue
src/views/not-found/index.vue
```

### 问题 2

当前没有页面私有业务时，是否暂不创建空的 `hooks` 和 `components` 目录？

**用户回答：** 必须创建 `hooks`。页面不可能没有 Hook；所有逻辑都写在 Hook 中，`index.vue` 只引入 Hook 的逻辑。

**确认结论：**

- 五个页面目录在基础框架阶段就必须建立 `hooks` 子目录。
- 页面相关逻辑不得直接写在 `index.vue`。
- `index.vue` 只调用页面私有 Hook、接收其返回值并组装模板。
- 页面 `components` 目录是否必须在当前阶段建立，尚未确认。
- 每个页面 Hook 的具体文件名和占位文案归属尚未确认。

### 问题 3

`CharacterBuilderView` 只表示页面职责，实际入口使用 `character-builder/index.vue`，是否符合用户意图？

**用户回答：** 符合。

**确认结论：**

- 不创建 `CharacterBuilderView.vue` 文件。
- `src/views/character-builder/index.vue` 在语义上取代现有 `HomeView.vue`。
- 其他页面同样遵守“页面目录 + `index.vue`”入口方式。

## 11. 第八轮：页面 Hook 与私有组件

### 问题 1

是否接受五个页面 Hook 的建议命名？

**用户回答：** 接受。

**确认结论：**

```text
src/views/character-builder/hooks/useCharacterBuilderPage.ts
src/views/session-assistant/hooks/useSessionAssistantPage.ts
src/views/dice/hooks/useDicePage.ts
src/views/profile/hooks/useProfilePage.ts
src/views/not-found/hooks/useNotFoundPage.ts
```

### 问题 2

页面名称和占位提示是否由 Hook 返回，404 的返回方法是否也放在页面 Hook 中？

**用户回答：** 接受。

**确认结论：**

- 四个一级页面 Hook 返回页面标题和简短的“功能开发中”提示。
- 对应 `index.vue` 只调用 Hook 并展示其返回内容。
- `useNotFoundPage` 返回 404 页面文案和前往 `/character-builder` 的操作。
- 页面入口不得直接调用 Router 实例、编写跳转逻辑或维护页面状态。

### 问题 3

当前是否创建没有实际内容的页面 `components` 目录？

**用户回答：** 不建立。

**确认结论：**

- 本阶段每个页面只创建 `index.vue` 和 `hooks/use<Page>Page.ts`。
- 出现需要拆分的页面私有组件后，再建立该页面的 `components` 目录。
- 不创建空目录或无职责占位组件。

## 12. 第九轮：Layout 逻辑与 SVG 位置

### 问题 1

是否使用 `useMainLayout` 处理内容滚动容器和路由切换复位？

**用户回答：** Layout 不采用页面的 Hook 方式，直接把对应逻辑写在 Vue 文件中。

**确认结论：**

- 不创建 `src/layout/hooks/useMainLayout.ts`。
- `MainLayout.vue` 可以直接维护内容容器引用，并监听路由切换执行滚动复位。
- “页面逻辑必须位于页面 Hook”只约束 `src/views` 下的页面入口，不强制套用于 Layout。
- Main Layout 中仍不得出现任何具体页面业务规则。

### 问题 2

是否使用 `useBottomNavigation` 返回四个导航项配置？

**用户回答：** 接受。

**确认结论：**

```text
src/layout/hooks/useBottomNavigation.ts
```

- Hook 返回导航路径、中文文字和 SVG symbol ID。
- `BottomNavigation.vue` 只负责调用 Hook、循环渲染 `RouterLink` 和展示状态。
- 导航配置不得散落在模板的多个分支中。

### 问题 3

是否把四个图标放在一个本地 SVG Sprite 文件中？

**用户回答：** 接受。

**确认结论：**

```text
src/assets/icons/navigation.svg
```

- Sprite 包含角色卡、打开的书、骰子和用户头像四个 symbol。
- symbol 使用 `currentColor`，跟随导航项激活颜色。
- Bottom Navigation 通过 symbol ID 引用，不新增第三方图标依赖。

## 13. 第十轮：路由加载与重复点击

### 问题 1

页面组件是否使用动态导入进行懒加载？

**用户回答：** 懒加载。

**确认结论：**

- 五个页面 View 均通过动态 `import()` 注册。
- Main Layout 使用普通导入，作为四个一级页面共享的稳定骨架。
- 不为当前占位页面增加额外的自定义加载动画。

### 问题 2

是否接受建议的路由名称？

**用户回答：** 接受。

**确认结论：**

```text
character-builder
session-assistant
dice
profile
not-found
```

- 导航配置优先使用具名路由，减少路径字符串分散。
- 路由名称保持稳定，后续页面内部跳转不得使用中文显示名作为关联键。

### 问题 3

再次点击当前已经激活的底部导航时如何处理？

**用户回答：** 不重复导航，也不触发额外行为；只有切换到其他导航时才将内容区滚动到顶部。

**确认结论：**

- 当前激活项重复点击时不调用 `router.push`，不滚动，也不刷新页面。
- 从一个一级页面切换到另一个一级页面时，Main Layout 内容容器滚动到顶部。
- 激活判断使用当前路由名称或等价的可靠路由状态，不通过 DOM class 反向推断。

## 14. 第十一轮：History、样式与验收

### 问题 1

是否继续使用 `createWebHistory`，并要求部署服务器把未知前端路径回退到 `index.html`？

**用户回答：** 保留；部署时要求服务器把未知前端路径回退到 `index.html`。

**确认结论：**

- Router 继续使用 `createWebHistory(import.meta.env.BASE_URL)`。
- 部署说明必须标明 SPA History 回退要求。
- 直接访问或刷新 `/character-builder`、`/assistant`、`/dice`、`/profile` 和任意前端 404 地址时，服务器都应返回应用入口，由 Vue Router 完成匹配。

### 问题 2

Layout 私有样式是否使用组件内的 scoped SCSS，全局只维护视口、重置和主题变量？

**用户回答：** 接受。

**确认结论：**

- `MainLayout.vue` 和 `BottomNavigation.vue` 的私有样式保留在各自的 `<style scoped lang="scss">`。
- 页面占位展示的私有样式保留在页面入口或未来页面私有组件中。
- `src/styles` 只补充 `html`、`body`、`#app` 的视口基础、必要重置和可复用主题变量。
- 不为当前基础框架提前建立复杂设计系统。

### 问题 3

本阶段是否不新增测试依赖，并按建议的类型检查、构建和移动端人工流程验收？

**用户回答：** 接受。

**确认结论：**

- 当前不引入单元测试或端到端测试框架。
- 必须执行 TypeScript 类型检查和生产构建。
- 必须在 375px 与 430px 手机宽度人工检查完整导航、滚动、安全区、404 与刷新行为。

## 15. 最终文件计划

计划新增或调整：

```text
app/src/App.vue
app/src/router/router.ts

app/src/layout/MainLayout.vue
app/src/layout/components/BottomNavigation.vue
app/src/layout/hooks/useBottomNavigation.ts

app/src/assets/icons/navigation.svg

app/src/views/character-builder/index.vue
app/src/views/character-builder/hooks/useCharacterBuilderPage.ts

app/src/views/session-assistant/index.vue
app/src/views/session-assistant/hooks/useSessionAssistantPage.ts

app/src/views/dice/index.vue
app/src/views/dice/hooks/useDicePage.ts

app/src/views/profile/index.vue
app/src/views/profile/hooks/useProfilePage.ts

app/src/views/not-found/index.vue
app/src/views/not-found/hooks/useNotFoundPage.ts

app/src/styles/index.scss
app/README.md
docs/frontend-architecture.md
```

计划删除：

```text
app/src/views/HomeView.vue
```

必要时补充 Router 私有类型声明，用于约束 `RouteMeta.title`；不创建与本阶段无关的 `features`、`stores`、`services` 或页面私有 `components`。

## 16. 最终实施计划

### 步骤 1：建立页面骨架

- 建立五个页面目录、入口与页面私有 Hook。
- 四个一级页面 Hook 返回页面名称和开发中提示。
- 404 Hook 返回错误文案和前往辅助车卡的操作。
- 页面入口只调用 Hook 并组装展示。

### 步骤 2：建立 Main Layout

- 创建占满移动端视口的布局。
- 上方内容区作为独立滚动容器。
- 下方装配固定底部导航并处理安全区。
- Main Layout 直接监听一级子路由切换，并在切换到不同页面时把内容区滚动到顶部。
- 不增加公共顶部标题栏。

### 步骤 3：建立底部导航

- `useBottomNavigation` 集中提供具名路由、中文标签和 SVG symbol ID。
- `BottomNavigation.vue` 渲染四个等宽的 Router 导航入口。
- 当前项重复点击不触发导航或滚动。
- 激活项使用主题色、浅色背景和非颜色状态差异；未激活项使用中性色。
- 图标对辅助技术隐藏，中文文字提供可访问名称。

### 步骤 4：建立本地图标

- 在 `navigation.svg` 中提供角色卡、打开的书、骰子和用户头像四个 symbol。
- 图形使用 `currentColor`，不新增图标库。

### 步骤 5：重构路由

- 保留 `createWebHistory`。
- `/` 重定向至具名路由 `character-builder`。
- 四个一级页面放入 Main Layout 的子路由并全部懒加载。
- 404 页面放在 Main Layout 之外并懒加载。
- 每条页面路由提供标题元信息。
- 路由完成后统一更新浏览器标题。

### 步骤 6：清理与同步文档

- 删除失去职责的 `HomeView.vue`。
- 确认所有 `src` 内部导入使用 `@` 别名。
- 按实际落地结果更新 `docs/frontend-architecture.md` 的当前拓扑。
- 部署说明中记录 History 回退到 `index.html` 的要求。

### 步骤 7：验证

- 运行 TypeScript 类型检查和生产构建。
- 检查根路径重定向、四个独立 URL、直接刷新和浏览器前进后退。
- 检查导航激活状态、不同导航间切换滚动到顶部、当前导航重复点击无行为。
- 检查 404 不显示底部导航，并可返回辅助车卡。
- 检查五个浏览器标题。
- 在 375px 和 430px 宽度检查触控区域、内容滚动、导航固定和底部安全区。

## 17. 明确不在本阶段实现

- 辅助车卡实际步骤和规则逻辑。
- 职业列表、详情和筛选。
- 真实骰子动画与随机逻辑。
- 登录、账号、个人资料和持久化。
- 桌面端专用布局。
- 公共顶部标题栏。
- 路由切换动画或自定义懒加载动画。
- 新图标库、测试框架或提前建立空的页面 `components` 目录。

## 18. 问答记录规则

每轮问答完成后必须：

1. 原样概括问题和用户回答。
2. 将回答转成可实施、可验证的确认结论。
3. 区分“已确认结论”和“当前假设”。
4. 新问题不得覆盖旧结论；存在冲突时先向用户复核。
5. 所有关键问题完成后，再在本文档中形成最终实施计划和验收标准。

## 19. 当前状态

- 需求澄清状态：已完成。
- 已完成轮次：11。
- 最终实施计划：已形成。
- 基础框架实施状态：已完成。
- 已实现范围：五个占位页面及私有 Hook、Main Layout、底部导航、本地 SVG Sprite、嵌套路由、404 与页面标题。
- 下一步：后续业务页面开始开发前，继续以本文档和 `frontend-architecture.md` 的页面职权约定为基线。
- 允许开始编码：是；本阶段仅限已经确认的基础框架范围，新增业务功能仍需单独确认。
