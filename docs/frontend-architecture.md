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

0.7.0 来源与工匠更新未改变上述依赖方向。新的规则拓扑为：`views/components → rules/source-books | rules/timeline | rules/spellcasting → rules/repository → types`；`services/draft-storage` 在迁移边界读取纯规则仓库，不反向引用 store 或 UI。

箭头表示“允许依赖”。下层不得反向导入上层。例如 `rules` 不得导入 `features`，`components` 不得导入 `views`，`stores` 不得导入 `router`。

## 3. 目录权限矩阵

| 目录 | 负责内容 | 可以依赖 | 禁止内容 |
|---|---|---|---|
| `src/router` | 路由注册、路由元信息、页面入口映射 | `views`、`layout`、路由私有类型 | 规则计算、持久化、请求、页面业务状态 |
| `src/views` | 路由页面目录、页面入口装配、页面私有配置与组件 | 页面私有 hooks、`features`、`components` | 在 `index.vue` 中维护业务状态、生命周期或副作用；直接访问 API、存储、Cookie；实现规则公式 |
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

## 4. 页面目录与职权收束

每个可路由页面必须使用独立目录，入口统一命名为 `index.vue`。页面目录按实际职责逐步形成：

```text
src/views/<page>/
  index.vue
  hooks/
    use<Page>Page.ts
  components/       # 存在真实页面私有组件时才创建
  column.ts         # 存在页面私有表格列配置时才创建
  form.ts           # 存在页面私有表单配置时才创建
  dictionary.ts     # 存在页面私有字典时才创建
  config.ts         # 存在其他页面私有静态配置时才创建
```

除 `index.vue` 与 `hooks` 外，其余目录和文件均按需创建，禁止为了保持目录外观而预建空目录或占位文件。

### `index.vue` 的职责

`index.vue` 是路由页面的唯一入口，只负责组装，不承载实际页面逻辑。允许的内容包括：

- 引入并调用页面私有 hooks；
- 引入页面私有配置、页面私有组件和已确认可复用的公共组件；
- 将 hooks 返回的状态和动作绑定到模板；
- 组织组件层级、插槽、属性与事件。

禁止在 `index.vue` 中：

- 声明和维护页面业务状态；
- 编写 `computed`、`watch`、生命周期副作用或异步流程；
- 直接请求数据、读写存储或调用浏览器外部能力；
- 编写规则计算、合法性判断或复杂业务分支；
- 用内联逻辑替代本应属于页面 hook、feature、store、service 或 rule 的职责。

即使页面当前只有标题和“功能开发中”提示，也必须通过页面 hook 提供展示模型，由 `index.vue` 完成绑定与渲染。简单的模板表达式可以保留，但不能借此在模板中堆积业务判断。

### 页面私有 hooks 的职责

每个可路由页面必须建立 `hooks` 目录，并至少提供一个页面入口 hook。简单页面可以从 `use<Page>Page.ts` 开始；复杂度增长后，应按独立职责继续拆分，例如：

```text
hooks/
  useClassesPage.ts
  useClassSearch.ts
  useClassFilter.ts
  useClassDialog.ts
```

页面 hook 负责页面状态、派生状态、监听、生命周期、用户动作和流程编排。一个 hook 出现多个彼此独立的状态簇或交互流程时，应按表格、搜索、筛选、弹窗、工具栏、选择器、绑定关系等职责拆开，避免形成“万能 hook”。

页面私有 hook 可以组合其他页面 hooks、feature、store、service 与 rule，但仍须遵守本文件的依赖方向。它不能把网络、存储或规则公式重新实现在页面层，也不能返回具体 DOM 或 VNode 代替组件渲染。

### 页面私有组件与配置

- 只被单个页面使用的组件放在 `views/<page>/components`，存在真实组件时才创建该目录。
- 页面私有组件负责局部展示和交互输入；跨组件的页面流程仍由页面 hooks 编排。
- 只服务当前页面的列定义、表单结构、字典和静态配置留在页面目录，不上提到公共目录。
- 组件自身的 props、emits 等私有类型可以与组件就近放置；跨页面、跨 hook 使用的业务数据契约应进入 `src/types/<domain>`。
- 当同一组件、hook、配置或类型已有至少两个明确调用方，且语义确实一致时，才评估上提。

### 页面结构示例

简单页面：

