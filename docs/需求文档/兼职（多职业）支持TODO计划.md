# 兼职（多职业）支持 · 分批 TODO 计划

> 制定日期：2026-10-11。
> 依据：[兼职（多职业）支持需求](兼职（多职业）支持需求.md)（含 D1—D13 已确认决策）。
> 状态：**27 项全部完成**（2026-10-11，MC-A 至 MC-F 六个批次）。验收结果见[验收记录](兼职（多职业）支持验收记录.md)；对应更新公告为 v1.13.0。提交时点仍由用户决定，本计划不代替提交。
> 规则依据：项目内《DND 五版不全书 v2025.11.8》为主要依据，路径见需求文档 §2 与 §13。

## 1. 使用方式与计划边界

用户的下一步是依据本 TODO 制定更新任务。因此本文件以「可以独立展开成更新任务」的工作单元组织，明确每批目标、依赖、交付物与完成标准。

- 工作对象为 `app` 产品项目，不修改视觉原型项目。
- 以当前 1—20 级**单职业**能力为基线做加法：单职业草稿的行为、数值与导出结果在全部批次完成后必须与今天完全一致。
- 分批顺序是建议执行顺序，不是要求一次性完成；每批内部任务可并行，跨批依赖见 §5。
- 每批进入实现前，先确认该批涉及的规则条目（兼职先决、兼职熟练项、施法系数、戏法成长）已按不全书核验；未核验条目不进入自动计算。
- 更新任务保持小范围：一组关联规则、一条完整用户流程或一个数据模块。不能直接以「支持多职业」作为一个任务。
- 本计划不扩展为 DM 房规编辑器、跨规则集混用、完整战斗模拟器或 XP 结算。

### 1.1 编号与勾选约定

- `MC-A`…`MC-F` 为批次，`MC-A01` 为可追踪 TODO；更新任务必须引用对应编号。
- `[ ]` 未完成；只有交付物存在且完成标准通过才能改为 `[x]`。
- 「已创建更新任务」不等于「TODO 已完成」；准备中、执行中、受阻状态写进任务记录，不提前打勾。
- 需细拆时沿用父编号加后缀（如 `MC-D02a`），保留原编号与依赖关系。
- 决定不做的条目记为「不纳入当前范围 + 依据」，不伪装成已实现。

## 2. 批次总览

| 批次 | 主题 | 主要前置 | 可交付结果 |
| --- | --- | --- | --- |
| MC-A | 数据与持久化基础 | 需求文档 D1—D13 | 草稿能表达多职业；旧草稿零损失迁移 |
| MC-B | 规则内核（先决、熟练、HP、骰面） | MC-A | 兼职草稿可通过规则层计算与校验 |
| MC-C | 时间线、特性互斥与升级降级 | MC-B | 兼职时间线完整、特性不重复叠加、升降级清单正确 |
| MC-D | 法术（归属、法术位、戏法成长、数据登记） | MC-A、MC-B | 每职业法术独立校验，兼职法术位与戏法成长正确 |
| MC-E | 界面（分配控件与七个页面） | MC-B、MC-C、MC-D | 手机宽度下兼职流程可用 |
| MC-F | 导出、校验与整体验收 | MC-E | 兼职角色可创建、保存、使用、导出 |

批次顺序对应需求文档 §10 的 M1—M6；本计划的 MC-A…MC-F 是**执行批次**，与需求文档的分期是同一件事的两种粒度。

## 3. 逐批 TODO

### MC-A：数据与持久化基础

目标：先把「一个草稿可以表达多个职业」这件事在类型、解析与存储三层做扎实，不动任何业务规则与界面。

- [x] **MC-A01：多职业状态类型与解析函数**
  - 交付：`MulticlassState`／`ClassLevelEntry` 类型；`rules/multiclass.ts` 纯函数族。
  - 范围：新增 `multiclass.enabled` / `primaryClassId` / `classes` / `levelOrder`（需求 §4.1）；导出 `getClassLevel(draft, classId)`、`getTotalLevel(draft)`、`getClassEntries(draft)`、`getPrimaryClassId(draft)`、`getLastLevelClassIds(draft, n)`、`normalizeMulticlass(draft)`、`setClassLevel(draft, classId, level)`、`addClass(draft, classId)`、`removeClass(draft, classId)`。
  - 约束：`rules/` 保持框架无关，不得依赖 Vue／Pinia／Router／DOM／存储；不写 `targetLevel`（由 Σ 派生）。
  - 兼容：无 `multiclass` 字段时，上述读取函数按 `classId + targetLevel + subclassId` 合成单职业结果，**不写回草稿**。
  - 完成标准：`Σ 职业等级 ≠ targetLevel`、空职业列表、等级越界（<1 或 >20）、重复职业、起始职业不在列表中都能被 `normalizeMulticlass` 识别并给出中文原因；单职业草稿的全部读取与今天逐字段相等。
  - 验证：`app/test/rules/multiclass-state.test.ts`（合法、边界、缺字段、非法组合、单职业等价性）。

- [x] **MC-A02：schema v10 与 v2—v9 迁移**
  - 交付：`schemaVersion: 10`；`migrateDraftToV10`；v10 存储键；导入白名单同步。
  - 范围：`types/character.ts:189`、`services/draft-storage.ts:19-32,106-110,151-177,193-256,330-344`、`services/character-json.ts:7`、`services/character-package.ts`。
  - 迁移映射：`classId → classes[0]`（`level = targetLevel`，`subclassId` 原样）；`primaryClassId = classId`；`levelOrder = Array(targetLevel).fill(classId)`；顶层法术数组 → 该职业的 `classSpellSelections[0]`（与 MC-D04 同步落地，或先在 MC-A02 只迁等级、法术留待 MC-D04 的 v10 分支补齐——二选一，必须在任务记录中写明）。
  - 约束：旧的 `migrateDraftToV8..V5` 别名需重整，避免新增 v10 后误调用；`character-json.ts` 的第二份版本白名单必须同步，否则导入静默失败（需求 §6.2）。
  - 完成标准：v2—v9 夹具草稿全部迁移成功、数值与选择不变；v9 之前的 2024 草稿兼容分支行为不变；未知版本仍被明确拒绝。
  - 验证：`app/test/services/draft-storage-*.test.ts` 扩展；`character-json` 往返测试。

