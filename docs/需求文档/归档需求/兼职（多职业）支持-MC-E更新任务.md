# MC-E 界面 · 更新任务

- 对应 TODO：MC-E01—MC-E05（父批次 MC-E）
- 当前状态：**已完成**（MC-E01—MC-E05 全部执行完毕）
- 目标：手机宽度下，玩家可以在第 1 步与第 3 步分配职业等级、开启兼职、添加／移除职业，并安全地关闭兼职；角色卡与跑团助手正确展示多职业。
- 前置依赖：MC-A（类型与存储）、MC-B（先决与熟练项）、MC-C（时间线与依赖变更）、MC-D（法术位与戏法成长）。
- 不包含：导出承载（MC-F01）。
- 规则依据：需求 §5.1（分配控件规格全文）、D2／D5／D6／D7／D9／D10／D13。

## 1. 实施步骤

1. **MC-E01 职业与等级分配控件（已完成）**
   - 新建 `views/character-builder/components/ClassAllocationControl.vue`：开关 + 只读总等级 + 单职业 1—20 大网格 / 兼职逐职业步进 + 添加职业 + 关闭确认 + 变更摘要。
2. **MC-E02 第 1 步与第 3 步接入（已完成）**
   - `SetupStep`、`ClassStep` 接入控件；`index.vue` 接线；页面 hook 新增 `applyClassAllocation` 与 `applyAllocationFromSetup`（走 `class-allocation` 依赖变更）；第 3 步继续条件改为「分配完成」。
3. **MC-E03 角色卡与等级调整弹窗、防误触（已完成）**
   - `CharacterSheetStep` 头部多职业行；`LevelAdjustModal` 改用同一控件；更新「多职业不在本轮」的用户可见文案。
4. **MC-E04 时间线、法术与装备步骤展示（已完成）**
   - 检查点按归属职业标注「职业 N 级」；职业特性区块并列全部职业；法术任务按「职业 × 任务」；装备只显示起始职业并提示。
5. **MC-E05 跑团助手与草稿列表摘要（已完成）**
   - 多职业显示、生命骰按骰面消耗、资源合并、列表摘要；详见 §5 与 §6。

## 2. 验证

- 控件：单职业网格、兼职步进、20 级禁用加号、起始职业不可移除、降到 0 移除职业、添加职业、关闭确认（不可撤销 + 明细 + 警示按钮）、变更摘要、先决 warning 不阻断。
- 接入：两处入口共用同一份数据；第 3 步分配完成后可直接继续；单职业流程观感不变。
- 回归：全量测试与生产构建。

## 3. 完成标准

- 手机宽度下可从第 1 步分配职业等级、在第 3 步直接继续，并安全关闭兼职。
- 单职业流程与既有行为一致。

## 4. 结果回填

### 4.1 MC-E01 执行记录（2026-10-11）

| 文件 | 变更 |
| --- | --- |
| `app/src/views/character-builder/components/ClassAllocationControl.vue`（新增） | 分配控件全文实现 |
| `app/test/components/ClassAllocationControl.test.ts`（新增） | 19 项 |

**实现要点**：
- **开关文案**（D10）为「启用兼职」，旁注「可选规则，需 DM 同意」。
- **总等级只读**（D2）：显示为「总等级 N 级」+ 构成「战士 3 + 游荡者 2」，无任何输入控件。
- **单职业保留 1—20 大网格**；兼职用逐职业 `−/＋` 步进，职业数不设上限（D9），列表可纵向滚动。
- **加号禁用**：总等级 20 或该职业已达 19 级。
- **起始职业**的减号在其 1 级时禁用（不可移除）；其他职业降到 0 走 `removeClassEntry`（D5）。
- **关闭兼职的防误触**（D7）：打开→关闭时弹确认，含常驻说明、不可撤销提示、逐条「将合并：X n 级」明细、`danger` 样式按钮；取消按钮文案为「保留兼职」（避免与普通「取消」混淆）。
- **先决不满足**（D13）在该职业行内以 warning 显示中文原因，**不阻断确认**。
- **每次分配动作立即 emit `apply`**，控件不复制页面的依赖影响逻辑；控件内部的摘要与关闭确认只作用于本地待定草稿。

### 4.2 MC-E02 执行记录（2026-10-11）

