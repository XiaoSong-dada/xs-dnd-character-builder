# MC-F 导出、校验与整体验收 · 更新任务

- 对应 TODO：MC-F01—MC-F04（父批次 MC-F）
- 当前状态：**已完成**（MC-F01—MC-F04 全部执行完毕）
- 目标：兼职角色可以按需求 §3.1 的统一格式导出到 PDF／XLSX／JSON／ZIP，校验信息对新手可读，并通过整体验收。
- 前置依赖：MC-A（schema v10）、MC-B（先决与熟练）、MC-C（时间线与校验）、MC-D（法术与法术位）、MC-E（界面）。
- 本次范围：2014 与 2024 共用；职业数不设上限（D9）。
- 规则依据：需求 §3.1（职业展示统一格式）、§3.3、§2.4（生命骰）、§2.8（法术位与归属）、§4.5 与 D11／D12（戏法成长四处统一展示）。

## 1. 实施步骤

### 1.1 MC-F01 导出字段映射与落地

**模型层（`features/character-export/build-export-data.ts`）**

1. `identity.classLevel`：单职业保持 `${职业名}（${N}级）`（**单职业导出逐字段不变**）；多职业改为统一标签 `战士3 / 游荡者2（5 级角色）`。
2. 新增 `identity.classRows`：逐职业行 `{ classId, className, level, subclassName?, primary }`，供 PDF／XLSX 多职业输出。
3. `combat.hitDice`：单职业 `d10`；多职业 `5d10 + 5d8`。
4. 新增 `combat.hitDiceTotal`：单职业 `${level}${hitDice}`（与今天 PDF 的 `HDTotal` 输出一致）；多职业 `${level}（${hitDice}）`。
5. `spellcasting`：新增 `classes: readonly string[]`（各施法职业 `法师5`）、`pactNote?`（契约池说明）；`className` 单职业不变、多职业为 `法师5 / 魔契师3`。
6. 新增 `cantrips: readonly ExportCantrip[]`（`{ id, name, className?, scaling }`）与 `formatExportCantripScaling(cantrips, totalLevel)`：**已登记成长规则且已过基础值**的戏法才输出（D12 不写「无成长」），成长值只作展示（D11）。
7. `ExportSpell` 新增可选 `className`（多职业时给出归属职业）；`ExportResource` 新增可选 `sharedSources`。

**PDF（`services/export-pdf.ts`）**

- `HDTotal` 改用 `combat.hitDiceTotal`；特性区块追加戏法成长块；法术卡施法职业行与法术名按多职业输出。

**XLSX（`services/export-xlsx.ts`）**

- `hit_dice` 取 `combat.hitDice`；`class_name` 与 `profile_class_level` 在多职业时用统一标签；`spellcasting_class` 附契约池说明；`spell_slot_N_total` 优先取非契约池（单职业魔契师回退到契约池，行为不变）；特性文本追加戏法成长块。
- **不新增模板字段**：模板是外部二进制资产（`字段映射` 表 + v4 版本契约），新增未映射的非空字段会被 `fillTemplate` 判为 `missing-template-field` 错误。

**JSON／ZIP**

- 已由 schema v10 承载 `multiclass` 与 `spellSelections.classSpellSelections`；补 JSON 与 ZIP 双向往返用例（MC-D04 已覆盖 JSON，本轮补 ZIP）。

### 1.2 MC-F02 兼职校验与可读性

- 逐职业法术校验报告（`getSpellSelectionValidationReport`）接入校验页与步骤门禁提示。
- 复核兼职相关错误／警告的中文原因与修正指引：先决不满足、总等级不符、子职与职业不配对、法术环级或数量超出该职业等级。

### 1.3 MC-F03 整体验收与情景清单

- 新增 `app/test/features/multiclass-flow.test.ts`：覆盖 `战士3/游荡者2`、`游侠4/术士3`、`圣武士6/魔契师1`、`战士3（奥法骑士）/法师5`、`20 个职业各 1 级`、关闭兼职开关的合并、降级移除职业后的失效与恢复、v9 草稿迁移前后数值对照。
- 产出验收记录文档。

### 1.4 MC-F04 文档与公告同步

- `docs/rules.md`、`docs/dnd-classes.md`、`docs/frontend-architecture.md`（如需要）、`CHANGELOG.md`、`app/src/constants/update-notices.ts`、`app/package.json`。
- 历史版本条目（v1.3.0 的「多职业不在本轮」）保持原样，兼职由**新版本条目**宣告。

