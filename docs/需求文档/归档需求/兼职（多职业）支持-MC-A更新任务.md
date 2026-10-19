# MC-A 数据与持久化基础 · 更新任务

- 对应 TODO：MC-A01、MC-A02、MC-A03（父批次 MC-A）
- 当前状态：**已完成**（MC-A01—MC-A03 全部执行完毕）
- 目标：完成后草稿能够表达「多个职业各自的等级」，旧草稿零损失迁移到新格式，跑团生命骰池能按骰面分别记账；本批不改任何业务规则与界面。
- 前置依赖：需求文档 D1—D13 已确认（[兼职（多职业）支持需求](兼职（多职业）支持需求.md)）；[TODO 计划](兼职（多职业）支持TODO计划.md) 已建立。
- 本次范围：`5e-2014` 与 `5e-2024` 共用；不限定职业集合；等级 1—20；职业数不设上限（D9）。
- 不包含：派生计算接入兼职（MC-B）、时间线与特性（MC-C）、法术选择与法术位（MC-D）、任何界面（MC-E）、导出（MC-F）。
- 规则依据：需求文档 §4.1（类型）、§4.2（法术归属存储形态）、§4.4（跑团状态）、R1、R9、D9；不全书章节见需求 §2。
- 影响入口：
  - 新增：`app/src/types/multiclass.ts`、`app/src/rules/multiclass.ts`、`app/test/rules/multiclass-state.test.ts`、`app/test/services/draft-storage-v10.test.ts`、`app/test/rules/session-state-hit-dice.test.ts`
  - 修改：`types/rules.ts`（转出兼容）、`types/character.ts`、`types/session-state.ts`、`rules/session-state.ts`、`services/draft-storage.ts`、`services/character-json.ts`
  - 不改：`rules/derive.ts`、`rules/timeline.ts`、`rules/spellcasting.ts`、`rules/validate.ts`、任何 `views/**`

## 1. 实施步骤

1. **MC-A01 类型与解析**
   - 新建 `types/multiclass.ts`：`ClassLevelEntry`、`MulticlassState`、`MulticlassDraft`。
   - `types/rules.ts` 的 `AbilityKey` 仍在 `types/character.ts`；`types/multiclass.ts` 从这里导入，避免循环依赖。
   - 新建 `rules/multiclass.ts`（`rules` 保持框架无关，只用类型与既有常量）：
     - 读取：`getClassLevel`、`getClassEntries`、`getMulticlassState`、`getPrimaryClassId`、`getTotalLevel`、`getLastLevelClassIds`、`isMulticlassActive`
     - 写入（纯函数、返回新草稿、不改 `selections`）：`setClassLevel`、`addClassEntry`、`removeClassEntry`、`setClassSubclassId`、`setMulticlassEnabled`、`rebuildLevelOrder`
     - 归一化：`normalizeMulticlass(value, fallback)` 处理非法等级、重复职业、起始职业不在列表、总和与 `targetLevel` 不一致。
   - 兼容：无 `multiclass` 字段时读取函数按 `classId + targetLevel + subclassId` 合成单职业结果，且**不写回草稿**。

2. **MC-A02 schema v10 与迁移**
   - `CharacterDraft.schemaVersion` 9 → 10；新增可选 `multiclass?: MulticlassState`。
   - `draft-storage.ts`：新增 v10 存储键，v9—v2 键进入迁移读取链；`MIGRATABLE_SCHEMA_VERSIONS` 加入 9；`isDraft` 判定改为 10；`draftFailureReason` 的版本描述同步。
   - `migrateDraftToV10`：`classId → classes[0]`（`level = targetLevel`）、`primaryClassId = classId`、`levelOrder = Array(targetLevel).fill(classId)`、`subclassId` 原样、`enabled = false`；**同时**把顶层法术数组复制为 `spellSelections.classSpellSelections = [{ classId, cantripIds, knownSpellIds, preparedSpellIds, spellbookSpellIds }]`（仅为存储形态，消费方归 MC-D04）。
   - `normalizeDraft` 增加 `multiclass` 归一化。
   - `character-json.ts` 的第二份 `SUPPORTED_SCHEMA_VERSIONS` 同步为 10。
   - 兼容别名：保留 `migrateDraftToV9`（对外导出）与既有 `migrateDraftToV8..V5` 别名，统一指向 v10 迁移，避免调用方分叉。

