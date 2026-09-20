# 子职业与职业选项可展开列表 · 批次 A 更新计划

- 对应需求：[子职业选择与子职选项展开需求](子职业选择与子职选项展开需求.md)（决策记录 6.1：Q1—Q11 全部已确认）。
- 制定日期：2026-09-20。状态：**实施中**。
- 批次范围（需求 7.0）：**批次 A＝展示与交互**，即 W03-01～W03-05 与 W03-09 中与展示相关的部分；**批次 B＝资料补齐**（W03-06～W03-08）另开计划。
- 数据基准：CHM v2026.09.13（本批不新增规则资料，仅展示层）。

## 1. 目标与范围

目标：让车卡第 6 步（时间线）的**全部静态选项检查点**统一使用项目封装的可展开卡片（`ExpandableOptionCard`）：默认折叠只显示名称与一行摘要，右侧三角或双击展开后读详情。

范围内（需求 5.1）：

| 对象 | 检查点数 | 现状 |
| --- | ---: | --- |
| 子职选择 `kind: 'subclass'` | 27 | 仅 2014 邪术师可展开 |
| 子职特性选项 `kind: 'subclass-feature'` | 58 | 全部紧凑卡 |
| 职业级静态选项 `skills`／`class-choice`／`expertise`／`fighting-style`／`infusion` | 98 | 全部紧凑卡 |
| 合计 | **183** | — |

范围外：

- 能力提升／专长检查点（已由 `FeatChoicePanel` 用可展开卡渲染）；
- 动态候选池（`spell-pool`／`all-skills`／`weapon-mastery`）；
- 只读特性块；
- 批次 B 的资料补齐、状态升级与术语统一（`docs/rules.md` 展示口径同步除外）；
- 草稿 schema、校验、派生与导出数值口径。

## 2. 设计（关键决策）

### 2.1 展示开关的落点：用规则层默认值，而不是逐条标注 183 处

**问题**：`ChoiceCheckpoint.optionPresentation` 只能写在**数据层**的检查点上；但 183 个检查点里，2024 全部职业（含 UA）与全部子职特性检查点都是 `timeline.ts` 动态生成的，2014 的奇械师注法检查点也是 `map()` 生成的（检查点 ID 在源码里搜不到）。逐条标注既易漏，也会把「展示口径」抄到 20 余个数据文件。

**决策**：在 `app/src/rules/timeline.ts` 的 `buildTimeline` 收口处统一归一化——**凡是静态选项检查点，默认标注 `optionPresentation: 'expandable'`**；数据层已显式声明者优先（保留将来单独回退为 `'card'` 的能力）。

```ts
/** 静态选项检查点的默认展示形式：批次 A 起统一为可展开卡；数据层显式声明优先。 */
const EXPANDABLE_CHECKPOINT_KINDS = new Set<CheckpointKind>([
  'subclass', 'subclass-feature', 'skills', 'class-choice', 'expertise', 'fighting-style', 'infusion',
])
// buildTimeline 收口处：
optionPresentation: checkpoint.optionPresentation
  ?? (EXPANDABLE_CHECKPOINT_KINDS.has(checkpoint.kind) && checkpoint.optionIds.length > 0 ? 'expandable' : undefined),
```

**理由**：一处改动覆盖全部 183 个检查点，且 2014 子职检查点仍按 Q1-A 在数据层显式标注（保留可读性与逐条控制能力）。视图层继续只读 `optionPresentation`，不硬编码职业或检查点 ID。

### 2.2 展示规则（选项候选卡，两版一致）

