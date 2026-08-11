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
src/views/classes/
  index.vue
  hooks/
    useClassesPage.ts
    useClassSearch.ts
    useClassFilter.ts
  components/
    ClassCard.vue
  dictionary.ts
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
  -> src/styles/index.scss
  -> Pinia（createPinia）

src/App.vue
  -> Vue Router 的 RouterView

src/router/router.ts
  -> src/layout/MainLayout.vue
  -> src/views/character-builder/index.vue（懒加载）
  -> src/views/classes/index.vue（懒加载）
  -> src/views/dice/index.vue（懒加载）
  -> src/views/profile/index.vue（懒加载）
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

其余四个页面均为「入口 `index.vue` + 页面私有 hooks」，无页面私有 `components`：

```text
src/views/classes/index.vue    -> src/views/classes/hooks/useClassesPage.ts
src/views/dice/index.vue       -> src/views/dice/hooks/useDicePage.ts
src/views/profile/index.vue    -> src/views/profile/hooks/useProfilePage.ts
src/views/not-found/index.vue  -> src/views/not-found/hooks/useNotFoundPage.ts（-> vue-router useRouter）
```

### 8.4 车卡页面（views/character-builder）

```text
src/views/character-builder/index.vue
  -> src/views/character-builder/hooks/useCharacterBuilderPage.ts
  -> src/views/character-builder/steps.ts（STEP_ORDER / STEP_META）
  -> src/views/character-builder/components/*（13 个步骤组件；FeatChoicePanel 由内部引用）
  -> src/features/quick-build/components/{CharacterDrawer,QuickBuildShell,StepHeader,StickyActionBar}
  -> src/components/ui/{BaseButton,ExpandableOptionCard,UiModal,UiNotice}
  -> src/types/character

src/views/character-builder/hooks/useCharacterBuilderPage.ts
  -> src/views/character-builder/steps.ts
  -> src/stores/character-drafts.ts
  -> src/services/character-json.ts
  -> src/rules/{derive,abilities,dependency,repository,timeline,spellcasting,starting-equipment}
  -> vue-router（useRoute / useRouter，路由查询与步骤编排）

src/views/character-builder/components/*
  -> src/views/character-builder/components/{FeatChoicePanel}（页面内复用）
  -> src/components/ui/*
  -> src/rules/* 与 src/rules/data/*（推荐、时间线、法术、装备、子职特性等只读消费）
  -> src/config/site.ts（仅 StartPanel）
  -> src/types/*
```

### 8.5 features / components/ui

```text
src/features/quick-build/components/CharacterDrawer.vue
  -> src/components/ui/{StatTile,UiDrawer}
  -> src/types/character

src/features/quick-build/components/QuickBuildShell.vue   （无 import，纯插槽布局壳）
src/features/quick-build/components/StepHeader.vue        -> src/components/ui/UiProgress
src/features/quick-build/components/StickyActionBar.vue   -> src/components/ui/BaseButton

src/components/ui/*（BaseButton、ExpandableOptionCard、OptionCard、StatTile、UiBadge、UiChip、UiDrawer、UiModal、UiNotice、UiProgress、UiTabs）
  -> 无项目内 import，仅依赖全局 CSS 变量主题
```

### 8.6 stores / services / config

```text
src/stores/character-drafts.ts
  -> src/rules/{derive,timeline,validate,spellcasting,starting-equipment}
  -> src/services/{character-json,draft-storage}
  -> src/types/character

src/services/character-json.ts
  -> src/rules/starting-equipment（EMPTY_CURRENCY）⚠️ 越权点
  -> src/types/character

src/services/draft-storage.ts
  -> src/rules/starting-equipment（EMPTY_CURRENCY）⚠️ 越权点
  -> src/types/character

src/config/site.ts    （无依赖；项目内唯一读取 import.meta.env 的入口）
src/config/setting.ts （空占位文件，无消费者）
```

### 8.7 rules 层