- [x] **MC-A03：跑团局内状态适配（生命骰按骰面）**
  - 交付：`HitDicePool` 按骰面分组；`session-state.ts` 的消耗／恢复／协调函数按骰面工作。
  - 范围：`types/session-state.ts:39-43`、`rules/session-state.ts:31-81,234-301`、`stores/character-drafts.ts:196-214`。
  - 约束：2014 不追踪生命骰的既有行为不变；单职业 2024 角色的骰池表现与今天一致；旧状态对象（只有 `total`/`spent`）必须能读取。
  - 完成标准：圣武士5/牧师5 → `d10:5 + d8:5`；短休按选定骰面扣减并能撤回；降级／移除职业后已花骰数被钳制。
  - 验证：`app/test/rules/session-state-*.test.ts` 扩展。

- MC-A01 完成记录（2026-10-11）：新增 `app/src/types/multiclass.ts` 与 `app/src/rules/multiclass.ts`（19 个纯函数 + 常量）；写入函数返回带稳定错误码的 `MulticlassWriteResult`，不静默失败、不改动 `selections`；`test/rules/multiclass-state.test.ts` 26 项通过。
- MC-A02 完成记录（2026-10-11）：存储键改为 `drafts:v10`，v9 键进入迁移链；两处 `SUPPORTED_SCHEMA_VERSIONS` 同步加 10；**选定「一次到位」方案**——`migrateDraftToV10` 同时写入 `multiclass` 与 `spellSelections.classSpellSelections`（消费方仍归 MC-D04）；`migrateDraftToV8..V5` 别名统一指向 v10；`normalizeDraft` 以职业集合重算 `targetLevel`。新增 `test/services/draft-storage-v10.test.ts`（10 项）。
- MC-A03 完成记录（2026-10-11）：`HitDicePool` 新增 `byDie`；新增 `getHitDicePoolEntries`／`normalizeHitDicePool`／`getHitDiceRemaining`／`spendHitDiceDie`；`createInitialSessionState`／`ensureHitDicePool`／`reconcileSessionLimits` 接受「数字或骰面数组」（数字＝旧签名）；`spendHitDice` 新增可选 `die`，旧池无骰面信息时回退总量扣减；修正长休未清零分组 `spent` 的缺陷。新增 `test/rules/session-state-hit-dice.test.ts`（18 项）。
- 批次验证（2026-10-11）：`vue-tsc -b` 通过；`pnpm test` 214 文件／2134 项全通过；`npm run build`（含 `vite-ssg` 与 PWA）通过。已复核前端依赖拓扑：新增两个模块均在既有目录职责内，无新目录、无依赖方向变化，无需更新 `docs/frontend-architecture.md`。

**交付物**：多职业类型与解析纯函数、v10 草稿格式与迁移、按骰面的局内状态。
**完成标准**：单职业草稿行为与数值零变化；兼职草稿可被保存、读取、往返；规则层尚未接入兼职计算（MC-B 负责）。

---

### MC-B：规则内核

目标：让兼职草稿的先决条件、熟练项、生命值与熟练加值全部按规则算对。

- [x] **MC-B01：兼职先决条件（全部职业，D3）**
  - 交付：`MulticlassPrerequisite` 类型与 `getMulticlassPrerequisites(draft)`；中文可执行原因。
  - 范围：`types/rules.ts`（`ClassRule` 新增字段）、`rules/data/multiclass-2014.ts`（新建）、`rules/derive.ts` 之外的独立模块（建议 `rules/multiclass.ts` 或 `rules/multiclass-prerequisites.ts`）。
  - 规则依据：需求 §2.2 表（含「或／及」语义：战士 力量13**或**敏捷13；武僧／圣武士／游侠为**及**）；官方裁定「只有基础属性可满足，临时加值不算」（`贤者谏言2025_兼职.md:3-4`）→ 必须读 `draft.baseAbilities`。
  - 完成标准：13 个 2014 职业（含奇械师）逐条登记；不满足时返回「需同时满足野蛮人（力量13）与德鲁伊（感知13）；当前感知 11，请在第 5 步提高感知或改选职业」这类原因；未登记先决的职业返回「先决条件待核验」的提示级问题，不阻断（D8）。
  - 验证：`app/test/rules/multiclass-prerequisite.test.ts`。

- [x] **MC-B02：兼职熟练项合并（2014 表 + 2024 逐职业条目）**
  - 交付：`MulticlassProficiencyGrant` 数据与合并逻辑；`derive` 的技能／豁免／武器护甲来源链。
  - 范围：`rules/data/multiclass-2014.ts`、2024 侧登记、`rules/derive.ts:324-358,380-388`、`rules/weapon-attacks.ts:41-68`、`rules/languages.ts:62-77`。
  - 规则依据：需求 §2.6 两张对照表；**豁免熟练只来自起始职业**（`贤者谏言2025_兼职.md:10-12`）；兼职技能项按职业分档（2014 游侠／游荡者各一项、2024 吟游诗人一项等）。
  - 完成标准：`ValueSource.detail` 标注具体职业；与背景重复时沿用 `proficiencyReplacements`；2024 武僧／术士／法师只获得生命骰。
  - 验证：`app/test/rules/multiclass-proficiency.test.ts`。

- [x] **MC-B03：生命值与生命骰总数**
  - 交付：按 `levelOrder` 逐级累加的 HP 计算；分骰面生命骰总数。
  - 范围：`rules/derive.ts:253-258,419-429`。
  - 规则依据：需求 §2.4——1 级最大生命值**只算一次**（起始职业），后续每级按所升职业的后续升级生命值。
  - 完成标准：`战士1 → 战士1/游荡者4` 与 `战士5` 的 HP 差异符合逐级累加；`圣武士5/牧师5 = 5d10 + 5d8`；HP 明细逐级列出「第 n 级 · 职业骰面 + 体质」。
  - 验证：`app/test/rules/multiclass-hitpoints.test.ts`。