| 场景 | 折叠态 | 展开态 |
| --- | --- | --- |
| 静态选项、解析到 `RuleOption` | 名称 + `description` 一行省略；角标沿用现状 | 详情（`RuleOption.description`）+ 先决条件行（`minimumLevel`／`requiredOptionIds`／`requiredSpellIds`）+ 来源行（`englishName · 出处简写`） |
| 静态选项、解析不到 `RuleOption`（如 2014 装甲师／魔炮师，批次 B 处理） | 名称（回退 `feature.optionLabels`）+ 角标 | 显示组件占位提示「暂无摘要，效果以规则来源为准。」，不报错 |
| 子职选择 | 子职名 + 摘要（`RuleOption.description`） | 详情 + 先决条件行（`selectionLevel` 级）+ 来源行 |

选择行为不变：单击主体＝选择（250 ms 判定），双击主体＝展开／收起，右侧三角＝展开／收起；展开状态不写入草稿。

### 2.3 触控修正（Q5-A）

`ExpandableOptionCard__arrow` 由 `width: 2.4rem`（≈38.4 px）改为 ≥ 44 px 的点击区域，交互语义与视觉位置不变。

## 3. 任务分解

| 编号 | 任务 | 落点 | 验收 |
| --- | --- | --- | --- |
| A-01 | 规则层默认展示口径 | `app/src/rules/timeline.ts` | `buildTimeline` 返回的目标检查点均带 `optionPresentation: 'expandable'` |
| A-02 | 2014 子职检查点显式标注（12 处） | `artificer-2014.ts`／`fighter.ts`／`martials-2014.ts`／`half-casters-2014.ts`／`arcane-casters-2014.ts`／`full-casters-2014.ts` | 13 个 2014 职业子职检查点全部带字段 |
| A-03 | 渲染：静态选项分支改为可展开卡 + 共用助手 | `app/src/views/character-builder/components/TimelineStep.vue` | 三类检查点候选卡均可展开；无 `.option-card` 残留 |
| A-04 | 触控修正 | `app/src/components/ui/ExpandableOptionCard.vue` | 箭头点击区域 ≥ 44 px，组件测试固定 |
| A-05 | 测试：新增覆盖 + 修正既有硬断言 | `app/test/rules/*`、`app/test/components/*` | 见第 4 节 |
| A-06 | 文档同步（展示口径） | `docs/rules.md`、需求文档状态、本计划完成记录 | 描述与实现一致 |

## 4. 测试计划

新增：

1. 规则层：两版全部职业的静态选项检查点均带 `optionPresentation: 'expandable'`（含 2024 UA 职业与子职特性检查点）；
2. 反向断言：能力提升／专长与动态候选池检查点**不**带该字段；
3. 组件层：子职特性候选（如 2014 战斗大师战技）可展开并显示详情；
4. 组件层：职业级静态选项（如职业技能、奇械师注法）可展开；
5. 组件层：解析不到 `RuleOption` 的候选（装甲师装甲型号）展开后显示占位提示且不报错；
6. 组件层：`ExpandableOptionCard` 箭头点击区域 ≥ 44 px。

修正既有断言：

| 文件 | 现状断言 | 调整 |
| --- | --- | --- |
| `app/test/rules/arcane-casters-2014.test.ts` | `expandable` 检查点恰为 9 个 | 改为按「含宗主检查点」的完整清单断言 |
| `app/test/components/TimelineStep.test.ts` | 「魔契恩泽四项均使用可展开卡片」中 `expect(wrapper.findAll('.option-card').length).toBe(0)` | 保留语义并扩展到通用断言（无紧凑卡残留） |

## 5. 验证与交付

- `vue-tsc -b`；
- `vitest run`；
- 生产构建（`generate:items` + `vue-tsc -b` + `vite-ssg build`）；
- 依赖拓扑复核：改动落在 `rules/timeline.ts`、`rules/data/*`、`views/character-builder`、`components/ui`，**无新增模块与依赖方向**；
- 提交：本批完成后提交（提交信息见第 7 节）。

## 6. 风险