## 2. 验证

- 单职业导出：`fighterExportModel`／`wizardExportModel` 的全部既有断言不变（PDF 与 XLSX 均逐字段一致）。
- 多职业导出：职业行、生命骰、法术位（含契约池）、法术归属、戏法成长全部按多职业输出。
- JSON／ZIP 双向往返后 `multiclass` 与分桶不变。
- 全量回归 + `vue-tsc -b` + `npm run build`。

## 3. 完成标准

- 需求 §1.3 的三条成功标准逐条可判定。
- 未完成条目仍保持不可选或明确标注；不预分配版本号。

## 4. MC-F01 执行记录（2026-10-11）

| 文件 | 变更 |
| --- | --- |
| `features/character-export/build-export-data.ts` | 新增 `ExportClassRow`／`ExportCantrip`／`formatExportCantripScaling`；`identity.classRows`；`combat.hitDice`（按骰面汇集）与 `combat.hitDiceTotal`；`spellcasting.classes`／`pactNote`；`ExportSpell.className`；`ExportResource.sharedSources`；法术清单在兼职时改以**各职业分桶**为事实源 |
| `services/export-pdf.ts` | `HDTotal` 改用 `combat.hitDiceTotal`；特性区块追加戏法成长；法术卡施法职业行附契约说明；法术名在兼职时标注归属职业 |
| `services/export-xlsx.ts` | 职业格与人物资料页职业行在多职业时写统一标签；`hit_dice` 按多职业输出；法术位优先写通用池（单职业魔契师回退契约池）；法术名标注归属职业；特性文本追加戏法成长 |
| `rules/spellcasting.ts` | **修掉 `getEffectiveSpellSlots` 的既有缺陷**：通用池与契约池此前按环级去重，契约池会覆盖同环的通用环位 |
| 测试 | 新增 `test/features/multiclass-export.test.ts`（14 项）；`multiclass-spell-storage.test.ts` 补 ZIP 往返；`multiclass-spell-scope.test.ts` 补双池断言 |

**关键行为**：
- **职业行**：多职业写需求 §3.1 的统一格式——`identity.classLevel` 与 XLSX 的 `class_name`／`profile_class_level` 均为 `游侠4 / 术士3（7 级角色）`；单职业保持既有 `游侠（7级）`／`游侠 7` 文案**逐字段不变**。
- **逐职业行**：`identity.classRows` 给出 `{ classId, className, level, subclassName?, primary }`，起始职业在首位。
- **生命骰**：`游侠4/术士3` → `3d6 + 4d10`（按骰面升序），总览 `7（3d6 + 4d10）`；单职业仍是 `d10` / `5d10`。
- **法术位**：沿用兼职通用池 `4/3/2`；契约池在「施法职业」格里说明「契约魔法：2 个 2 环法术位，按邪术师3级结算（短休恢复）」。
- **法术归属**：兼职时每个法术带 `className`，PDF 法术格与 XLSX 法术名写成 `疗伤术（游侠）`；单职业不追加后缀。
- **戏法成长**（D11 第四处展示接入）：PDF 与 XLSX 的特性区块追加 `戏法成长（角色总等级 7 级）：火焰箭 2d10（术士）……`；未登记成长规则或仍是 1 级基础值的戏法不入列，也不写「无成长」（D12）。

**修掉的既有缺陷（不属兼职新增，但被兼职暴露）**：
`getEffectiveSpellSlots` 用 `Map<level, slot>` 汇总池，**契约池与通用池同环时会互相覆盖**——`魔契师3/法师5` 的 2 环本该是「通用 3 个 + 契约 2 个」，实际只剩契约 2 个，MC-D01 记录里锁定的「通用 4/3/2 + 契约 2 个 2 环」在最终法术位这一层并不成立（`getMulticlassSpellSlots` 本身是对的，只有 `getEffectiveSpellSlots` 错）。现按「通用／契约」分别保留，人工环位调整每环只施加一次（优先通用池，无通用池时回退契约池，两者皆无时自行建立环位——无施法职业的人工环位行为不变）。