```text
src/rules/repository.ts          -> src/rules/data/{classes-2014,arcane-casters-2014,fighter,martials-2014,equipment-2014,feats-2014,half-casters-2014,full-casters-2014,origins-2014,starting-equipment-2014,subclasses-2014,spells-2014}
src/rules/derive.ts              -> src/rules/{repository,feats,subclass-effects}
src/rules/validate.ts            -> src/rules/{repository,derive,feats,abilities,timeline,spellcasting,starting-equipment} + src/rules/data/subclass-features-2014
src/rules/dependency.ts          -> src/rules/{derive,repository,timeline} + src/rules/data/subclass-features-2014
src/rules/timeline.ts            -> src/rules/repository + src/rules/data/{feats-2014,subclasses-2014,subclass-features-2014}
src/rules/spellcasting.ts        -> src/rules/{derive,repository}
src/rules/starting-equipment.ts  -> src/rules/repository
src/rules/feats.ts               -> src/rules/data/feats-2014
src/rules/recommend.ts           -> src/rules/data/{feats-2014,preferences-2014}
src/rules/abilities.ts           （无 rules 内部依赖，最纯）
src/rules/subclass-effects.ts    （无依赖，纯函数）
```

规则层保持框架无关：不导入 Vue、Pinia、Router、DOM、Cookie、存储或 `import.meta.env`。`rules/data` 之间仅存在单向、无环的横向依赖：

```text
feats-2014             <- {martials-2014, fighter, arcane-casters-2014, half-casters-2014, full-casters-2014}（属性提升/专长选项）
subclass-features-2014 <- {martials-2014, fighter, arcane-casters-2014, half-casters-2014, full-casters-2014, subclasses-2014}（子职特性）
spells-2014            <- {arcane-casters-2014, half-casters-2014, full-casters-2014}（职业法术归属）
```

### 8.8 types / styles

```text
src/types/character.ts（叶子类型，全项目共享）
src/types/rules.ts     -> src/types/character（type-only）
src/styles/index.scss  -> @use src/styles/flex.scss
```

### 8.9 已知偏差与注意事项