- [x] **MC-B04：熟练加值与总等级口径复核**
  - 交付：确认 `targetLevel` 一律取 Σ 职业等级的复核记录与必要的调用点修正。
  - 范围：`rules/derive.ts:234`（本身口径已正确）、`stores/character-drafts.ts:104-118`、`rules/draft-progress.ts`。
  - 完成标准：兼职草稿的熟练加值、`completion` 的等级项、角色摘要等级全部取自 Σ；`hasBuildChoices` 纳入 `multiclass`。
  - 验证：`app/test/rules/multiclass-level.test.ts` 与 stores 测试。

- [x] **MC-B05：职业检查点按各职业等级过滤**
  - 交付：`getCheckpointSelectionBounds` 等按等级表取值的逻辑改用「归属职业等级」。
  - 范围：`rules/feats.ts:558-572`（`selectionCountFrom: 'proficiency-bonus'` 与 `selectionCountByLevel` 均读 `targetLevel`，需求 §6.1）。
  - 完成标准：2024 战士武器精通按**战士等级**取 3/4/5/6 而不是总等级；仪式施法者按熟练加值（总等级）取值的语义被分别固定并在测试中写明。
  - 验证：`app/test/rules/feats-*.test.ts` 扩展。

- MC-B01 完成记录（2026-10-11）：新增 `rules/data/multiclass-2014.ts`（13 职业先决 + 兼职熟练项 + 施法系数 + 1/3 施法子职）与 `rules/multiclass-prerequisites.ts`（`anyOf` 表达「或／及」、只读 `baseAbilities`、未登记先决返回 `pending` 不阻断）；`test/rules/multiclass-rules.test.ts` 覆盖先决 11 项。
- MC-B02 完成记录（2026-10-11）：新增 `rules/multiclass-session.ts` 的 `getMulticlassProficiencyReport`（合并各职业兼职条目、输出来源链）与 `getPrimarySavingThrowAbilities`（豁免只来自起始职业）；2024 数据登记于 `rules/data/multiclass-2024.ts`（MC-D06 的数据部分提前落地）。
- MC-B03 完成记录（2026-10-11）：`deriveMulticlassHitPoints` + `getHitDiceFaces` 接入 `derive.ts`；HP 来源链改为「起始职业 1 级生命值 + 逐级生命值 + 子职/专长/物种加成」；单职业 5 级战士仍为 39（11 + 4×7）。
- MC-B04 完成记录（2026-10-11）：熟练加值改用 `getTotalLevel`；`hasBuildChoices` 纳入 `multiclass`（仅打开开关也算已有构筑，避免规则版本被原地切换）。
- MC-B05 完成记录（2026-10-11）：`ChoiceCheckpoint` 新增 `classId`／`classLevel`；`getCheckpointSelectionBounds` 的 `selectionCountByLevel` 改为按归属职业等级取值（2024 战士武器精通按战士等级），`selectionCountFrom: proficiency-bonus` 保持总等级口径并注明。
- 批次验证（2026-10-11）：`vue-tsc -b` 通过；`pnpm test` 216 文件／2169 项全通过（本批新增 2 文件／35 项）；`npm run build` 通过。
- 过程中修掉的两处连带影响：① 豁免熟练来源标签保持 `职业豁免熟练` 不变（导出层依赖该标签判定熟练，具体职业改写进 `detail`）；② 新增注释中出现的「谏」「贡」「耦」不在 PDF 字体子集内，已改写文案（`pdf-font.test.ts` 会扫描 `src/rules/**` 与导出链路的全部中文字符）。

**交付物**：先决、熟练、HP／骰面、等级口径与数量上限的兼职实现与测试。
**完成标准**：兼职草稿的派生数值可通过规则层单独验证；界面仍不可用（MC-E 负责）。

---

### MC-C：时间线、特性互斥与升级降级

- [x] **MC-C01：多职业时间线与检查点归属**
  - 交付：`buildTimeline` 接受职业集合；`ChoiceCheckpoint.classId`／`classLevel`；id 唯一性。
  - 范围：`rules/timeline.ts:306-389`、`types/rules.ts:250-291`、`rules/data/*-2014.ts`／`*-2024.ts` 的检查点数据补字段、`rules/validate.ts:398-569`、`views/.../TimelineStep.vue:34`（本任务只改数据与规则，界面渲染归 MC-E03）。
  - 规则依据：需求 §2.9（子职按各职业等级解锁）、§6.3 缺口 2（子职特性检查点 id 不带职业前缀，需改为职业限定并保留旧 id 兼容读取）。
  - 完成标准：同职业多次出现不撞 id；两个职业的检查点混排后仍能按职业分组与过滤；旧草稿的旧 id 选择仍能命中。
  - 验证：`app/test/rules/multiclass-timeline.test.ts`（含 id 唯一性与旧 id 兼容）。

- [x] **MC-C02：特性互斥、去重与资源合并**
  - 交付：`resolveCharacterFeatures(draft)` 汇总器 + 互斥规则。
  - 范围：`rules/derive.ts:289-292,409-413`、`rules/weapon-attacks.ts:80-102`、`rules/session-resources.ts:36-41`、`types/rules.ts`（新增互斥声明字段）。
  - 规则依据：需求 §2.7 与 R5——额外攻击不叠加（仅战士的「额外攻击（二）／（三）」提升上限）、AC 计算方式同时只能用一个、引导神力共享次数池、同名特性不重复授予。
  - 完成标准：
    - `战士5/野蛮人5` 的攻击次数为 2；`战士11/野蛮人5` 为 3。
    - `武僧2/术士3（龙族体魄）` 的 AC 只能取一种公式，未选择时给中文提示。
    - `牧师6/圣武士4` 的引导神力次数为 2、使用方式为两类并集。
  - 验证：`app/test/rules/multiclass-feature-conflicts.test.ts`。