3. **MC-A03 生命骰按骰面**
   - `HitDicePool` 增加 `byDie?: Readonly<Record<number, { total: number; spent: number }>>`，`total`/`spent` 保留为汇总值（旧状态只有这两项时按单组处理）。
   - 新增 `getHitDicePoolEntries`、`normalizeHitDicePool`、`getHitDiceRemaining`、`spendHitDiceDie`。
   - `ensureHitDicePool(state, totalOrByDie)`：接受数字（旧签名，单组 d 面由调用方决定则按 8 处理）或骰面数组。
   - `spendHitDice` 增加可选 `die` 参数：指定时只扣该骰面组；省略时保持现有「从总量扣」的行为，不破坏既有测试。

## 2. 验证

- `app/test/rules/multiclass-state.test.ts`：合法读取、缺字段兼容、非法等级、重复职业、起始职业缺失、写入函数的不可变性与 `selections` 不被改动、`getLastLevelClassIds` 的分配语义。
- `app/test/services/draft-storage-v10.test.ts`：v9 夹具迁移后等级/子职/法术数组映射正确；v2—v9 全链迁移；未知版本拒绝；`targetLevel` 与 Σ 等级一致。
- `app/test/rules/session-state-hit-dice.test.ts`：`d10:5 + d8:5` 分组、单组旧状态兼容、按骰面消耗与撤回、降级后钳制。
- 回归：`session-state.test.ts`、`draft-storage.test.ts`、`character-json` 相关测试必须原样通过。
- 全量：`pnpm test`、`vue-tsc -b`、生产构建。

## 3. 文档同步

- `docs/rules.md`：本批不改变玩家可见规则行为，暂不修改（派生与规则口径在 MC-B/MC-C 落地时统一更新）。
- `docs/frontend-architecture.md`：新增 `types/multiclass.ts` 与 `rules/multiclass.ts` 属于既有目录职责内，无新目录、无依赖方向变化 → 需在结果回填中写明「已复核前端依赖拓扑，无需更新」。
- 本文件与 TODO 计划在完成后回填状态。

## 4. 完成标准

- 单职业草稿的全部既有读取路径（`traits`／派生／界面）行为不变，测试零回归。
- 兼职草稿可保存、读取、JSON 往返，且 `Σ 职业等级 === targetLevel` 恒成立。
- v2—v9 夹具迁移后数值与选择与迁移前一致（等级、子职、法术数组、来源、人工调整）。

## 5. 结果回填

**状态：已完成（2026-10-11）。**

### 5.1 变更清单

