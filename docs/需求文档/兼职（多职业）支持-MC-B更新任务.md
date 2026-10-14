# MC-B 规则内核 · 更新任务

- 对应 TODO：MC-B01、MC-B02、MC-B03、MC-B04、MC-B05（父批次 MC-B）
- 当前状态：**已完成**（MC-B01—MC-B05 全部执行完毕）
- 目标：兼职草稿的先决条件、熟练项、生命值与生命骰、等级口径与按等级取值的数量上限全部按 5e 不全书算对；本批不改界面。
- 前置依赖：MC-A 已完成（`multiclass` 类型、解析函数、schema v10、按骰面骰池）。
- 本次范围：`5e-2014` 全部 13 职业（含奇械师）登记；2024 登记归 MC-D06。等级 1—20；职业数不设上限（D9）。
- 不包含：时间线与检查点归属（MC-C）、法术与法术位（MC-D）、界面（MC-E）、导出（MC-F）。
- 规则依据：需求文档 §2.2（先决）、§2.6（兼职熟练项两张对照表）、§2.4（生命值）、§2.7（特性互斥）；`贤者谏言2025_兼职.md:3-4`（基础属性）、`:10-12`（无豁免熟练）。

## 1. 实施步骤

1. **MC-B01 兼职先决条件**
   - 新增 `rules/data/multiclass-2014.ts`：13 职业的 `multiclassPrerequisite`（`anyOf` 组表达「或／及」）。
   - `rules/multiclass-prerequisites.ts`（或并入 `rules/multiclass.ts`）：`getMulticlassPrerequisites(draft)` 返回逐职业的满足情况与中文原因；判定一律读 `draft.baseAbilities`。

2. **MC-B02 兼职熟练项合并**
   - `rules/data/multiclass-2014.ts` 同时登记 `multiclassProficiencies`（2014 总表 12 行 + 奇械师）。
   - `rules/multiclass-proficiencies.ts`：合并起始职业完整熟练 + 各兼职职业条目，输出技能／豁免／武器护甲／工具的来源链。

3. **MC-B03 生命值与生命骰**
   - `rules/derive.ts`：HP 改为「起始职业 1 级最大值 + Σ(后续等级按 `levelOrder` 的职业骰面)」；`getHitDiceDice(draft)` 输出骰面数组（`[10,10,10,8,8]`）供 MC-A03 的按骰面骰池消费。
   - HP 明细来源链逐级列出「第 n 级 · 职业 + 骰面 + 体质」。

4. **MC-B04 总等级口径复核**
   - `derive.ts` 的熟练加值、`stores/character-drafts.ts` 的 `completion`、`rules/draft-progress.ts` 的 `hasBuildChoices` 全部改用 `getTotalLevel(draft)`。

5. **MC-B05 按等级取值的数量上限**
   - `rules/feats.ts:558-572` 的 `getCheckpointSelectionBounds`：`selectionCountByLevel` 改用归属职业等级；`selectionCountFrom: 'proficiency-bonus'` 保持总等级口径并加注释与测试锚点。

## 2. 验证

- 先决：满足／单项不满足／「或」条件（战士 力量13 或 敏捷13）／「及」条件（武僧、圣武士、游侠）／临时加值不计入。
- 熟练：豁免只来自起始职业；兼职技能项按职业分档；与背景重复走 `proficiencyReplacements`。
- HP：`战士1 + 游荡者4` 与 `战士5` 的差异；`圣武士5/牧师5` 的骰面数组为 5×d10 + 5×d8；起始职业 1 级最大值只算一次。
- 上限：2024 战士武器精通按战士等级取值。
- 回归：`derive.test.ts`、`feats-*.test.ts`、`session-resources.test.ts` 与全量单职业用例零回归。

## 3. 文档同步

- `docs/rules.md`：本批开始改变规则行为（HP 与熟练项口径），需在「等级与核心计算」补充兼职口径。
- `docs/frontend-architecture.md`：如新增 `rules/multiclass-*.ts` 模块，属既有目录职责内，无依赖方向变化。

## 4. 完成标准

- 兼职草稿的 HP、熟练加值、熟练项、先决校验可在规则层单独验证并通过。
- 单职业草稿的派生数值与改造前逐字段一致。
- 兼职草稿的 HP 明细能说明每一级来自哪个职业。

## 5. 结果回填

**状态：已完成（2026-10-11）。**

### 5.1 变更清单