| 文件 | 变更 |
| --- | --- |
| `SetupStep.vue` | 等级滑杆 → `ClassAllocationControl`；新增 `allocation` 事件；保留 `level` 事件以兼容既有调用 |
| `ClassStep.vue` | 顶部接入同一控件（决策 D6：第 3 步也能分配等级）；新增 `allocation` 事件 |
| `index.vue` | 两处接线到页面 hook；补充 `CharacterDraft` 类型导入 |
| `hooks/useCharacterBuilderPage.ts` | 新增 `applyClassAllocation`（走 `class-allocation` 变更 + `alwaysConfirm`）与 `applyAllocationFromSetup`；`canContinue` 的职业步改为 `allocationComplete` |
| 测试 | `ClassStep`／`SetupStep`／`version-aware-steps-2024` 三个既有测试补齐 `draft` prop |

**关键行为**：
- **第 1 步与第 3 步共用同一份分配数据**：两处渲染同一控件、读写 `draft.multiclass`，不存在「第 1 步的总等级」与「第 3 步的职业等级」两份状态。
- **第 3 步可直接继续**（D6）：`canContinue` 由 `Boolean(draft.classId)` 改为「各职业等级之和 = 总等级、总等级 1—20、每个职业 ≥1 级」；未选职业但总等级合法时也允许继续（职业列表就在本步，选完即满足）。
- **分配变更走 `class-allocation` 依赖变更**：移除职业、降级与改子职会列出「已移除职业」「法术位与已知／准备法术」「子职及其特性选择」等受影响项，命中失效选择时弹三分类确认。
- **单职业观感不变**：大网格点击即设置唯一职业等级，与改造前的滑杆行为等价（等级仍写入 `targetLevel`）。

### 4.3 批次验证（2026-10-11）

| 检查 | 结果 |
| --- | --- |
| `npx vue-tsc -b` | 通过 |
| `npx vitest run`（全量） | **222 文件 / 2256 项通过**（MC-D 后为 221／2237；本阶段新增 1 文件 / 19 项） |
| `npm run build` | 待本批结束时统一执行 |
| 拓扑复核 | 新增页面私有组件与既有 `views/character-builder/components` 同目录，无新目录、无依赖方向变化 → **无需更新** `docs/frontend-architecture.md` |

### 4.5 MC-E03 执行记录（2026-10-11）

| 文件 | 变更 |
| --- | --- |
| `CharacterSheetStep.vue` | 新增 `classLevelLabel`（「战士3 / 游荡者2（5 级角色）」）；`identityLine` 改为多职业；`classInfo` 按**该职业等级**过滤特性；新增 `classInfos`（逐职业等级／子职／已解锁特性／起始职业标记）；职业特性与子职特性按职业分区渲染；法术位标签支持通用池与契约池并存；戏法新增按角色总等级的成长标注；2024 边界说明移除「多职业不在本轮」 |
| `LevelAdjustModal.vue` | 改为复用 `ClassAllocationControl`（决策 D2／D6），总等级显示在标题，单职业时仍是 1—20 网格 |
| `index.vue` | 弹窗事件由 `confirm(level)` 改为 `apply(draft)`，转发到 `applyClassAllocation`；移除已无调用方的 `adjustLevel` 解构 |
| 测试 | 新增 `multiclass-sheet.test.ts`（11 项） |

**关键行为**：
- **职业行**：兼职显示「战士3 / 游荡者2（5 级角色）」；单职业仍为「战士5」，不出现括号（避免单职业玩家看到多余信息）。
- **特性按各职业自己的等级过滤**：`战士3/野蛮人5` 时野蛮人区块有「额外攻击」、战士区块没有。
- **子职特性按职业配对展示**：标题带其所依附的职业与等级，如「子职特性 · 战斗大师（战士3 级）」；子职等级不足时给出该子职的空特性提示（保留既有文案）。
- **法术位双池**：`魔契师3/法师5` 显示「契约：2 个 2 环（短休恢复）」与「1环×4」，不再只显示第一个池（原实现只显示 `spellSlots[0]`）。
- **戏法成长标注**（D11 的第一处展示接入）：已达成长节点的戏法在描述行显示「按角色总等级 7 级：当前 2d10」；未达节点或未登记成长规则的不显示任何成长文案（D12）。
- **用户可见文案**：`CharacterSheetStep.vue` 的 2024 边界说明由「生物／召唤数据与多职业不在本轮」改为「兼职（多职业）已支持，生物／召唤数据不在本轮」。
- **历史公告不动**：`constants/update-notices.ts` 中 v1.3.0 条目的「多职业不在本轮」是**当时版本的边界说明**，属历史记录，保持原样；兼职上线时由新的版本条目宣告。