```text
src/views/dice/
  index.vue
  hooks/
    useDicePage.ts
```

职责较多的页面：

```text
src/views/session-assistant/
  index.vue
  hooks/
    useSessionAssistantPage.ts
    useSessionPanel.ts
  components/
    SessionPanel.vue
```

该约定参考了成熟业务页面按表格、搜索、弹窗、工具栏等职责拆分私有 hooks 的实践，但本项目进一步要求入口 `index.vue` 完全收束为装配层。

## 5. 就近内聚与公共上提

- 仅服务一个页面的 hook 放在 `views/<page>/hooks`。
- 仅服务一个 feature 的组件、hook、配置和类型优先放在 `features/<feature>` 内。
- 只有出现至少两个明确调用方，且语义确实一致时，才允许上提到 `hooks`、`components`、`types`、`constants` 或 `utils`。
- 组件私有类型留在组件目录；跨模块共享类型才进入 `src/types`。
- 不得以“以后可能复用”为理由提前建立公共抽象。
- feature 之间不能深层导入内部文件。如确需共享，抽取公共模块或通过该 feature 的公开入口导出。

## 6. 调用边界

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

## 7. 导入约定

所有 `src` 内部模块引用使用 `@` 别名：

```ts
import MainLayout from '@/layout/MainLayout.vue'
import type { CharacterDraft } from '@/types/character'
```

禁止：

```ts
import MainLayout from '../layout/MainLayout.vue'
import type { CharacterDraft } from '../../types/character'
```

第三方包使用包名导入。SCSS 模块之间同样优先通过 `@/styles/...` 定位。

## 8. 当前实际拓扑

截至 2026-08 基线，`app/src` 已建立完整的分层结构。以下按 import 语句核对，列出各层实际模块与它们的依赖。

### 8.1 入口、应用与路由

```text
src/main.ts
  -> src/App.vue
  -> src/router/router.ts
  -> src/styles/index.scss（含 flex.scss 布局工具；touch.scss 在 html/body/#app 根级统一使用 touch-action: manipulation，并保留局部 .touch-manipulation）
  -> Pinia（createPinia）

src/App.vue
  -> Vue Router 的 RouterView
  -> src/features/update-notice/components/UpdateNoticeModal.vue
  -> src/stores/update-notice.ts（浏览器挂载后执行一次版本检查）

src/router/router.ts
  -> src/layout/MainLayout.vue
  -> src/views/character-builder/index.vue（懒加载）
  -> src/views/session-assistant/index.vue（懒加载）
  -> src/views/dice/index.vue（懒加载）
  -> src/views/about/index.vue（懒加载）
  -> src/views/not-found/index.vue（懒加载）
  -> import.meta.env.BASE_URL（vue-router 标准用法）
```

### 8.2 布局层

```text
src/layout/MainLayout.vue
  -> src/layout/components/BottomNavigation.vue
  -> vue-router（RouterView / useRoute）

src/layout/components/BottomNavigation.vue
  -> src/layout/hooks/useBottomNavigation.ts
  -> src/assets/icons/navigation.svg（?raw）

src/layout/hooks/useBottomNavigation.ts
  -> vue-router（useRoute，用于导航高亮）
```

### 8.3 页面层（车卡页之外）

关于本站页面采用「入口 `index.vue` + 页面私有 hooks/components」；404 页面仍为「入口 + 页面私有 hook」：

```text
src/views/about/index.vue
  -> src/views/about/hooks/useAboutPage.ts
      -> src/config/site.ts（可选收款码 URL）
      -> src/stores/update-notice.ts（手动回看当前版本公告）
  -> src/views/about/components/AboutIntroSection.vue
  -> src/views/about/components/AboutLinksSection.vue
  -> src/views/about/components/TipQrSection.vue
      -> src/components/ui/UiModal.vue
src/views/not-found/index.vue  -> src/views/not-found/hooks/useNotFoundPage.ts（-> vue-router useRouter）
```

跑团助手（`/assistant`）为页面内聚模块（列表视图 ⇄ 局内面板视图）：