- [x] **MC-C03：依赖影响与升降级（class-allocation）**
  - 交付：`DraftChange` 新增 `class-allocation`；受影响／需复查／保留三分类；失效与停用历史。
  - 范围：`rules/dependency.ts:9-17,108-159`、`rules/spell-selection-reconciliation.ts:62-135`、`views/.../hooks/useCharacterBuilderPage.ts:366-433`（规则部分）。
  - 规则依据：需求 R7——实现为「旧分配 vs 新分配」两条时间线求差；关闭开关触发的合并不改变总等级但改变职业集合，走同一变更类型。
  - 完成标准：新增职业→列入「待补全」；降级／移除职业→列入「将失效」并保留记录；法术按归属职业归档进 `inactiveSpellSelections`；`target-level` 兼容分支行为不变。
  - 验证：`app/test/rules/multiclass-dependency.test.ts`。

- [x] **MC-C04：兼职校验**
  - 交付：`validateDraft` 的兼职错误项与中文修正指引。
  - 范围：`rules/validate.ts:53-54,294-391,649-731`。
  - 完成标准：先决不满足报 error、总等级不符报 error、子职不属于其职业按**职业配对**报错（现状 `validate.ts:685-693` 是单值比较）、`subclass-feature-` 前缀匹配改为职业限定、`uniqueGroup` 去重改为「同职业内唯一」以避免跨职业锁死专精（需求 §6.3 缺口 3）。
  - 验证：`app/test/rules/multiclass-validate.test.ts`。

- MC-C01 完成记录（2026-10-11）：`TimelineContext` 新增 `classes`／`classSubclassIds`，`buildTimeline` 按职业集合展开并注入 `classId`／`classLevel`；新增统一入口 `buildTimelineForDraft`（含 `targetLevelOverride` 按比例缩放），6 处调用点全部改用它。**缺口 2 以「字段表达归属」关闭**：`subclass-feature-<id>` 前缀被 4 处字面匹配与 10+ 夹具引用，改 id 收益不抵成本，改用 `classId` 字段。`multiclass-timeline.test.ts` 10 项通过。

- MC-C02 完成记录（2026-10-11）：新增 `rules/multiclass-features.ts`（`listCharacterFeatures` 按各职业自己的等级汇总、`resolveExtraAttack` 额外攻击取最大值、`resolveArmorClassFormula` 收集 AC 公式、`resolveSharedResources` 同名资源合并）；`session-resources.ts` 的 `grantedFeatures` 改用它（同时获得来源开关过滤）。`multiclass-features.test.ts` 13 项。
- MC-C03 完成记录（2026-10-11）：`DraftChange` 新增 `class-allocation`；实现为「旧分配 vs 新分配」两条时间线求差，复用 added／invalidatedDetails／reviews／spellUpdates；关闭开关触发的合并走同一类型。`multiclass-dependency.test.ts` 覆盖新增／降级／移除／合并／清空 5 种场景。
- MC-C04 完成记录（2026-10-11）：新增 `validateMulticlassAllocation`（总等级一致性、等级范围、起始职业存在、先决 error／pending）；`validateSubclassSelections` 改为按**职业配对**校验（子职必须属于该职业、按该职业等级判断解锁），错误 id 带上职业。
- 批次验证（2026-10-11）：`vue-tsc -b` 通过；`vitest run` **219 文件／2201 项全通过**（本批新增 2 文件／22 项）；`npm run build` 通过。
- 过程中修掉的连带影响：① `fallbackEntry` 未带上 `subclassId`，导致单职业草稿的「按职业取子职」路径丢子职（补上后 `getClassSubclassIds` 与旧 `draft.subclassId` 行为一致）；② `listCharacterFeatures` 新增来源开关过滤后，`b10-session-acceptance` 的全量验收用例需要显式启用全部来源，且需按「特性已获得的等级」而非固定 20 级核对资源上限。

**交付物**：多职业时间线、特性互斥与资源合并、升降级依赖清单、兼职校验。
**完成标准**：兼职草稿的时间线可完整走通并通过校验；单职业时间线与校验结果不变。

---

### MC-D：法术

- [x] **MC-D01：兼职施法等级与通用法术位池（D1）**
  - 交付：`getMulticlassSpellcastingLevel(draft)` 与 `getMulticlassSpellSlots(draft)`；兼职施法者法术位表数据。
  - 范围：`rules/spellcasting.ts:19-56`、`rules/data/multiclass-2014.ts`（法术位表）、2024 侧登记。
  - 规则依据：需求 §2.8 表与 §2.8 累加规则；**半施法者向下取整**（D1）。
  - 完成标准：`游侠4/术士3 → 4/3/2`；`圣武士6/魔契师1` 的普通池按 6÷2=3；`战士3（奥法骑士）/法师5` 按 1+5=6；纯非施法兼职（如 `战士3/游荡者2`）施法等级 0、无池。
  - 验证：`app/test/rules/multiclass-spell-slots.test.ts`（1—20 级全表逐一比对 + 上述案例）。

- [x] **MC-D02：契约魔法双池与施法属性**
  - 交付：普通池与契约池并存；每职业施法属性解析。
  - 范围：`rules/spellcasting.ts:32-43,412-419`、`rules/repository.ts:88-94`、`rules/repository-builder.ts:33-39`。
  - 完成标准：`魔契师3/法师5` 同时有契约池与普通池，两池可互相施放对方来源法术；法术攻击／DC 按**归属职业**分别给出（可多个），角色卡并列展示。
  - 验证：`app/test/rules/multiclass-pact-magic.test.ts`。