| 文件 | 变更 |
| --- | --- |
| `app/src/types/multiclass.ts`（新增） | `ClassLevelEntry`／`MulticlassState`／`MulticlassDraft`／`ClassSpellSelections`／`MulticlassPrerequisite`／`MulticlassProficiencyGrant`／`MulticlassCasterWeight` |
| `app/src/rules/multiclass.ts`（新增） | 常量与 19 个纯函数：读取（`getClassEntries`／`getMulticlassState`／`getPrimaryClassId`／`getTotalLevel`／`getClassLevel`／`getClassSubclassId`／`isMulticlassActive`／`getLastLevelClassIds`）、写入（`setClassLevel`／`addClassEntry`／`removeClassEntry`／`setClassSubclassId`／`setMulticlassEnabled`）、辅助（`rebuildLevelOrder`／`getLevelDelta`／`normalizeMulticlass`） |
| `app/src/types/character.ts` | `schemaVersion: 10`；新增 `multiclass?`；`SpellSelections.classSpellSelections?` |
| `app/src/types/rules.ts` | 转出兼职类型，保持既有导入路径 |
| `app/src/types/session-state.ts` | `HitDicePool.byDie?` + `HitDiceGroup` |
| `app/src/rules/session-state.ts` | `getHitDicePoolEntries`／`normalizeHitDicePool`／`getHitDiceRemaining`／`spendHitDiceDie`／`refreshHitDicePool`；`createInitialSessionState`／`ensureHitDicePool`／`reconcileSessionLimits` 接受数字或骰面数组；`spendHitDice` 支持 `die` |
| `app/src/services/draft-storage.ts` | v10 键与迁移链；`migrateDraftToV10`；`buildMigratedMulticlass`／`buildMigratedClassSpellSelections`；`normalizeClassSpellSelections`；`normalizeDraft` 以职业集合重算 `targetLevel` |
| `app/src/services/character-json.ts` | 版本白名单加 10 |
| `app/src/stores/character-drafts.ts` | 新草稿写 `schemaVersion: 10` |
| 测试 | 新增 `multiclass-state.test.ts`（26）、`draft-storage-v10.test.ts`（10）、`session-state-hit-dice.test.ts`（18）；更新 4 个既有测试文件的版本断言与 `draft-2024` 夹具 |

### 5.2 执行中的设计决定

1. **MC-A02 采用「一次到位」迁移**：`migrateDraftToV10` 同时写入 `multiclass` 与 `spellSelections.classSpellSelections`，避免 v10 出现两种迁移口径；法术分组的**消费**仍归 MC-D04。
2. **`setClassLevel` 对未加入职业只做 1 级添加**：忽略传入的 `level`，需要更高等级时由调用方追加一次显式设置。这样「添加职业」永远从 1 级起步，与规则语义一致。
3. **`rebuildLevelOrder` 语义固定**：先给每个职业排第 1 级，再把剩余等级按加入顺序轮流分配（跳过已用尽的职业）；它只是 `levelOrder` 缺失时的兜底重建，不表达真实历史（决策 D7 不留历史）。
4. **旧状态兼容优先**：`HitDicePool` 没有 `byDie` 时，指定 `die` 的消耗回退到总量扣减，不报错、不丢消耗；数字型 `hitDiceTotal` 保持单组行为。

### 5.3 验证结果

| 检查 | 结果 |
| --- | --- |
| `npx vue-tsc -b` | 通过（无输出） |
| `npx vitest run`（全量） | 214 文件 / 2134 项通过（改造前 211 文件 / 2080 项；本批新增 3 文件 / 54 项） |
| `npm run build` | 通过（`vite-ssg` 渲染 6 页 + PWA `generateSW`，41 项预缓存） |
| 单职业回归 | 无失败项；`session-state.test.ts`(32)、`draft-storage.test.ts`(13)、`character-json.test.ts`(10)、`character-package.test.ts`(5)、`character-drafts.test.ts`(11) 全部原样通过 |
| 拓扑复核 | 已复核前端依赖拓扑：新增模块均在既有目录职责内，无新目录、无依赖方向变化 → **无需更新** `docs/frontend-architecture.md` |

### 5.4 剩余问题

- `classSpellSelections` 目前只写不读，属预期（MC-D04 负责消费）；在那之前它不影响任何现有行为。
- `reconcileSessionLimits` 的数字型骰池分支采用按比例分配，仅在旧调用路径生效；MC-E05 接入按骰面 UI 后应统一传骰面数组。
- 生命骰按骰面的 UI（选择骰面消耗）仍待 MC-E05 落地；本批只完成规则与状态层。

### 5.5 允许勾选的 TODO

MC-A01、MC-A02、MC-A03 已勾选（见 [TODO 计划](兼职（多职业）支持TODO计划.md)）。