```text
src/views/session-assistant/index.vue
  -> src/views/session-assistant/hooks/useSessionAssistantPage.ts
  -> src/views/session-assistant/components/SessionPanel.vue
  -> src/rules/derive.ts（deriveCharacterSummary，列表卡片摘要）
  -> src/stores/session-assistant.ts（选中角色/页签，本地视图状态）

src/views/session-assistant/hooks/useSessionAssistantPage.ts
  -> src/stores/{character-drafts,session-assistant}
  -> src/services/character-json.ts（CharacterImportError）

src/views/session-assistant/hooks/useSessionPanel.ts
  -> src/rules/{derive,repository,spellcasting,session-state}
  -> src/services/session-state-storage.ts
  -> src/stores/character-drafts.ts（updateDraftById：金币/物品写回）
  -> src/types/{character,session-state}

src/views/session-assistant/components/SessionPanel.vue
  -> src/views/session-assistant/hooks/useSessionPanel.ts
  -> src/features/spellbook-transcription（抄录弹层：同一草稿的 spellSelections 与 adventureGold）
  -> src/components/{AddItemModal,AdjustItemModal}
  -> src/components/ui/{ExpandableOptionCard,ListShell,StatTile,UiBadge,UiModal,UiTabs}
  -> src/rules/{data/class-features-2014,data/feats-2014,data/subclass-features-2014,feats,repository,session-state,spellcasting,starting-equipment,timeline}
  -> src/stores/session-assistant.ts（activeTab 持久化）
  -> src/types/{character,rules,session-state}
  -> src/utils/format-spell-label.ts（法术环位、英文名与仪式标签）
```

赛博骰娘页面为独立的页面内聚模块：

```text
src/views/dice/index.vue
  -> src/views/dice/hooks/useDicePage.ts
  -> src/views/dice/components/{DiceTypeSelector,DicePoolPanel,DiceTray,DiceResultPanel,DiceSettings}

src/views/dice/hooks/useDicePage.ts
  -> src/stores/dice.ts（会话内骰池、结果、待公布结果、投掷标识及开关；无持久化）
  -> src/services/dice-audio.ts（页面拥有的惰性 Web Audio 音效）
  -> src/rules/dice.ts
  -> src/services/dice-random.ts
  -> src/views/dice/engine/dice-worker-client.ts
  -> src/types/dice.ts

src/views/dice/components/DiceSettings.vue
  -> reka-ui（SwitchRoot / SwitchThumb）

src/stores/dice.ts
  -> src/types/dice.ts（不保存总和、轨迹或浏览器资源）

src/services/dice-audio.ts
  -> src/services/dice-audio/synthesis.ts（确定性 PCM 合成、包络与软压缩，供实时和离线试听共用）
  -> Web Audio（unlock / play / stop / dispose；不在预渲染阶段初始化）

src/views/dice/engine/*
  -> Three.js（渲染、骰面旋转）
  -> cannon-es（凸多面体刚体、固定步长物理）
  -> src/types/dice.ts

src/views/dice/engine/dice-tray-layout.ts
  -> 动态骰盘尺寸、出生网格、摄像机适配与视图边界纯函数
  <- dice-physics.ts、dice-renderer.ts

src/views/dice/workers/dicePhysics.worker.ts
  -> src/views/dice/engine/dice-physics.ts
```

### 8.4 车卡页面（views/character-builder）

```text
src/views/character-builder/index.vue
  -> src/views/character-builder/hooks/useCharacterBuilderPage.ts
  -> src/views/character-builder/steps.ts（STEP_ORDER / STEP_META）
  -> src/views/character-builder/components/*（步骤组件；FeatChoicePanel 由内部引用）
  -> src/features/quick-build/components/{CharacterDrawer,QuickBuildShell,StepHeader,StickyActionBar}
  -> src/components/{AddItemModal,AdjustItemModal}（CharacterSheetStep 物品页签）
  -> src/components/ui/{BaseButton,ExpandableOptionCard,UiModal,UiNotice}
  -> src/types/character

src/views/character-builder/hooks/useCharacterBuilderPage.ts
  -> src/views/character-builder/steps.ts
  -> src/stores/character-drafts.ts
  -> src/services/character-json.ts
  -> src/services/export-xlsx.ts（exportXlsx：v4 模板加载 + 输入/公式缓存填充 + 校验 + 下载）
  -> src/services/export-pdf.ts（exportPdf：v4 三页区域映射填充 + 诊断 + 下载）
  -> src/features/character-export/build-export-data.ts（buildCharacterExportModel）
  -> src/rules/{derive,abilities,dependency,repository,timeline,spellcasting,starting-equipment}
  -> vue-router（useRoute / useRouter，路由查询与步骤编排）

src/views/character-builder/hooks/useCharacterSheetEditing.ts
  -> src/rules/{manual-edits,spellcasting}
  -> src/types/character
  （角色卡私有编辑状态、字段差值换算、人工法术与一键恢复；不持有第二份业务事实）

src/views/character-builder/components/*
  -> src/views/character-builder/components/{EditableStatTile,AddManualSpellModal}（双击/键盘数值编辑与完整系统法术库选择）
  -> src/views/character-builder/components/{FeatChoicePanel}（页面内复用）
  -> src/features/spellbook-transcription（CharacterSheetStep 抄录弹层：同一草稿的 spellSelections 与 adventureGold）
  -> src/components/ui/*
  -> src/rules/* 与 src/rules/data/*（推荐、时间线、法术、装备、子职特性等只读消费）
  -> src/config/site.ts（仅 StartPanel）
  -> src/types/*
  -> src/utils/format-spell-label.ts（法术环位、英文名与仪式标签）
```