### 4.6 批次验证（2026-10-11）

| 检查 | 结果 |
| --- | --- |
| `npx vue-tsc -b` | 通过 |
| `npx vitest run`（全量） | **223 文件 / 2267 项通过**（E02 后为 222／2256；本阶段新增 1 文件 / 11 项） |
| `npm run build` | 通过（`vite-ssg` + PWA） |
| 拓扑复核 | 无新目录、无依赖方向变化 → **无需更新** `docs/frontend-architecture.md` |

### 4.8 MC-E04 执行记录（2026-10-11）

| 文件 | 变更 |
| --- | --- |
| `TimelineStep.vue` | `checkpoints` 改用 `buildTimelineForDraft(props.draft)`（原先手工拼 `buildTimeline` 参数，兼职信息全丢）；新增 `checkpointLevelLabel`，归属职业的检查点显示「职业 + 该职业等级」；职业特性区块改为列出**全部职业**已解锁的自动获得特性并标注归属 |
| `rules/timeline.ts` | `inferredUniqueGroup` 对 `subclass-feature-*` 检查点按归属职业限定组名 |
| `SpellcastingStep.vue` | 新增 `activeTaskKind()`：任务 id 改为 `<classId>:<kind>` 后，一律按**后缀**分派，替换全部 `activeTaskId === '…'` 字面比较 |
| `hooks/useSpellcastingStepFlow.ts` | 任务 id 加职业前缀；草稿缺 `classId` 的旧夹具回退到时间线首个职业检查点的归属 |
| `EquipmentStep.vue` | 兼职时显示起始装备口径提示 |
| `test/components/SpellcastingStepBard/Cleric/Wizard.test.ts` | 选择器改为 `[data-task-id$=":cantrips"]` 等后缀匹配 |
| `test/components/multiclass-timeline-equipment.test.ts`（新增） | 7 项 |

**关键行为**：
- **检查点标签不再歧义**：`战士3/游荡者2` 的头部分别显示「战士 1 级」「战士 3 级」「游荡者 1 级」，不存在裸的「5 级」；无归属职业的检查点（起源、专长等）仍显示角色等级。
- **同职业多检查点各按自己的解锁等级**：战士的 1 级技能与 3 级子职分别标注 1 级与 3 级。
- **职业特性并列而非只显示第一个职业**：`战士3/野蛮人5` 同时列出两个职业的自动获得特性（野蛮人有「额外攻击」，3 级战士没有），标题为「职业特性 · 战士 / 野蛮人」。
- **法术任务 id 加职业前缀**：`<classId>:cantrips`／`:spellbook`／`:spellbook-extra`／`:spells`，兼职时两个施法职业的同名任务不再互相覆盖；组件按后缀分派，因此前缀不参与任何判断。
- **装备步骤只提示不改变数据**：起始装备本来就只取 `draft.classId`（起始职业）的档位，本任务只补上「兼职不会获得其他职业的起始装备」的说明，不改选择逻辑。

**过程中的两处判断修正**：
- `inferredUniqueGroup` 最初对所有检查点统一加职业前缀，导致游荡者 1 级与 6 级的**专精**跨等级去重失效（两者变成不同组，可选重复项）。修正为只对 `subclass-feature-*` 加前缀。
- 测试最初断言「游荡者 2 级」，属**断言错误**：游荡者的技能与专精检查点在**职业 1 级**解锁，2 级本身没有检查点；组件输出正确，改断言为「游荡者 1 级 × 2 且不出现 3 级」。

### 4.9 批次验证（2026-10-11）

| 检查 | 结果 |
| --- | --- |
| `npx vue-tsc -b` | 通过 |
| `npx vitest run`（全量） | **224 文件 / 2274 项通过**（E03 后为 223／2267；本阶段新增 1 文件 / 7 项） |
| `npm run build` | 通过（`vite-ssg` + PWA） |
| 拓扑复核 | 无新目录、无依赖方向变化 → **无需更新** `docs/frontend-architecture.md` |

### 4.10 剩余问题