| 风险 | 处理 |
| --- | --- |
| 183 处候选中部分解析不到 `RuleOption`，展开后是占位提示 | 属预期（批次 B 的 D2 补数据）；组件占位提示已有兜底，不报错 |
| 2014 子职摘要仍为模板文案 | 属预期；批次 B 的 D1 补齐后展开区自动变好，视图无需再改 |
| 默认值扩大到职业级后，列表观感变化（如 142 项注法） | 折叠态与现状一致（仍是一行摘要），仅新增展开入口 |
| 既有测试硬断言 | 已列入第 4 节 |
| 250 ms 选择延迟在大列表下重复出现 | 沿用 W02 已确认口径（接受），展开走三角按钮不触发延迟 |

## 7. 完成记录

实施日期：2026-09-20。状态：**已完成（A-01—A-06）**。

### 7.1 实际改动文件

| 文件 | 改动 |
| --- | --- |
| `app/src/rules/timeline.ts` | 新增 `EXPANDABLE_CHECKPOINT_KINDS` 与 `withOptionPresentation()`；`buildTimeline` 收口处与专长子选择检查点统一归一化 |
| `app/src/rules/data/artificer-2014.ts`、`fighter.ts`、`martials-2014.ts`（3）、`half-casters-2014.ts`（2）、`arcane-casters-2014.ts`（1）、`full-casters-2014.ts`（4） | 2014 子职检查点显式 `optionPresentation: 'expandable'`（共 12 处） |
| `app/src/views/character-builder/components/TimelineStep.vue` | 静态选项分支改按 `optionPresentation` 判定；新增 `optionSummary()`／`subclassFeatureText()`；`optionPrerequisiteText()`／`optionSourceText()` 支持子职条目回退并补「所属职业 · 选择等级」 |
| `app/src/components/ui/ExpandableOptionCard.vue` | 箭头点击区域 2.4rem → 2.75rem（38.4px → 44px） |
| `app/test/rules/timeline-option-presentation.test.ts` | 新增（6 项）：两版全职业覆盖、子职 27／特性 58、能力提升与动态池反例、2014 数据层显式声明 |
| `app/test/rules/invocations-2014.test.ts`、`app/test/rules/arcane-casters-2014.test.ts` | 修正既有硬断言为新口径 |
| `app/test/components/TimelineStep.test.ts` | 新增 `staticCard`／`selectStaticCard`（假定时器跳过 250 ms）；修正专精／超魔用例；新增静态选项可展开、子职候选展开、子职特性选项展开 3 组用例 |
| `app/test/components/ui/ExpandableOptionCard.test.ts` | 新增箭头触控 ≥ 44px 的源码契约断言 |
| `docs/rules.md` | 「内容状态」展示口径段更新 |

### 7.2 验证结果

- `npx vue-tsc -b`：通过。
- `npx vitest run`：**150 个文件 / 1230 项全部通过**（批次 A 前 149 文件 / 1220 项；新增 1 文件、+10 项）。
  - 期间 `test/rules/session-state.test.ts` 曾出现 1 次与本次改动无关的失败（B10-01 生命骰边界），单文件重跑与全量重跑均通过，判定为既有随机用例偶发。
- 生产构建：见 7.3。
- 依赖拓扑：改动落在 `rules`／`rules/data`／`views/character-builder`／`components/ui` 与其测试，**无新增模块、无依赖方向变化**（`docs/frontend-architecture.md` 无需更新）。

### 7.3 与计划的偏差

| 项 | 计划 | 实际 | 说明 |
| --- | --- | --- | --- |
| 静态选项开关落点 | A-01 只做规则层默认 + A-02 标注 12 处 | 两者都做 | 规则层默认覆盖全部动态生成检查点（含 2024 全职业、子职特性、奇械师注法），数据层显式声明保留可读性与逐条控制 |
| 子职展开区内容 | 详情 + 先决 + 来源 | 另加「特性：逐级特性名」 | 折叠摘要已显示子职摘要全文，展开区需提供额外信息才有价值 |
| 只读「子职特性」区块 | 计划外 | 保持不改 | 选中子职后仍可展开查看每条特性详情，与候选卡展开区互补 |