### 8.5 features / components/ui

```text
src/features/update-notice/components/UpdateNoticeModal.vue
  -> src/components/ui/UiScrollModal.vue
  -> src/stores/update-notice.ts

src/features/spellbook-transcription（法师抄录法术书共享能力：角色卡与跑团助手双调用方）
  index.ts                          （装配导出：Modal + hook）
  components/SpellbookTranscriptionModal.vue
    -> src/components/ui/{ExpandableOptionCard,ListShell,UiNotice,UiScrollModal}
    -> src/features/spellbook-transcription/hooks/useSpellbookTranscription
    -> src/types/character
    -> src/utils/format-spell-label.ts
  hooks/useSpellbookTranscription.ts
    -> src/rules/{repository,spellbook,spellcasting}
    -> src/stores/character-drafts.ts（updateDraftById：spellSelections + adventureGold 一次 patch 原子写回）
    -> src/types/{character,rules}

src/features/character-media（身份步骤、角色卡、车卡首页与跑团助手共享的角色形象能力）
  components/CharacterMediaEditor.vue
    -> hooks/useCharacterMediaEditing.ts（上传、焦点调整、独立删除、从立绘生成头像）
  components/CharacterMediaImage.vue
    -> hooks/useCharacterMediaUrl.ts（客户端对象 URL、加载失败隐藏与释放）
  -> src/services/{character-image,character-media-storage}
  -> src/types/character

src/features/quick-build/components/CharacterDrawer.vue
  -> src/components/ui/{StatTile,UiDrawer}
  -> src/types/character

src/features/quick-build/components/QuickBuildShell.vue   （无 import，纯插槽布局壳）
src/features/quick-build/components/StepHeader.vue        -> src/components/ui/UiProgress
src/features/quick-build/components/StickyActionBar.vue   -> src/components/ui/BaseButton

src/components/ui/*（BaseButton、ExpandableOptionCard、OptionCard、StatTile、UiBadge、UiChip、UiDrawer、UiModal、UiScrollModal、UiNotice、UiProgress、UiTabs）
  -> 无项目内 import，仅依赖全局 CSS 变量主题（UiTabs 自 v0.7.0 支持 wrap 模式：固定宽度 + 换行；UiScrollModal 默认由内容区滚动，也可关闭 body 滚动并由调用方提供内部滚动区；用于抄录法术书与新增物品弹窗）

src/components/AddItemModal.vue（自 views/character-builder/components 抽象迁移，跨功能复用）
  -> src/components/ui/{ExpandableOptionCard,UiScrollModal}
  -> src/rules/{repository,equipment-filter,item-catalog-loader,source-books}
  -> src/rules/data/generated/magic-items-catalog-2014（动态 import 分块，仅弹窗打开时加载）
  -> src/types/rules

src/components/AdjustItemModal.vue（自 views/character-builder/components 抽象迁移，跨功能复用）
  -> src/components/ui/UiModal

src/utils/format-spell-label.ts（无状态法术列表副标题格式化）
  -> src/types/rules（type-only）
```

### 8.6 stores / services / config