- 跑团助手多职业展示与按骰面消耗归 MC-E05。
- 导出（PDF／XLSX）的多职业字段与戏法成长承载归 MC-F01。

## 5. MC-E05 实施计划（跑团助手与草稿列表摘要）

- 对应 TODO：MC-E05
- 规则依据：需求 §3.1（职业展示统一格式）、§3.3、R4.2／R4.3、R5.3、§7.2（`SessionPanel.vue` 与 `StartPanel.vue` 行）
- 目标：跑团助手与草稿列表都能正确表达多职业；生命骰按**具体骰面**消耗；同名资源合并为一个计数池。

### 5.1 步骤

1. **职业标签只留一处实现**
   - `rules/multiclass-session.ts` 新增 `getClassLevelLabel(draft)`：无职业 → `''`；单职业 → `战士5`；多职业 → `战士3 / 游荡者2（5 级角色）`（与需求 §3.1 的统一格式一致）。
   - `derive.ts` 的 `deriveCharacterSummary` 新增可选字段 `classLabel`；`classLevelLabel` 字段类型加进 `DerivedCharacterSummary`。
   - `CharacterSheetStep.vue` 的本地 `classLevelLabel` 改为调用共享函数（消除重复实现）。
2. **跑团助手头部**（`SessionPanel.vue` 标题行）
   - `useSessionPanel` 暴露 `classLabel`；头部小字改为 `classLabel || '${targetLevel}级'`，未选职业时保持原样。
3. **生命骰按骰面**（`useSessionPanel.ts` + `SessionPanel.vue`）
   - 关键缺陷：现在把 `draft.targetLevel`（数字）传给 `ensureHitDicePool`，池永远是单组、骰面取起始职业 → 必须改传 `getHitDiceFaces(draft)`（骰面数组）。
   - `hitDiceGroups`：逐骰面 `{ die, total, spent, remaining, average }`；`hitDice` 保留为汇总（总剩余／总上限），既有「剩余为 0 时禁用」判断不变。
   - `spendHitDice(count, mode, die)` 把骰面透传给 `spendHitDice`，只扣该骰面组。
   - 模板：每个骰面一行，各自「掷骰消耗 1 颗」「直接回 1 颗（均值）」。
4. **资源合并**（`rules/session-resources.ts`）
   - 现状两个缺陷：① 所有特性资源都用 `draft.targetLevel` 取上限，兼职时该用**所属职业等级**；② 同名资源（引导神力）会各自成为独立计数池，违反 R5.3。
   - 改为按特性名合并为一个池：`max` 取各来源在**各自职业等级**下的最大值，id 取首个来源的 id（单职业结果零变化），并用 `sharedSources` 记录合并来源。
   - 未被任何代码调用、且等级口径写错（取等级表末位＝20 级上限）的 `resolveSharedResources` 一并移除，避免留下第二套合并实现。
5. **草稿列表摘要**（`StartPanel.vue`）
   - `statusText` 的职业段改为共享标签；完成态由 `战士` 变为 `战士5` / `战士3 / 游荡者2（5 级角色）`，行内已有的 `N级` 保持不动。
6. **车卡吸底摘要**（`features/quick-build/components/CharacterDrawer.vue`）
   - `characterLabel` 改用 `summary.classLabel`。

### 5.2 验证

- 新增 `app/test/rules/multiclass-session-resources.test.ts`：骰面分组、同名资源合并、按职业等级取上限、单职业零变化。
- 新增 `app/test/components/multiclass-session-panel.test.ts`：跑团头部多职业、逐骰面消耗、资源合并展示。
- 扩展 `StartPanel` / `CharacterDrawer` 既有测试或新增用例覆盖列表摘要。
- 全量回归 + `vue-tsc -b` + `npm run build`。

## 6. MC-E05 执行记录（2026-10-11）