- [x] **MC-D03：每职业法术选择与候选池**
  - 交付：按职业分桶的数量校验、候选池、升环施法与始终准备。
  - 范围：`types/character.ts:92-103`、`rules/spellcasting.ts:90-210,342-398,540-626,751-794`、`rules/spellbook.ts:58-64`、`rules/spell-selection-reconciliation.ts`。
  - 规则依据：需求 §2.8——必须为每个职业分别制定已知／准备列表，每个法术只与一个职业关联，只能用该职业施法属性施展；戏法威力按总等级（与 MC-D05 配合）。
  - 完成标准：`游侠4/术士3` 的游侠与术士列表各自校验数量与环级上限（不能准备 2 环游侠法术）；法术池按归属职业取；未习得的高环位仍可升环施展低环法术。
  - 验证：`app/test/rules/multiclass-spell-selection.test.ts`。

- [x] **MC-D04：法术选择按职业归属的存储与迁移**
  - 交付：`ClassSpellSelections` 落盘；顶层数组作为兼容读取视图；`inactiveSpellSelections.sourceKey` 写入归属职业。
  - 范围：`types/character.ts:92-112`、`services/draft-storage.ts` 的 v10 分支（与 MC-A02 对齐）、`rules/spell-selection-reconciliation.ts:114,135`。
  - 完成标准：单职业草稿仍读写顶层字段且往返不变；多职业草稿以 `classSpellSelections` 为事实源；停用记录能区分是哪个职业丢失的法术。
  - 验证：`app/test/services/spell-selection-storage.test.ts`。

- [x] **MC-D05：戏法成长建模与 2014 数据补录（D4／D11／D12）**
  - 交付：`CantripScalingRule` 类型 + `getCantripScalingAtLevel`；两版 0 环法术成长数据。
  - 范围：`types/rules.ts`（`SpellRule` 新增字段）、`rules/data/spells-2014.ts`（**需新写**，约 25—30 条，现状只有名称／环级／职业／来源，无 `description`）、`rules/data/spells-2024.ts`（已有展示文本，需转为结构化字段，**不得解析文本**）。
  - 规则依据：需求 §4.5；2024 文本形态参考 `spells-2024.ts:33`（火焰箭「5/11/17级各+1d10」）与 `:31`（魔能爆光束数）。
  - 边界：法术位升环成长**不归**本字段；未登记条目不显示成长行、不写「无成长」（D12）；成长值只进展示与导出，**不接入战斗结算**（D11）。
  - 完成标准：火焰箭在角色总等级 1/4/5/10/11/16/17 → 1d10/1d10/2d10/2d10/3d10/3d10/4d10；`游侠4/术士3` 的术士戏法按总等级 7 取值；未登记条目返回空。
  - 验证：`app/test/rules/cantrip-scaling.test.ts`（含逐条数据完整性守卫）。

- [x] **MC-D06：2024 兼职数据登记（含 UA 职业，D8）**
  - 交付：2024 全部职业的兼职先决、兼职受训、施法系数；UA 奇械师与灵能使登记。
  - 范围：`rules/data/*-2024.ts`、`rules/data/ua-artificer-2024.ts`、`rules/data/psion-2024.ts`、`rules/data/multiclass-2024.ts`（新建）。
  - 规则依据：需求 §2.6 的 2024 栏（各职业「作为兼职角色」条目，逐条已注明文件与行号）。
  - 完成标准：13 个 2024 职业（12 核心 + UA 奇械师）+ 灵能使可兼职；只获得该条目列出的能力（武僧／术士／法师仅生命骰）；第三方职业按模块头注记，未核验者标「先决条件待核验」。
  - 验证：`app/test/rules/multiclass-2024.test.ts`。

- MC-D01 完成记录（2026-10-11）：新增 `rules/data/multiclass-spell-slots-2014.ts`（兼职施法者表 20×9）与 `getMulticlassSpellcastingLevel`／`getMulticlassSpellSlots`；`getEffectiveSpellSlots` 在两个及以上职业时走兼职表，单职业保持各职业自己的表（游侠5 仍 `4/2`、法师5 仍 `4/3/2`、魔契师3 仍 `2:2p`）。契约池随本任务落地（`pact: true`，按魔契师自身等级查表）。`multiclass-spell-slots.test.ts` 21 项通过，含 **D1 直接验证**（圣武士5 半施法向下取整为 2）。
- MC-D03 读取路径完成记录（2026-10-11）：新增 `getClassSpellSelections`／`usesClassSpellSelections`／`listClassSpellSelections`；`getEffectiveSelectedSpellIds` 兼职时合并各职业归属的法术。**候选池与数量校验仍按单职业**，故本任务保持未勾选。
- MC-D06 数据部分已由 MC-B 提前落地（2024 先决与兼职熟练项），施法系数随 MC-D01 落地。