```text
src/stores/character-drafts.ts
  -> src/rules/{derive,manual-edits,session-state,timeline,validate,spellcasting,starting-equipment}
  -> src/services/{character-json,character-media-storage,character-package,draft-storage,session-state-storage}
  -> src/types/character

src/stores/session-assistant.ts（跑团助手视图状态：选中角色 id + 当前页签，localStorage 持久化）
  -> src/stores/character-drafts.ts（草稿存在性校验，回退列表）

src/stores/update-notice.ts（全站公告开关、启动幂等与手动回看）
  -> src/config/site.ts
  -> src/constants/update-notices.ts
  -> src/services/update-notice-storage.ts

src/services/character-json.ts
  -> src/rules/starting-equipment（EMPTY_CURRENCY）⚠️ 越权点
  -> src/types/character

src/services/character-media-storage.ts（IndexedDB Blob 边界；草稿不得直接保存图片二进制）
  -> 浏览器 IndexedDB

src/services/character-image.ts（格式/大小校验、WebP 压缩、头像裁切与立绘缩放）
  -> Canvas / ImageBitmap
  -> src/types/character

src/services/character-package.ts
  -> src/services/{character-json,character-media-storage}
  -> fflate（ZIP 完整角色包：character.json + 可选 avatar.webp / portrait.webp）
  -> src/types/character

src/services/export-xlsx.ts
  -> exceljs（动态 import，仅导出时按需加载；不进入 SSG 预渲染路径）
  -> src/config/site（baseUrl：模板资产前缀）
  -> src/features/character-export/build-export-data（消费唯一 CharacterExportModel，不导入 rules）

src/services/export-pdf.ts
  -> pdf-lib + @pdf-lib/fontkit（动态 import，仅导出时按需加载）
  -> src/config/site（baseUrl：字体资产前缀）
  -> public/templates/character-sheet-zh-plus.pdf（静态中文字体子集化后的运行时模板；原始底稿保留在 docs/export-templates）
  -> src/features/character-export/build-export-data（消费唯一 CharacterExportModel，不导入 rules）

src/features/character-export/build-export-data.ts
  -> src/rules/{repository,spellcasting,weapon-attacks} + src/rules/data/feats-2014（ABILITY_LABELS）
  -> src/types/character
  （唯一导出模型：身份、属性、战斗、攻击、物品、钱币、特性、法术、人物资料与诊断）

src/services/draft-storage.ts
  -> src/rules/{manual-edits,starting-equipment}（EMPTY_CURRENCY）⚠️ starting-equipment 为既有越权点
  -> src/types/character

src/services/session-state-storage.ts（跑团助手局内状态，独立 localStorage key）
  -> src/types/session-state

src/services/update-notice-storage.ts（已读版本，独立 localStorage key；SSR/异常安全降级）
  -> src/utils/version.ts

src/types/session-state.ts
  -> 无项目内依赖（SessionState、13 项预置状态与力竭常量）

src/services/dice-random.ts
  -> Web Crypto（可靠 uint32 随机源与拒绝采样）

src/services/umami.ts
  -> src/config/site.ts（域名匹配后幂等加载 Umami 统计脚本）

src/config/site.ts    （项目内唯一读取 import.meta.env 的入口；版本由 package.json 构建期注入；导出 baseUrl 供字体等 public 资产 URL）
src/config/setting.ts （空占位文件，无消费者）

src/views/character-builder/components/CharacterPrintSheet.vue（页面私有打印版面）
  -> src/features/character-export/build-export-data（与 XLSX 共用同一导出数据）
  -> src/types/character
```

### 8.6.1 schema v6 与有效角色数据

`CharacterDraft` schema v7 在 v6 的 `CharacterManualEdits` 基础上新增可选 `media` 引用。v2—v6 草稿与 JSON 导入统一经过 `draft-storage` 的 v7 迁移入口；v7 localStorage key 与旧 key 并存读取，保存只写 v7。图片 Blob 保存在 IndexedDB，普通 JSON 导出移除 `media`，ZIP 完整角色包负责跨设备迁移角色与图片。JSON 仍保存差值和人工法术来源，不降格为不可重算的绝对最终值。

`rules/derive.ts` 是有效属性、熟练、技能、豁免与派生战斗数值的唯一规则出口；`rules/manual-edits.ts` 负责人工数据归一化和字段差值换算；`rules/spellcasting.ts` 负责有效环位及有效法术集合；`rules/weapon-attacks.ts` 将公共人工武器调整应用到每件可计算武器。角色卡、摘要、跑团助手和导出模型均消费这些有效结果。