| 文件 | 变更 |
| --- | --- |
| `app/src/rules/data/multiclass-2014.ts`（新增） | 13 职业的 `multiclassPrerequisite` 与 `multiclassProficiencies`；`multiclassCasterWeights2014`；`multiclassThirdCasterSubclasses2014` |
| `app/src/rules/data/multiclass-2024.ts`（新增） | 12 核心 + UA 职业的兼职熟练项与先决（MC-D06 的数据部分提前落地） |
| `app/src/rules/multiclass-prerequisites.ts`（新增） | `getMulticlassPrerequisite`／`checkMulticlassPrerequisite`／`getMulticlassPrerequisiteReport`；`MULTICLASS_ABILITY_MINIMUM = 13` |
| `app/src/rules/multiclass-session.ts`（新增） | 熟练项合并、起始职业豁免、`getHitDiceFaces`、`deriveMulticlassHitPoints`、`getLevelOrder` |
| `app/src/rules/derive.ts` | 熟练加值改用总等级；HP 改用 `deriveMulticlassHitPoints`；豁免熟练改用起始职业；HP 来源链改为逐级；新增 `起始职业豁免熟练` → 仍用标签 `职业豁免熟练` |
| `app/src/rules/feats.ts` | `getCheckpointSelectionBounds` 的 `selectionCountByLevel` 按归属职业等级 |
| `app/src/types/rules.ts` | `ChoiceCheckpoint.classId`／`classLevel` |
| `app/src/rules/draft-progress.ts` | `hasBuildChoices` 纳入 `multiclass` |
| `app/src/features/character-export/build-export-data.ts` | 豁免熟练判定加注释说明口径（标签保持不变） |
| 测试 | 新增 `multiclass-rules.test.ts`（23）、`multiclass-derive.test.ts`（12） |

### 5.2 执行中的设计决定

1. **`anyOf` 表达「或／及」**：外层任一组成立即满足，组内属性需全部满足。战士 `[['str'], ['dex']]`；武僧／圣武士／游侠为单组多属性。
2. **先决一律读 `baseAbilities`**，不读派生属性；未登记先决的职业返回 `pending` 而非失败（D8）。
3. **豁免熟练来源标签保持 `职业豁免熟练`**：导出层（`build-export-data.ts:430`）按该标签判定熟练，改为「起始职业」会静默破坏 PDF／XLSX 的豁免熟练标记。具体职业改写进 `detail`。
4. **兼职工具候选使用项目既有的总类选项**（`tool-musical-instrument`／`tool-artisans-tools`），不为兼职单独引入未登记的具体工具 ID；与吟游诗人 1 级、武僧 1 级、奇械师 1 级检查点同口径。
5. **`deriveMulticlassHitPoints` 对单职业与多职业统一口径**：`perLevel` 取 `faces.slice(1)`，因此单职业结果与改造前逐字段一致（已用 5 级战士 39 点锁定）。

### 5.3 验证结果

| 检查 | 结果 |
| --- | --- |
| `npx vue-tsc -b` | 通过 |
| `npx vitest run`（全量） | **216 文件 / 2169 项通过**（MC-A 后为 214／2134；本批新增 2 文件 / 35 项） |
| `npm run build` | 通过（`vite-ssg` + PWA） |
| 单职业回归 | 无失败项 |
| 拓扑复核 | 新增 `rules/multiclass-*.ts` 与 `rules/data/multiclass-*.ts` 均在既有目录职责内，无新目录、无依赖方向变化 → **无需更新** `docs/frontend-architecture.md` |

### 5.4 过程中发现并修掉的连带影响

1. **豁免熟练标签是导出层契约**：把来源标签改成「起始职业豁免熟练」会让 `pdf-skill-rows.test.ts` 的六个豁免熟练标记全部失效（导出层静默不再标记熟练）。已回退标签、把职业信息移入 `detail`。
2. **PDF 字体子集是规则源码的隐式约束**：`pdf-font.test.ts` 会扫描 `src/rules/**` 与导出链路所有 `.ts` 文件的**全部中文字符**，要求它们都在静态字体子集内。本批新增注释里的「谏」「贡」「耦」三个字不在子集内，已改写文案。后续批次新增中文注释时需注意此约束。

### 5.5 剩余问题

- `multiclassCasterWeights*` 与 `multiclassThirdCasterSubclasses*` 已登记但尚未消费（归 MC-D01）。
- `rules/validate.ts` 尚未使用先决报告（归 MC-C04）；当前兼职先决只在规则层可查。
- 时间线仍未按职业生成检查点（归 MC-C01）。

### 5.6 允许勾选的 TODO

MC-B01—MC-B05 已勾选（见 [TODO 计划](兼职（多职业）支持TODO计划.md)）。