- MC-D05 完成记录（2026-10-11）：新增 `types/rules.ts` 的 `CantripScalingRule` 与 `SpellRule.cantripScaling`；新增数据文件 `data/cantrip-scaling-2014.ts`（**25 条**）与 `data/cantrip-scaling-2024.ts`（**18 条**），全部从 5e 不全书法术详述逐条核对（2014 侧原文无结构化数据，属新写；2024 侧由「戏法强化」段转录，不解析展示文本）；新增 `getCantripScalingAtLevel`／`getDraftCantripScaling`。`cantrip-scaling.test.ts` 15 项通过。
- MC-D05 数据边界（决策 D12）：只登记「影响实际数值」的成长（伤害骰／射线数／骰型），共 43 条；**35 条已收录但无已核验成长数据的扩展戏法不登记**，界面不显示成长行也不写「无成长」。
- MC-D02／D03／D04／D06 完成记录（2026-10-11）：引入 **施法作用域**（`SpellcastingScope`／`listSpellcastingScopes`），把「数量／候选／已选／校验」全部改为按**各职业自己的等级与法术选择分桶**取值；第 8 步按职业分派任务（`<classId>:<kind>`）并写回对应分桶（顶层数组镜像为并集兼容视图）；新增 `getClassSpellcastingProfiles` 按归属职业给出法术攻击／DC（`游侠4/术士3` → 游侠 `+4/DC12`、术士 `+6/DC14`），角色卡与跑团助手并列展示；`reconcileSpellSelections` 支持 `nextMulticlass`，停用记录的 `sourceKey` 写入**丢失该法术的职业**；未登记先决的提示改用 D8 的措辞「先决条件待核验」。修掉三个实际缺陷：第二个施法职业完全不可选、环级上限误用角色总等级、无分桶的第二职业会读到起始职业的法术。新增 4 个测试文件（36 项）。
- MC-F01 完成记录（2026-10-11）：导出模型新增 `identity.classRows`、`combat.hitDiceTotal`、`spellcasting.classes`／`pactNote`、`ExportSpell.className`、`ExportCantrip` 与 `formatExportCantripScaling`；PDF 与 XLSX 按多职业输出职业行、生命骰、法术位（含契约池说明）、法术归属与戏法成长（D11 第四处展示接入）。**修掉 `getEffectiveSpellSlots` 的既有缺陷**：通用池与契约池同环时互相覆盖，导致 `魔契师3/法师5` 丢掉 2 环通用位。单职业导出逐字段不变。新增 `multiclass-export.test.ts`（14 项）。
- MC-F02 完成记录（2026-10-11）：`validateDraft` 在兼职时逐职业核对法术选择，问题带归属职业、当前值与最高环级，并给出可执行指引（「回到第 8 步，切到「… · 游侠」任务」「提高游侠的等级」等）；单职业分支保持原样。新增 `multiclass-validation-readability.test.ts`（7 项，含「消息里不出现原始英文 id」的可读性底线）。
- MC-F03 完成记录（2026-10-11）：新增 `multiclass-flow.test.ts`（11 项）逐条判定需求 §1.3 的三条成功标准与情景清单；产出[验收记录](兼职（多职业）支持验收记录.md)。仓库现有 13 个 2014 职业，字面构造「20 个职业各 1 级」不可行，改用「13 个真实职业各 1 级」+「13 真实 + 7 占位 = 20 项」验证规则层上限，并已在记录中说明。
- MC-F04 完成记录（2026-10-11）：`docs/rules.md`（角色结构／暂不包含／TODO／兼职完整口径）、`docs/dnd-classes.md`（新增 §5.13 兼职先决与兼职熟练项，§7 增加兼职检查项）、`docs/frontend-architecture.md`（rules 层依赖清单 + 兼职拓扑小节，**已更新**）、`.agents/AGENTS.md`（当前范围）；`CHANGELOG.md`、`app/src/constants/update-notices.ts`、`app/package.json` 三处同步为 **v1.13.0**；历史 v1.3.0 条目中的「多职业不在本轮」按历史记录保持原样。
- 全部批次完成（2026-10-11）：27 项 TODO 全部勾选。最终验证：`vue-tsc -b` 通过；`vitest run` **234 文件／2367 项全通过**；`npm run build` 通过。**已复核前端依赖拓扑，已更新** `docs/frontend-architecture.md`。
- 批次验证（2026-10-11）：`vue-tsc -b` 通过；`vitest run` **231 文件／2333 项全通过**；`npm run build` 通过。已复核前端依赖拓扑：无新目录、无依赖方向变化，无需更新 `docs/frontend-architecture.md`。

**交付物**：兼职施法等级与法术位、契约双池、每职业法术选择与存储、戏法成长数据、2024 登记。
**完成标准**：需求 §1.3 的成功标准第 2、3 条可通过自动化测试判定。
**批次状态（2026-10-11）**：MC-D01—MC-D06 全部完成。

---

### MC-E：界面

- [x] **MC-E01：职业与等级分配控件（D2／D9／D10／D13）**
  - 交付：一个可复用控件（`features/character-builder-allocation/` 或页面私有组件，按实施时的依赖拓扑定），含开关、只读总等级、职业行、添加职业、起始职业标记、关闭确认。
  - 范围：新建组件 + 页面 hooks；`views/character-builder/components/LevelAdjustModal.vue:19-34,51-71`。
  - 规格：需求 §5.1.1—§5.1.7 全文；开关文案「启用兼职」+ 旁注「可选规则，需 DM 同意」（D10）；职业数不设上限、列表需滚动／折叠（D9）；先决不足为行内 warning + 「去第 5 步」跳转、无顶部横幅（D13）；关闭开关的防误触四条（D7）。
  - 完成标准：单职业模式保留 1—20 大网格且观感与今天一致；兼职模式上下结构符合 §5.1.3；三处入口共用同一控件与同一份数据；不存在独立的总等级输入。
  - 验证：`app/test/components/multiclass-allocation-control.test.ts` + 页面 hooks 测试。

- [x] **MC-E02：第 1 步与第 3 步接入（D6）**
  - 交付：`SetupStep.vue` 与 `ClassStep.vue` 接入控件；第 3 步完成判定改为分配完成。
  - 范围：`views/character-builder/components/SetupStep.vue:1-72`、`ClassStep.vue:12-36`、`views/character-builder/index.vue:193-199`、`hooks/useCharacterBuilderPage.ts:135-155,435-466`。
  - 关键约束：现有 `selectClass` 是**替换语义**（整体作废全部 `selections` 并重建起始装备）；新增第二职业必须走独立的**追加**分支，不能复用替换分支（需求 §6.2）。
  - 完成标准：第 1 步分配完成后第 3 步直接呈现结果并可点下一步（D6）；新增职业不触发全量失效；更换起始职业仍走既有整体替换确认。
  - 验证：`app/test/views/character-builder-setup-class.test.ts`。

- [x] **MC-E03：角色卡与等级调整弹窗、防误触（D7）**
  - 交付：角色卡多职业头部与分区；`LevelAdjustModal` 重做；关闭开关确认流程。
  - 范围：`CharacterSheetStep.vue:117-128,459-467,591-598,751-799`、`LevelAdjustModal.vue`、`hooks/useCharacterBuilderPage.ts:324-433`、`constants/update-notices.ts` 与 `CharacterSheetStep.vue:661` 的「多职业不在本轮」文案（需求 §6.3 缺口 4）。
  - 完成标准：头部显示「战士3 / 游荡者2（5 级角色）」；能力页按职业分区；生命骰分组；法术位双池；关闭开关时先弹明细确认且取消为主操作。
  - 验证：组件测试 + 交互流程测试。