草稿替换由 `character-drafts` Store 统一协调：写入前归一化人工编辑；若已有局内状态，则比较变更前后有效最大生命值与环位，并通过 `rules/session-state.ts` 同步当前状态和休息快照。页面组件不得直接改写 localStorage 或自行复制协调公式。

### 8.7 rules 层

```text
src/rules/repository.ts          -> src/rules/data/{classes-2014,class-features-2014,arcane-casters-2014,fighter,martials-2014,equipment-2014,magic-items-2014,magic-items-dmg-catalog-2014,magic-items-expansions-2014,magic-items-xgte-tcoe-2014,generated/magic-items-catalog-index-2014,feats-2014,half-casters-2014,full-casters-2014,origins-2014,starting-equipment-2014,subclasses-2014,spells-2014}
src/rules/item-catalog-loader.ts  -> src/rules/data/generated/magic-items-catalog-2014（动态 import；模块级 Promise 缓存 + 失败重试）
src/rules/derive.ts              -> src/rules/{repository,feats,subclass-effects}
src/rules/validate.ts            -> src/rules/{repository,derive,feats,abilities,timeline,spellcasting,starting-equipment} + src/rules/data/subclass-features-2014
src/rules/dependency.ts          -> src/rules/{derive,repository,timeline} + src/rules/data/subclass-features-2014
src/rules/timeline.ts            -> src/rules/repository + src/rules/data/{feats-2014,subclasses-2014,subclass-features-2014}
src/rules/spellcasting.ts        -> src/rules/{derive,repository}
src/rules/spellbook.ts           -> src/rules/{repository,spellcasting}（抄录候选池、费用、金币校验与抄录应用纯函数）
src/rules/starting-equipment.ts  -> src/rules/repository
src/rules/feats.ts               -> src/rules/data/feats-2014
src/rules/recommend.ts           -> src/rules/data/feats-2014（仅保留成长速览与起源提示）
src/rules/source-books.ts        -> src/rules/data/sources-2014 + src/rules/repository（迁移推导入口）
src/rules/equipment-filter.ts    -> src/types/rules（中英文/ID、稀有度、类别、同调、来源组合筛选纯函数）
src/rules/abilities.ts           （无 rules 内部依赖，最纯）
src/rules/subclass-effects.ts    （无依赖，纯函数）
src/rules/dice.ts                -> src/types/dice（骰池、d100、总和与投掷准备纯函数）
```

规则层保持框架无关：不导入 Vue、Pinia、Router、DOM、Cookie、存储或 `import.meta.env`。`rules/data` 之间仅存在单向、无环的横向依赖：

```text
feats-2014             <- {martials-2014, fighter, arcane-casters-2014, half-casters-2014, full-casters-2014}（属性提升/专长选项）
subclass-features-2014 <- {martials-2014, fighter, arcane-casters-2014, half-casters-2014, full-casters-2014, subclasses-2014}（子职特性）
spells-2014            <- {arcane-casters-2014, half-casters-2014, full-casters-2014, subclasses-2014}（职业/子职法术归属）
spell-slots-2014       <- {arcane-casters-2014, half-casters-2014, full-casters-2014, subclasses-2014}（法术位表与最高施法环级常量；无依赖，最底层）
magic-items-dmg-catalog-2014 <- magic-items-2014 <- repository（同调审计表 JSON 共享；DMG 候选目录由构建期脚本生成，运行时仅做合并去重）
magic-items-expansions-2014  <- repository（ERftLW/EGtW 目录由构建期脚本生成；重印按稳定身份合并来源）
generated/magic-items-catalog-2014       （构建期产物：完整目录含 description，由 item-catalog-loader 动态加载；不进入主分块）
generated/magic-items-catalog-index-2014 （构建期产物：目录轻量索引，description 为空串，静态装配进最小运行时索引）
equipment-metadata     <- {equipment-2014,magic-items-2014,magic-items-xgte-tcoe-2014,magic-items-2024}（英文名、细分类别与特殊同调迁移辅助）
```

`rules/data/generated/` 是构建期产物目录：`scripts/build-item-catalog.mjs` 从 `docs/equipment/5e-2014/` Markdown 生成类型化 TS（提交进仓库、纳入 vue-tsc 校验），运行时不再解析 Markdown；`src/rules/data/dmg-attunement-table.json` 为同调审计表，与生成脚本共享同一数据源。