- ⚠️ `services -> rules`：`character-json.ts` 与 `draft-storage.ts` 导入 `rules/starting-equipment` 的 `EMPTY_CURRENCY`，而权限矩阵中 services 允许依赖 `api、config、types、纯 utils`（未含 rules）。建议后续把该常量上提到 `types` 或 `constants`，或修订矩阵授权。
- 页面组件直接消费 `rules/data/*`（`TimelineStep`、`CharacterSheetStep`、`FeatChoicePanel`、`PreferencesStep`），符合「views -> rules」权限；如需收紧可改经 `repository` 聚合。
- `config/setting.ts` 为空占位文件；`assets/icons/DND.png` 无任何 import 引用。
- `src/api`、`src/constants`、`src/utils`、顶层 `src/hooks`、非 ui 的 `src/components` 当前不存在，只有出现对应真实职责时才创建。

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
  -> views/character-builder/components/*（15 个：AbilitiesStep、CharacterSheetStep、ClassStep、EquipmentStep、FeatChoicePanel、IdentityStep、LevelAdjustModal、OriginStep、PreferencesStep、SetupStep、SpellcastingStep、StartPanel、TimelineStep、ValidationStep）
  -> features/quick-build/components/{CharacterDrawer,QuickBuildShell,StepHeader,StickyActionBar}
  -> stores/character-drafts.ts
      -> rules/{derive,validate,timeline,dependency,repository,subclass-effects,abilities,feats,recommend,spellcasting,starting-equipment}
          -> rules/data/{subclasses-2014,subclass-features-2014,classes-2014,martials-2014,fighter,half-casters-2014,arcane-casters-2014,full-casters-2014,origins-2014,equipment-2014,starting-equipment-2014,feats-2014,spells-2014,preferences-2014}
      -> services/{draft-storage,character-json}
          -> rules/starting-equipment（EMPTY_CURRENCY）⚠️ 越权点，见 8.9
  -> components/ui/*（BaseButton、ExpandableOptionCard、OptionCard、StatTile、UiBadge、UiChip、UiDrawer、UiModal、UiNotice、UiProgress、UiTabs）
```

规则层仍保持框架无关，不读取 DOM、路由或存储。Store 只保存原始选择；文件和
localStorage 副作用只存在于 services（其中 `EMPTY_CURRENCY` 的跨层依赖见 8.9 越权点说明）；路由查询同步和步骤编排只存在于页面 hook。

`rules/data/subclasses-2014.ts` 是当前 2014 子职元数据和普通玩家可选 ID 的唯一聚合入口；`rules/data/subclass-features-2014.ts` 登记各子职等级特性（纵向切片，未核验效果保持 `index-only`），`rules/subclass-effects.ts` 提供子职派生效果钩子（按可核验条目返回效果，首批含龙族血脉的 AC 基础公式与每级生命加成）。`repository` 负责登记完整目录，`timeline` 接收 `subclassId` 上下文，按所选子职追加 `kind: 'subclass-feature'` 的特性选择检查点（`requiresChoice` 特性），并只装配玩家可用检查点；DM 专用条目可被仓库查询，但不进入普通时间线。页面层 `TimelineStep` 选中子职后展示其特性列表并提供特性选择检查点交互，`CharacterSheetStep` 能力页签展示子职特性区块；两者都只从 `SubclassRule.features` 读取数据，不硬编码规则。各职业旧数据文件中已有的子职常量暂保留供局部实现引用，不再作为仓库目录来源。

`rules/data/spells-2014.ts` 是 2014 全量法术元数据（稳定 ID、中英文名、环级、8 主施法职业归属、来源索引与**原创中文效果摘要** `description`）的唯一聚合入口，收录 PHB/XGtE/EGtW（非 dunamancy）/TCoE/FTD/SCC 法术；`repository.spells` 直接引用该表。三个旧施法者文件（`half-casters-2014`、`arcane-casters-2014`、`full-casters-2014`）不再持有法术 seed，仅保留职业等级表与子职配置，其 `classSpellIds` 均从 `spells-2014` 按职业过滤派生；跨职业共享法术只登记一次并合并归属，历史 `spell-2014-<slug>` ID 规则保持不变以保证草稿兼容。

`rules/data/preferences-2014.ts` 是玩法偏好的唯一数据源（6 项偏好的中文名、说明、关联属性与关联玩法标签），`rules/recommend.ts` 消费它生成可解释的职业推荐（`getClassRecommendation` 返回 `{ score, reasons, matchedPreferenceLabels }`，`score` 只排序不表达百分比；`status` 不参与评分）、职业成长速览（`getClassGrowthSummary`）与种族/背景推荐理由（从 `fixedAbilityBonuses`/技能检查点推导，无职业特判）；`ClassRule.playStyleTags` 玩法标签记录在各职业数据文件中，只服务推荐。页面组件 `PreferencesStep`、`ClassStep`、`OriginStep` 直接调用 `rules/recommend` 与 `rulesRepository` 做展示级排序与渲染，不实现推荐公式，符合权限矩阵。

`rules/dependency.ts` 的 `target-level` 变更支持升级与降级影响计算：升级时返回 `added`（新等级新增且未完成的检查点清单，含等级与标题，供 UI 引导补全），降级时返回 `invalidatedDetails`（将失效选择的等级与标题）与 `reviews`（按新等级列出数量减少的资源：熟练加值、属性提升/专长次数、战技数量、已知法术上限、子职特性、生命值上限），并沿用"旧选择保留并标记失效、不静默删除"的约定。页面层 `CharacterSheetStep` 提供"调整等级 / 重新编辑"入口与"待补全"徽标，`LevelAdjustModal.vue`（页面私有组件）提供 1—20 级数字网格与影响摘要预览；升级/降级确认复用 `useCharacterBuilderPage` 的 `pendingChange` 依赖影响弹窗（按新增待补 / 将失效 / 需复查 / 保留分节展示），升级后引导条可一键跳转 `timeline` 补全新检查点，`startReedit` 智能定位到需处理步骤（否则进入属性步骤）。草稿首页角色条仅保留打开与删除操作，编辑、等级调整与导出均从角色卡页发起。

`views/character-builder/steps.ts` 是车卡步骤顺序（`STEP_ORDER`）与友好文案（`STEP_META`，`eyebrow`/`title`）的公共常量模块，仅依赖 `types/character`（`DraftStep`）；`useCharacterBuilderPage`（步骤编排、`stepMeta`/`stepNumber`）与 `StartPanel`（首页角色条第三段信息）共用。`StartPanel` 的角色条信息分级展示：完成态（`sheet`）显示职业名（查询不到回退"角色完成"），进行中已选职业显示"职业 · 第N步"，未选职业显示"第N步 · 步骤名"，不再裸显 `currentStep` 英文 ID。

`src/config/site.ts` 是站点信息配置模块，为项目内**唯一**读取 `import.meta.env` 的入口（`VITE_AUTHOR_NAME`/`VITE_GITHUB_URL`/`VITE_AUTHOR_TAGLINE`/`VITE_APP_VERSION`，可选，空串归一化为 `undefined`），导出 `siteConfig`；`StartPanel` 消费它在 hero 底部渲染署名行（"由 X 制作 · GitHub · v版本"，全部未配置时隐藏）。其余业务模块一律不直接读取 `import.meta.env`。