- [x] **MC-E04：时间线、法术与装备步骤展示**
  - 交付：三处步骤的多职业展示。
  - 范围：`TimelineStep.vue:21-22,34,283,403-404`、`SpellcastingStep.vue:56-114,244-248`、`hooks/useSpellcastingStepFlow.ts:60-88`（任务 id 加职业前缀）、`EquipmentStep.vue:37-38,143,224`。
  - 完成标准：检查点标注「战士 3 级 · 选择武术范型」；法术任务按「职业 × 任务」分组（id 不再冲突）；装备步骤只显示起始职业并提示「兼职不获得新职业的起始装备」。
  - 验证：三个页面的组件测试。

- [x] **MC-E05：跑团助手与草稿列表摘要**
  - 交付：跑团助手多职业展示与按骰面消耗；列表条目摘要。
  - 范围：`SessionPanel.vue:177-188,353,429-444`、`hooks/useSessionPanel.ts:38,43-46,106-107,180-191,205-208`、`StartPanel.vue:60-65,102`、`features/quick-build/components/CharacterDrawer.vue:10-14`。
  - 完成标准：跑团头部显示多职业与总等级；生命骰可按骰面选择与消耗；资源合并展示；列表显示「战士3/游荡者2 · 5级」。
  - 验证：跑团页面与列表组件测试。

- MC-E01 完成记录（2026-10-11）：新建 `views/character-builder/components/ClassAllocationControl.vue`（开关「启用兼职」+ 只读总等级 + 单职业 1—20 网格／兼职逐职业步进 + 添加职业 + 关闭确认 + 变更摘要）；`ClassAllocationControl.test.ts` 19 项。关闭兼职的确认含不可撤销提示、逐条合并明细与 `danger` 按钮，取消按钮命名为「保留兼职」避免与普通取消混淆。
- MC-E02 完成记录（2026-10-11）：`SetupStep`／`ClassStep` 接入同一控件（决策 D6 第 1／3 步都能分配）；页面 hook 新增 `applyClassAllocation`（走 `class-allocation` 依赖变更，`alwaysConfirm`）与 `applyAllocationFromSetup`；第 3 步继续条件由 `Boolean(classId)` 改为「分配完成」。3 个既有组件测试补齐 `draft` prop。

- MC-E03 完成记录（2026-10-11）：角色卡头部显示「战士3 / 游荡者2（5 级角色）」；职业／子职特性按职业分区且各按**该职业等级**过滤；法术位支持通用池与契约池并存展示；戏法按角色总等级标注成长值（D11 第一处展示接入，未登记条目不显示，D12）；`LevelAdjustModal` 改为复用 `ClassAllocationControl`；移除用户可见的「多职业不在本轮」文案（`update-notices.ts` 的历史版本条目按历史记录保留）。新增 `multiclass-sheet.test.ts` 11 项。
- MC-E04 完成记录（2026-10-11）：`TimelineStep` 的检查点改由 `buildTimelineForDraft(props.draft)` 构建（此前手工拼参导致兼职信息全部丢失），归属职业的检查点显示「职业 + 该职业等级」，职业特性区块并列全部职业；法术任务 id 改为 `<classId>:<kind>` 且组件一律按后缀分派；装备步骤补起始职业口径提示（不改选择逻辑）。`inferredUniqueGroup` 只对 `subclass-feature-*` 加职业前缀——统一加前缀会让游荡者 1／6 级专精的跨等级去重失效。新增 `multiclass-timeline-equipment.test.ts` 7 项。
- MC-E05 完成记录（2026-10-11）：新增 `getClassLevelLabel`（需求 §3.1 统一格式）并接入角色卡头部、跑团助手标题、草稿列表与车卡吸底摘要；跑团助手**修掉两个既有缺陷**——① 生命骰池此前传数字上限，兼职角色永远只有一个骰面，现改传 `getHitDiceFaces` 实现 `d10:10 + d8:5` 分组并按骰面消耗；② 资源上限误用角色总等级，现按所属职业等级取值；同时按 R5.3 把同名资源（引导神力）合并为一个计数池（单职业结果与既有存档零变化），并移除 MC-C02 遗留的未调用、口径错误的 `resolveSharedResources`。新增 3 个测试文件（21 项）。
- 批次验证（2026-10-11）：`vue-tsc -b` 通过；`vitest run` **227 文件／2297 项全通过**；`npm run build` 通过。已复核前端依赖拓扑：无新目录、无依赖方向变化，无需更新 `docs/frontend-architecture.md`。

**交付物**：分配控件、七个页面的多职业展示、文案更新。
**完成标准**：手机宽度下可从创建到角色卡走通兼职角色；关闭开关的破坏性动作有完整防误触。
**批次状态（2026-10-11）**：MC-E01—MC-E05 全部完成，实测 227 文件／2297 项测试通过、类型检查与生产构建通过。达成里程碑 P3：手机宽度下兼职角色可创建、编辑、跑团使用。

---

### MC-F：导出、校验与整体验收

- [x] **MC-F01：导出字段映射与落地**
  - 交付：`CharacterExportModel` 多职业字段；PDF／XLSX／JSON／ZIP 输出。
  - 范围：`features/character-export/build-export-data.ts:81-123,172-182,258-259,399-405,444,452,463`、`services/export-pdf.ts:590,602-603,536-561`（`Spellcasting Class 2` 字段已存在但只写一个值）、`services/export-xlsx.ts:80,92,99,108,132`、`services/character-package.ts`。
  - 完成标准：职业行、等级、生命骰、法术位（含契约池）、法术归属、戏法成长（D11 四处统一展示）全部按多职业输出；单职业导出结果与今天逐字段一致。
  - 验证：导出模型与 PDF／XLSX 既有测试扩展；JSON／ZIP 双向往返用例。