### 8.8 types / styles

```text
src/types/character.ts（叶子类型，全项目共享）
src/types/rules.ts     -> src/types/character（type-only）
src/types/dice.ts      （骰池、逻辑结果、物理请求与轨迹协议）
src/styles/index.scss  -> @use src/styles/flex.scss
```

### 8.9 已知偏差与注意事项

- ⚠️ `services -> rules`：`character-json.ts` 与 `draft-storage.ts` 导入 `rules/starting-equipment` 的 `EMPTY_CURRENCY`，而权限矩阵中 services 允许依赖 `api、config、types、纯 utils`（未含 rules）。建议后续把该常量上提到 `types` 或 `constants`，或修订矩阵授权。
- 页面组件直接消费 `rules/data/*`（`TimelineStep`、`CharacterSheetStep`、`FeatChoicePanel`、`SourcesStep`），符合「views -> rules」权限；如需收紧可改经 `repository` 聚合。
- `config/setting.ts` 为空占位文件；`assets/icons/DND.png` 无任何 import 引用。
- `src/utils` 当前仅包含无状态的 `format-spell-label.ts`；`src/api`、`src/constants`、顶层 `src/hooks` 当前不存在，只有出现对应真实职责时才创建。

## 9. 变更复核

完成修改后必须检查：

1. 新文件是否位于职责正确的目录；
2. 是否出现下层反向导入上层；
3. views、components 或 stores 是否越过中间层直接访问外部能力；
4. 单业务逻辑是否被过早上提；
5. 新增、删除、移动模块是否改变本文件的“当前实际拓扑”；
6. 所有 `src` 内部导入是否使用 `@` 别名；
7. 每个可路由页面是否使用 `views/<page>/index.vue` 与页面私有 `hooks`；
8. `index.vue` 是否混入了状态、生命周期、副作用或业务规则；
9. 页面 hook 是否因职责过多而需要继续拆分；
10. 是否创建了没有真实内容的 `components` 等占位目录。

如果依赖关系有变化，在同一修改中更新本文件；如果没有变化，在交付说明中明确写出“已复核前端依赖拓扑，无需更新”。

## 10. 快速车卡当前拓扑

早期“尚未创建 features、stores、rules、services”的描述已经过时。当前实际调用链为：

```text
views/character-builder/index.vue
  -> views/character-builder/hooks/useCharacterBuilderPage.ts
  -> views/character-builder/steps.ts（STEP_META/STEP_ORDER 步骤顺序与友好文案公共常量，被 hook 与 StartPanel 共用）
  -> views/character-builder/components/*（16 个：AbilitiesStep、AddItemModal、AdjustItemModal、CharacterSheetStep、ClassStep、EquipmentStep、FeatChoicePanel、IdentityStep、LevelAdjustModal、OriginStep、SourcesStep、SetupStep、SpellcastingStep、StartPanel、TimelineStep、ValidationStep）
  -> features/quick-build/components/{CharacterDrawer,QuickBuildShell,StepHeader,StickyActionBar}
  -> stores/character-drafts.ts
      -> rules/{derive,validate,timeline,dependency,repository,subclass-effects,abilities,feats,recommend,spellcasting,starting-equipment}
          -> rules/data/{sources-2014,artificer-2014,subclasses-2014,subclass-features-2014,class-features-2014,classes-2014,martials-2014,fighter,half-casters-2014,arcane-casters-2014,full-casters-2014,origins-2014,equipment-2014,magic-items-2014,magic-items-dmg-catalog-2014,magic-items-xgte-tcoe-2014,equipment-metadata,starting-equipment-2014,feats-2014,spells-2014}
      -> services/{draft-storage,character-json}
          -> rules/starting-equipment（EMPTY_CURRENCY）⚠️ 越权点，见 8.9
  -> components/ui/*（BaseButton、ExpandableOptionCard、OptionCard、StatTile、UiBadge、UiChip、UiDrawer、UiModal、UiNotice、UiProgress、UiTabs）
```

规则层仍保持框架无关，不读取 DOM、路由或存储。Store 只保存原始选择；文件和
localStorage 副作用只存在于 services（其中 `EMPTY_CURRENCY` 的跨层依赖见 8.9 越权点说明）；路由查询同步和步骤编排只存在于页面 hook。