| 文件 | 变更 |
| --- | --- |
| `rules/multiclass-session.ts` | 新增 `getClassLevelLabel(draft)`：无职业／职业全部无法解析 → `''`；单职业 `战士5`；多职业 `战士3 / 游荡者2（5 级角色）` |
| `types/character.ts` | `DerivedCharacterSummary` 新增可选 `classLabel`（与 `className` 并存，`className` 仍是「起始职业」语义） |
| `rules/derive.ts` | `deriveCharacterSummary` 填充 `classLabel` |
| `views/character-builder/components/CharacterSheetStep.vue` | 本地 `classLevelLabel` 改为调用共享函数（消除第二份实现） |
| `views/session-assistant/hooks/useSessionPanel.ts` | 新增 `classLabel`；生命骰初值由 `targetLevel`（数字）改为 `getHitDiceFaces(draft)`（骰面数组）；新增 `hitDiceGroups`，`hitDice` 退化为汇总；`spendHitDice(count, mode, die?)` 支持指定骰面 |
| `views/session-assistant/components/SessionPanel.vue` | 头部改用 `panel.classLabel`；生命骰按骰面逐行渲染与消耗；资源条目在合并时显示来源说明 |
| `rules/session-resources.ts` | 资源上限改按**所属职业等级**；按名称合并同名资源为一个计数池；`SessionResource` 新增 `sharedSources` |
| `rules/multiclass-features.ts` | 移除未被调用且等级口径错误的 `resolveSharedResources` |
| `views/character-builder/components/StartPanel.vue` | `statusText` 的职业段改用共享标签 |
| `features/quick-build/components/CharacterDrawer.vue` | `characterLabel` 改用 `summary.classLabel` |
| 测试 | 新增 `multiclass-session-resources.test.ts`（12）、`multiclass-session-panel.test.ts`（6）、`CharacterDrawer.test.ts`（3）；扩展 `StartPanel.test.ts`（+2）；更新 `session-panel-2024.test.ts` 的两处头部断言 |

**关键行为与修掉的缺陷**：
- **生命骰池此前根本没分组**：`ensureHitDicePool(loaded, draft.targetLevel)` 传的是数字，`normalizeHitDicePool` 因此走单组分支，兼职角色的骰池永远只有一个骰面（起始职业）。改传 `getHitDiceFaces(draft)` 后，`圣武士10/牧师5` 得到 `d10:10 + d8:5`，短休按骰面扣减，某一骰面耗尽只禁用该组按钮。
- **资源上限误用角色总等级**：原实现把 `draft.targetLevel` 传给 `getResourceMax`，兼职时会把高等级职业的进度错算到低等级职业上。改为按归属职业等级取值（`牧师5/圣武士10` 的引导神力正确为 2 次；误用总等级 15 会算成 3 次）。子职特性经其子职反查归属职业；种族特性仍按角色总等级。
- **同名资源此前不合并**：`引导神力` 在牧师与圣武士上各登记一条，跑团面板会显示成两个互相独立的计数池，违反 R5.3。现按特性名合并为一个池，上限取各来源在各自等级下的最大值，id 取首个来源（**单职业结果与既有存档完全一致**），并在界面注明「由牧师、圣武士共用同一计数池，上限取较高者」。
- **连带清理**：MC-C02 留下的 `resolveSharedResources` 从未被调用，且用「等级表末位」当上限（等于按 20 级取值）。它已由上述合并逻辑取代并被移除，避免留下第二套口径不同的实现。
- **职业标签统一**：需求 §3.1 要求「战士3 / 游荡者2（5 级角色）」覆盖草稿列表、吸底摘要、角色卡头部、跑团助手标题与导出。现由 `getClassLevelLabel` 单点定义，四处展示共用；无法解析的职业**跳过而不打印原始 id**（修掉了新实现一度把 `class-2014-unknown` 直接显示到列表的问题）。
- **单职业显示变化**：跑团助手头部由「5级 战士」变为「战士5」、草稿列表由「战士」变为「战士5」，与角色卡头部既有格式一致；单职业数值与导出字段未变。

### 6.1 批次验证（2026-10-11）

| 检查 | 结果 |
| --- | --- |
| `npx vue-tsc -b` | 通过 |
| `npx vitest run`（全量） | **227 文件 / 2297 项通过**（E04 后为 224／2274；本阶段新增 3 文件 / 21 项，扩展 2 项） |
| `npm run build` | 通过（`vite-ssg` + PWA） |
| 拓扑复核 | 无新目录、无依赖方向变化（`session-resources.ts` 新增对 `rules/multiclass` 的依赖属同层引用）→ **无需更新** `docs/frontend-architecture.md` |

### 6.2 剩余问题

- 导出（PDF／XLSX／JSON）的多职业字段与戏法成长承载归 MC-F01。
- 引导神力「使用方式取并集」目前由各来源特性自身在能力页展示，未合并为单一条目；不影响次数池结算，留待有明确需求时处理。