- [x] **MC-F02：兼职校验与可读性**
  - 交付：校验页与提示的中文原因复核。
  - 范围：`rules/validate.ts`、`ValidationStep.vue`、步骤门禁提示。
  - 完成标准：新玩家能理解「为什么不能兼这个职业」「这个数值来自哪个职业」「关闭兼职会发生什么」；错误提示均含修正指引。
  - 验证：`app/test/rules/multiclass-validate.test.ts` 的可读性断言 + 校验页组件测试。

- [x] **MC-F03：整体验收与情景清单**
  - 交付：兼职目标案例清单与验收记录。
  - 内容：至少覆盖——`战士3/游荡者2`（无施法）、`游侠4/术士3`（§1.3 案例）、`圣武士6/魔契师1`（双池）、`战士3（奥法骑士）/法师5`（1/3 施法）、`20 个职业各 1 级`（D9 极端分配）、关闭兼职开关的合并流程、降级移除职业后的失效与恢复、v9 草稿迁移前后的数值对照。
  - 完成标准：`pnpm test`、`vue-tsc -b`、`pnpm build` 全部通过；218 个既有测试文件无回归。
  - 验证：`app/test/features/multiclass-flow.test.ts` + 验收记录文档。

- [x] **MC-F04：文档与公告同步**
  - 交付：规则、专项资料、拓扑与公告的同步。
  - 范围：`docs/rules.md`（「暂不包含多职业」「角色结构」条目）、`docs/dnd-classes.md`（新增兼职先决与兼职熟练项章节）、`docs/frontend-architecture.md`（新增模块时）、`CHANGELOG.md` + `app/src/constants/update-notices.ts` + `app/package.json`（按 `.agents/AGENTS.md` 第 8 条同步，**版本号在具体更新任务中确定，本计划不预设**）。
  - 完成标准：文档与实现一致；交付说明写明「已复核前端依赖拓扑，已更新／无需更新」。
  - 验证：文档检查清单（`docs/dnd-classes.md` §7 的更新检查）。

**交付物**：导出承载、校验可读性、验收记录与文档同步。
**完成标准**：可按需求文档 §1.3 的成功标准逐条声明完成；未完成条目仍保持不可选或明确标注。

## 4. 分批里程碑

| 里程碑 | 必须满足 | 允许声明的成果 |
| --- | --- | --- |
| P0：可制定更新任务 | 需求文档 D1—D13 已确认 | 本 TODO 可展开为具体更新任务 |
| P1：数据与规则可验证 | MC-A、MC-B | 兼职草稿可保存、可计算、可通过校验；界面仍不可用 |
| P2：完整规则闭环 | P1 + MC-C、MC-D | 时间线、特性、法术与法术位全部正确；可自动化验证 |
| P3：产品闭环 | P2 + MC-E | 手机宽度下兼职角色可创建、编辑、跑团使用 |
| P4：可交付 | P3 + MC-F | 兼职角色可导出；文档与公告齐备 |

达成 P1 之前不得开始界面改造；达成 P3 之前不得更新公告文案（避免向用户暴露半成品）。

## 5. 依赖关系与建议执行顺序

```text
MC-A01 ─┬─> MC-A02 ─┬─> MC-B01 ─> MC-B02 ─┬─> MC-C01 ─> MC-C02 ─> MC-C03 ─> MC-C04
        │           │                     │
MC-A03 ─┘           └─> MC-B03 ─> MC-B04 ─┘
                                          └─> MC-D01 ─> MC-D02 ─> MC-D03 ─> MC-D04
                                                    MC-D05（可独立并行，只依赖 A01）
                                                    MC-D06（依赖 B01／B02 的字段定义）
MC-C01 + MC-D04 + MC-E01 ─> MC-E02 ─> MC-E03 ─> MC-E04 ─> MC-E05
MC-E05 + MC-D05 ─> MC-F01 ─> MC-F02 ─> MC-F03 ─> MC-F04
```

可并行的起点：MC-A01 与 MC-D05（戏法成长只依赖类型定义）、MC-B01 与 MC-B03（共用 A01 产出）。

**关键路径**：MC-A01 → MC-A02 → MC-B01 → MC-B02 → MC-C01 → MC-D04 → MC-E01 → MC-E03 → MC-F01 → MC-F03。

## 6. 下一步更新任务的统一模板

每个更新任务至少填写以下内容，不直接复制整个批次作为一个大任务：

```markdown
# <功能范围> · 更新任务

- 对应 TODO：MC-xnn（细拆时保留父编号）
- 当前状态：待开始
- 目标：完成后玩家能做什么
- 前置依赖：已完成条目、规则证据、尚缺决定
- 本次范围：规则集、职业、等级或条目集合
- 不包含：明确留给其他 TODO 的工作
- 规则依据：不全书章节为主；需求文档 §2 对应小节
- 影响入口：核验后的页面、hooks、store、rules、services、types
- 实施步骤：先类型与规则测试，再界面或存储
- 验证：合法、边界、缺选、冲突、保存恢复及单职业回归
- 文档同步：规则、专项资料、拓扑及需要时的公告
- 完成标准：可判定通过的条件与证据
- 结果回填：变更、检查结果、剩余问题、允许勾选的 TODO
```

## 7. 通用完成检查

- 每项实现遵守项目技能、目录权限与 `rules` 框架无关约定；开工前重新核对代码位置、扇入与扇出。
- 单职业回归是每个批次的硬性检查：任何批次完成后，单职业草稿的数值、校验与导出必须与改造前一致。
- 代码任务按影响执行规则／状态／服务／组件测试，并完成类型检查、自动化测试与生产构建。
- TODO 必须关联交付证据；状态变化不能只写「已完成」而无检查结果。
- 不预先分配版本号；何时成为一次用户可见更新，在具体更新任务中确定。
- 未获得用户明确要求，不执行 `git commit`、`git push` 或分支合并。