`rules/data/class-features-2014.ts` 登记 13 个 2014 职业（含工匠）的等级特性；`rules/data/artificer-2014.ts` 提供工匠施法、灌注目录与数量曲线。子职状态由子特性与必选结构聚合，`selectable` 用于可选但仍需桌面裁定的情境效果，`index-only` 不进入有效选择。

`rules/data/spells-2014.ts` 是 2014 全量法术元数据（稳定 ID、中英文名、环级、8 主施法职业归属、来源索引与**原创中文效果摘要** `description`）的唯一聚合入口，收录 PHB/XGtE/EGtW（非 dunamancy）/TCoE/FTD/SCC 法术；`repository.spells` 直接引用该表。三个旧施法者文件（`half-casters-2014`、`arcane-casters-2014`、`full-casters-2014`）不再持有法术 seed，仅保留职业等级表与子职配置，其 `classSpellIds` 均从 `spells-2014` 按职业过滤派生；跨职业共享法术只登记一次并合并归属，历史 `spell-2014-<slug>` ID 规则保持不变以保证草稿兼容。

`rules/data/sources-2014.ts` 是 2014 来源注册表；`rules/source-books.ts` 提供核心永久启用、可选来源归一化、草稿迁移推导与统一可用性判断。`SourcesStep` 只写入草稿来源 ID，页面内搜索/筛选不持久化。`rules/recommend.ts` 仅保留职业成长速览和种族/背景提示，不再提供职业评分。

`rules/dependency.ts` 的 `target-level` 变更支持升级与降级影响计算：升级时返回 `added`（新等级新增且未完成的检查点清单，含等级与标题，供 UI 引导补全），降级时返回 `invalidatedDetails`（将失效选择的等级与标题）与 `reviews`（按新等级列出数量减少的资源：熟练加值、属性提升/专长次数、战技数量、已知法术上限、子职特性、生命值上限），并沿用"旧选择保留并标记失效、不静默删除"的约定。页面层 `CharacterSheetStep` 提供"调整等级 / 重新编辑"入口与"待补全"徽标，`LevelAdjustModal.vue`（页面私有组件）提供 1—20 级数字网格与影响摘要预览；升级/降级确认复用 `useCharacterBuilderPage` 的 `pendingChange` 依赖影响弹窗（按新增待补 / 将失效 / 需复查 / 保留分节展示），升级后引导条可一键跳转 `timeline` 补全新检查点，`startReedit` 智能定位到需处理步骤（否则进入属性步骤）。草稿首页角色条仅保留打开与删除操作，编辑、等级调整与导出均从角色卡页发起。

`views/character-builder/steps.ts` 是车卡步骤顺序（`STEP_ORDER`）与友好文案（`STEP_META`，`eyebrow`/`title`）的公共常量模块，仅依赖 `types/character`（`DraftStep`）；`useCharacterBuilderPage`（步骤编排、`stepMeta`/`stepNumber`）与 `StartPanel`（首页角色条第三段信息）共用。`StartPanel` 的角色条信息分级展示：完成态（`sheet`）显示职业名（查询不到回退"角色完成"），进行中已选职业显示"职业 · 第N步"，未选职业显示"第N步 · 步骤名"，不再裸显 `currentStep` 英文 ID。

`src/config/site.ts` 是站点与统计配置模块，为项目内**唯一**读取 `import.meta.env` 的入口（站点信息及 `VITE_UMAMI_SCRIPT_URL`/`VITE_UMAMI_WEBSITE_ID`/`VITE_UMAMI_DOMAINS`，空串归一化为 `undefined`，统计域名解析为列表），导出 `siteConfig`；`StartPanel` 消费站点信息渲染署名行，`main.ts` 在应用挂载后调用 `services/umami.ts`，由该服务校验当前域名并幂等加载 Umami 脚本。Umami 自行监听 History API，不额外注册 Router 页面访问钩子。其余业务模块一律不直接读取 `import.meta.env`。


### 骰娘音效试听工具

`app/scripts/render-dice-audio-previews.mjs` 经 Vite SSR 加载 `src/services/dice-audio/synthesis.ts`，使用与实时播放相同的 PCM 合成器导出 WAV；旧版通过原算法离线复现作为对照。输出在根目录已忽略的 `tmp/dice-audio-previews/`，不进入生产资源或 Git。运行时服务保持 services 内部单向依赖，不引用脚本或页面。