**未改动的边界**：XLSX 模板是外部二进制资产（`字段映射` 表 + v4 版本契约），新增未映射的非空字段会被 `fillTemplate` 判为 `missing-template-field` 错误，因此多职业信息全部承载在**既有字段**里，不新增模板字段。

### 4.1 批次验证（2026-10-11）

| 检查 | 结果 |
| --- | --- |
| `npx vue-tsc -b` | 通过 |
| `npx vitest run`（全量） | **232 文件 / 2348 项通过**（MC-D 后为 231／2333；本阶段新增 1 文件 / 14 项，扩展 2 项） |
| `npm run build` | 通过（`vite-ssg` + PWA） |
| 单职业回归 | 既有 `export-pdf`（v7 表单适配）与 `export-xlsx`（v4 模板契约）全部断言不变 |
| 拓扑复核 | 无新目录、无依赖方向变化 → **无需更新** `docs/frontend-architecture.md` |

## 5. MC-F02／F03／F04 执行记录（2026-10-11）

| 文件 | 变更 |
| --- | --- |
| `rules/validate.ts` | 兼职时逐职业核对法术选择（数量、不可用项、戏法数量与候选），错误带归属职业、当前值与最高环级与修正指引；单职业分支原样保留 |
| `test/rules/multiclass-validation-readability.test.ts`（新增） | 7 项 |
| `test/features/multiclass-flow.test.ts`（新增） | 11 项 |
| `docs/需求文档/兼职（多职业）支持验收记录.md`（新增） | §1.3 成功标准逐条验收、情景清单、验收结论与已知边界 |
| `docs/rules.md` | 角色结构改为「单职业与兼职」；「暂不包含」移除多职业；TODO 移除多职业；兼职章节扩写为完整口径（先决／熟练项／生命骰／特性互斥／法术与法术位／戏法成长／职业展示格式） |
| `docs/dnd-classes.md` | 新增 §5.13「兼职（多职业）先决与兼职熟练项」（先决对照表、2014／2024 独立登记的两张熟练项来源表、施法系数表）；§7 更新检查新增第 8 条兼职检查项 |
| `docs/frontend-architecture.md` | §8.7 rules 层依赖清单新增 4 个 `rules/multiclass*` 模块与依赖变更；新增「兼职（多职业）拓扑（MC 批次）」小节（新增模块清单、依赖方向、存储边界、展示层单一来源） |
| `.agents/AGENTS.md` | 「当前范围」的两条多职业限制更新为已开放（可选规则、默认关闭、职业数不设上限） |
| `CHANGELOG.md`、`app/src/constants/update-notices.ts`、`app/package.json` | 新增 v1.13.0 条目（三处同步）；历史 v1.3.0 条目中的「多职业不在本轮」按历史记录保持原样 |

**关键行为**：
- **校验可读性**：兼职相关错误改写为「`游侠（4级）`的法术列表包含该职业当前无法使用的法术：树肤术。」＋「这些法术超出了游侠在 4 级能用的最高环级（1 环）；请移除它们，或提高游侠的等级。」；数量未完成按职业分别报错并指向「第 8 步 → … · 游侠」任务。测试同时守住「消息里不出现 `class-2014-`／`spell-2014-` 原始 id」的可读性底线。
- **数值来源可追溯**：熟练加值来源写明等级口径（总等级）、豁免熟练来源写明具体职业，玩家能看到「这个数值来自哪个职业」。
- **验收记录如实标注边界**：仓库现有 13 个 2014 职业，需求文档里「20 个职业各 1 级」的字面场景无法用真实数据构造，改用「13 个真实职业 + 7 个占位 = 20 项」验证规则层上限，并写进验收记录而不是伪装成已完整覆盖。

### 5.1 最终验证（2026-10-11）

| 检查 | 结果 |
| --- | --- |
| `npx vue-tsc -b` | 通过 |
| `npx vitest run`（全量） | **234 文件 / 2367 项通过** |
| `npm run build` | 通过（`vite-ssg` + PWA） |
| 版本同步 | `app/package.json` = `CHANGELOG.md` = `update-notices.ts` = **v1.13.0** |
| 拓扑复核 | **已更新** `docs/frontend-architecture.md`（新增模块与依赖清单、兼职拓扑小节） |

## 6. MC-F 完成状态

MC-F01—MC-F04 全部完成。需求 §1.3 成功标准见[验收记录](兼职（多职业）支持验收记录.md)。
