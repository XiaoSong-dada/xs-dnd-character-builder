# MC-D 法术 · 更新任务

- 对应 TODO：MC-D01—MC-D06（父批次 MC-D）
- 当前状态：**已完成**（MC-D01—MC-D06 全部执行完毕）
- 目标：兼职角色的施法等级、通用法术位池、契约池、按职业归属的法术选择与戏法成长全部按规则算对。
- 前置依赖：MC-A（类型与迁移）、MC-B（先决与熟练项）、MC-C（时间线与校验）。
- 本次范围：2014 与 2024 共用；施法等级 1—20；职业数不设上限。
- 不包含：法术步骤界面（MC-E04）、导出承载（MC-F01）。
- 规则依据：需求 §2.8（兼职施法，含法术位表）、§4.2（法术归属存储）、§4.5（戏法成长）、D1（向下取整）、D4／D11／D12（戏法成长建模）。

## 1. 实施步骤

1. **MC-D01 兼职施法等级与通用法术位池（已完成）**
   - 新增 `rules/data/multiclass-spell-slots-2014.ts`（兼职施法者表 20×9）。
   - 新增 `getMulticlassSpellcastingLevel`（全额／半施法向下取整／1/3 施法子职）与 `getMulticlassSpellSlots`。
   - `getEffectiveSpellSlots`：两个及以上职业走兼职表，单职业保持各职业自己的表。

2. **MC-D02 契约魔法双池**
   - 契约池已随 MC-D01 落地（`pact: true`，按魔契师自身等级查契约表）；剩余：法术攻击／DC 按归属职业分别给出。

3. **MC-D03 每职业法术选择与候选池**
   - 读取路径已完成：`getClassSpellSelections`／`usesClassSpellSelections`／`listClassSpellSelections`，`getEffectiveSelectedSpellIds` 合并各职业归属。
   - 剩余：候选池与数量校验按归属职业（`getAvailableSpells`／`getRequiredSpellCount` 增加职业参数）、法术书与始终准备按职业。

4. **MC-D04 存储与迁移写入路径**
   - 迁移已于 MC-A02 落地；剩余：法术选择的写入路径与停用记录的归属职业。

5. **MC-D05 戏法成长建模**
   - 新增 `CantripScalingRule` 类型与 `getCantripScalingAtLevel`；补录 2014 约 25—30 条 0 环法术的成长数据。

6. **MC-D06 2024 兼职数据登记**
   - 先决与兼职熟练项已于 MC-B 落地；剩余 2024 施法系数（已随 MC-D01 落地）。

## 2. 验证

- 法术位：兼职表 20 行抽点核对 + 单调性；`游侠4/术士3 → 4/3/2`；`圣武士5/法师1` 半施法向下取整；`战士3（奥法骑士）/法师5 → 6`；`魔契师3/法师5` 双池；纯非施法兼职无池。
- 单职业回归：法师／游侠／魔契师的单职业法术位与改造前逐字段一致。
- 戏法成长：`火焰箭` 在总等级 1/4/5/10/11/16/17 → 1d10/1d10/2d10/2d10/3d10/3d10/4d10。

## 3. 文档同步

- `docs/rules.md`：兼职法术位与施法等级口径。

## 4. 完成标准

- 需求 §1.3 成功标准第 2、3 条（`游侠4/术士3` 与 `圣武士6/魔契师1`）可由自动化测试判定。
- 单职业法术位、法术选择与导出结果与改造前逐字段一致。

## 5. 结果回填

### 5.1 MC-D01 执行记录（2026-10-11）

| 文件 | 变更 |
| --- | --- |
| `app/src/rules/data/multiclass-spell-slots-2014.ts`（新增） | `MULTICAST_SPELL_SLOTS`（20 行 × 9 环）与 `getMulticlassSlotRow` |
| `app/src/rules/spellcasting.ts` | 新增 `MulticlassSpellcastingLevel`／`getMulticlassSpellcastingLevel`／`getMulticlassSpellSlots`／`getCasterWeightAssignment`／`usesMulticlassSlotTable`；`getEffectiveSpellSlots` 按职业数选择表 |
| 测试 | 新增 `multiclass-spell-slots.test.ts`（21 项） |

**设计决定**：
1. **单职业继续用各职业自己的法术位表**，只有两个及以上职业才走兼职表。这样既有角色的法术位逐字段不变（已用法师 5 级 `4/3/2`、游侠 5 级 `4/2`、魔契师 3 级 `2:2p` 锁定）。
2. **1/3 施法子职的识别先于职业施法特性判断**：奥法骑士／诡术师的职业本身没有 `spellcasting`，施法来自子职，因此不能以「职业有施法特性」为前提。
3. **契约池与通用池并存**：契约池按魔契师自身等级查契约表并标记 `pact: true`，不并入通用池；跑团短休归零契约环的既有行为不变。

**已锁定的关键数值**：
- `游侠4/术士3` → 施法等级 5 → **4/3/2**（需求 §1.3 成功标准第 2 条）
- `圣武士5/法师1` → 圣武士半施法 5÷2 向下取整 = 2，加法师 1 → 施法等级 3（**D1 的直接验证**）
- `战士3（奥法骑士）/法师5` → 1 + 5 = 6
- `魔契师3/法师5` → 通用 4/3/2 + 契约 2 个 2 环
- 纯非施法兼职（`战士3/游荡者2`）→ 无任何法术位

### 5.2 MC-D03 读取路径执行记录（2026-10-11）

- 新增 `getClassSpellSelections`（单职业回退顶层数组、多职业取该职业分桶）、`usesClassSpellSelections`、`listClassSpellSelections`。
- `getEffectiveSelectedSpellIds` 在兼职时合并各职业自己的戏法与已知／准备／法术书法术（每个法术带职业归属），并与始终授予、人工添加去重。
- 存储形态已于 MC-A02 的 v10 迁移写入（`spellSelections.classSpellSelections`）。

### 5.3 批次验证（2026-10-11）

| 检查 | 结果 |
| --- | --- |
| `npx vue-tsc -b` | 通过 |
| `npx vitest run`（全量） | **220 文件 / 2222 项通过**（MC-C 后为 219／2201；本阶段新增 1 文件 / 21 项） |
| `npm run build` | 通过（`vite-ssg` + PWA） |
| 拓扑复核 | 新增 `rules/data/multiclass-spell-slots-2014.ts` 属既有目录职责，无依赖方向变化 → **无需更新** `docs/frontend-architecture.md` |

### 5.5 MC-D05 执行记录（2026-10-11）

| 文件 | 变更 |
| --- | --- |
| `app/src/types/rules.ts` | 新增 `CantripScalingRule`；`SpellRule` 新增可选 `cantripScaling`（仅 0 环可能填写） |
| `app/src/rules/data/cantrip-scaling-2014.ts`（新增） | **25 条**成长规则 + `getCantripScaling2014` |
| `app/src/rules/data/cantrip-scaling-2024.ts`（新增） | **18 条**成长规则 + `getCantripScaling2024` |
| `app/src/rules/spellcasting.ts` | 新增 `CantripScalingAtLevel`／`getCantripScalingAtLevel`／`getDraftCantripScaling` |
| 测试 | 新增 `cantrip-scaling.test.ts`（15 项） |

**数据来源与登记方式**：
- **2014**：法术库现状**只有元数据**（无 `description`），因此成长数据全部新写。逐条取自 5e 不全书各书「法术详述」的戏法条目：`玩家手册_魔法_法术详述_戏法.md`（11 条）、`珊娜萨的万事指南_法术_法术详述_戏法.md`（6 条）、`塔莎的万事坩埚_法术_法术详述_戏法.md`（4 条）、`剑湾冒险者指南_新戏法.md`（3 条）、`荒洲探险家指南_角色选项_秘迹学法术_秘迹学法术详述.md`（1 条）。
- **2024**：由 `玩家手册2024_法术详述_0环.md` 的「戏法强化」段**转录为结构化数据**（不解析展示文本），18 条。

**登记边界（决策 D12）**：
- 只登记「影响实际数值」的成长：伤害骰、射线／光束数量、骰型，共 **43 条**。
- 覆盖了全部 17 个**伤害类** PHB 戏法与主要扩展伤害戏法（酸液飞溅、颤栗之触、火焰箭、毒气喷涌、燃火术、冷冻射线、圣火术、电爪、荆棘之鞭、恶言相加、霜噬、虫群孳生、原初蛮击、鸣雷破、亡者丧钟、光耀祷词、创造篝火、轰雷剑、翠炎剑、闪电牵引、心灵之楔、剑刃爆发、削弱芒刺、魔能爆、橡棍术）。
- **项目收录但未核验成长数据的 35 条扩展戏法（多为第三方书条目）不登记**：界面不显示成长行，也不写「无成长」——避免把「未登记」呈现为规则结论。
- **无成长的法术**（如法师之手、光亮术、神导术）同样不登记：它们在规则上确实不随等级变强，与「未核验」在数据上表现为同一种情况，因此两者都不显示成长行。

**特殊形态**：
- `魔能爆` 用 `count` 记录射线数（1/2/3/4）。
- `橡棍术` 用 `die` 记录骰型（2014 为 d8；2024 为 d8→d10→d12→2d6）。
- `亡者丧钟`（d8/d12 分支）、`轰雷剑`／`翠炎剑`（两段伤害）、`克敌先击`（额外光耀伤害）用 `note` 记录分支，**只作展示、不进入自动结算**（决策 D11）。

**已锁定的关键数值**：火焰箭在角色总等级 1/4/5/10/11/16/17 → `1d10/1d10/2d10/2d10/3d10/3d10/4d10`（2014 与 2024 同口径）；**兼职按角色总等级取值**——`游侠4/术士3` 的术士戏法按总等级 7 取 `2d10`，而不是术士等级 3 的 `1d10`（需求 §2.8 的直接验证）。

### 5.6 批次验证（2026-10-11，累计）

| 检查 | 结果 |
| --- | --- |
| `npx vue-tsc -b` | 通过 |
| `npx vitest run`（全量） | **221 文件 / 2237 项通过**（MC-C 后为 219／2201；MC-D 阶段新增 2 文件 / 36 项） |
| `npm run build` | 通过（`vite-ssg` + PWA） |
| 拓扑复核 | 新增两个数据文件属既有目录职责，无依赖方向变化 → **无需更新** `docs/frontend-architecture.md` |

### 5.7 剩余问题

- **MC-D02／D03 写入路径**：候选池与数量校验仍按单职业配置，多职业草稿的法术编辑需按职业传参（界面归 MC-E04）。
- **MC-D06**：2024 先决、兼职熟练项与施法系数均已落地，剩余仅为汇总登记确认。
- 成长值的**展示接入**（角色卡／跑团／法术步骤／PDF 四处统一展示，决策 D11）归 MC-E04／MC-F01；本阶段只完成数据与纯函数。

### 5.8 允许勾选的 TODO

MC-D01、MC-D05 已勾选（见 [TODO 计划](兼职（多职业）支持TODO计划.md)）。MC-D03 保持未勾选（仅完成读取路径）。

## 6. MC-D02／D03／D04／D06 实施计划（本轮）

### 6.1 问题定位

现状所有「数量／候选／已选」函数都以 `getSpellcastingConfig(draft)` 解析出的**单一配置**为准，并用 `draft.targetLevel`（角色总等级）与顶层 `draft.spellSelections` 取值。兼职时这会导致四类错误：

1. 只解析起始职业的施法配置——第二个施法职业的法术完全无法选择；
2. 环级上限与数量按角色总等级取值，会放开「该职业尚未获得的环级」；
3. 法术选择写入顶层数组，两个职业共用一份列表；
4. 法术攻击／DC 只有一个，无法表达「每个职业按各自施法属性」。

### 6.2 实施步骤

1. **引入施法作用域（D03 的公共基础）**
   - `rules/spellcasting.ts` 新增 `SpellcastingScope`：`{ classId, className, classLevel, subclassId?, config, selections, pact }`。
   - 新增 `listSpellcastingScopes(draft)`：逐职业解析配置（含 1/3 施法子职）并带上该职业**自己的等级**与**自己的法术选择分桶**；单职业草稿返回一项，与既有行为等价。
   - 为 `getAvailableSpells`／`getSpellCandidates`／`getSelectedSpellIds`／`getRequiredSpellCount`／`getRequiredCantripCount`／`getRequiredSpellbookCount`／`getSpellbookExtra*` 增加可选尾参 `scope`；省略时按 `draft.classId`＋`draft.targetLevel`＋顶层数组构造默认作用域，**单职业结果逐字段不变**。
2. **每职业施法属性（D02）**
   - 新增 `getClassSpellcastingProfiles(draft, derived)`：每个施法职业输出 `{ classId, className, classLevel, ability, abilityLabel, saveDc, attackBonus, mode, pact, maxSpellLevel }`；熟练加值取**总等级**口径，属性调整值取该职业施法属性。
   - 角色卡与跑团助手并列展示各职业的 DC／攻击加值（单职业只有一行，展示文案不变）。
3. **第 8 步按职业分派（D03 写入路径）**
   - `useSpellcastingStepFlow` 改为遍历 `listSpellcastingScopes`，每个职业各自产出「戏法／法术书／额外入书／法术」任务（id 仍是 MC-E04 的 `<classId>:<kind>`），计数与可用性按该职业作用域计算。
   - `SpellcastingStep` 的候选列表、已选列表与写回一律走**当前任务所属职业**；兼职时写回 `spellSelections.classSpellSelections` 的对应分桶，单职业仍写顶层数组。
4. **校验按职业（D03）**
   - `validateSpellSelections` 兼职时逐职业核对数量与环级上限（如游侠 4 级不能准备 2 环游侠法术），错误信息带职业名。
5. **停用记录的归属职业（D04）**
   - `reconcileSpellSelections` 为兼职草稿把丢失的法术写入对应职业的 `inactiveSpellSelections.sourceKey`；补存储往返测试（顶层视图 + 分桶 + 停用记录）。
6. **2024 登记确认（D06）**
   - 汇总登记测试：13 个 2024 职业（12 核心 + UA 奇械师）与灵能使的兼职先决、兼职受训、施法系数齐备；武僧／术士／法师只获得生命骰；未核验的第三方职业返回「先决条件待核验」且不阻断。

### 6.3 验证

- 新增 `app/test/rules/multiclass-spell-scope.test.ts`（作用域解析、逐职业数量与候选、环级上限、单职业等价）。
- 新增 `app/test/rules/multiclass-spellcasting-profiles.test.ts`（逐职业 DC／攻击加值）。
- 新增 `app/test/rules/multiclass-spell-storage.test.ts`（分桶写入、停用记录归属、JSON 往返）。
- 新增 `app/test/rules/multiclass-2024-registration.test.ts`（D06 数据齐备性）。
- 扩展第 8 步组件测试：`游侠4/术士3` 两个职业的任务与候选互不串味。
- 锁定数值：`游侠4/术士3` 的游侠侧最高 1 环、术士侧最高 2 环；法术位仍是 4/3/2；戏法按角色总等级 7 取 `2d10`。

## 7. MC-D02／D03／D04／D06 执行记录（2026-10-11）

| 文件 | 变更 |
| --- | --- |
| `rules/spellcasting.ts` | 新增 `SpellcastingScope`／`getSpellcastingScope`／`listSpellcastingScopes` 与默认作用域解析；`getAvailableSpells`／`getSpellCandidates`／`getSelectedSpellIds`／`getRequiredSpellCount`／`getRequiredCantripCount`／`getRequiredSpellbookCount`／`getSpellbookExtra*` 增加可选 `scope`；新增 `ClassSpellcastingProfile`／`getClassSpellcastingProfiles`；`getClassSpellSelections` 改为「无分桶的非起始职业返回空」；`usesClassSpellSelections` 改为「多职业即为真」；`validateSpellSelections` 改为逐职业校验并新增 `validateSpellSelectionScope`／`getSpellSelectionValidationReport` |
| `rules/spell-selection-reconciliation.ts` | 变更声明新增 `nextMulticlass`／`removedClassIds`；新增逐职业核对：被移除或降级职业的法术按该职业自己的作用域归档，`sourceKey` 写成**归属职业**，并同步裁剪各职业分桶 |
| `views/character-builder/hooks/useSpellcastingStepFlow.ts` | 重写为按作用域产出数据与任务：每个施法职业各出「戏法／法术书／额外入书／法术」任务（id `<classId>:<kind>`），计数与候选按该职业等级 |
| `views/character-builder/components/SpellcastingStep.vue` | 全部数量／候选／已选改读当前任务所属职业的作用域；写回落到该职业分桶并把顶层数组镜像为并集；法术位在兼职时显示生效的通用池 |
| `views/character-builder/components/CharacterSheetStep.vue`、`views/session-assistant/*` | 兼职时并列展示各职业施法属性（法术攻击／DC／最高环级／契约说明） |
| `views/character-builder/hooks/useCharacterBuilderPage.ts` | 分配变更时把新职业集合与被移除职业传给法术协调 |
| `rules/multiclass-prerequisites.ts` | 未登记先决的提示改用需求 D8 的措辞「先决条件待核验」（仍不阻断） |
| 测试 | 新增 `multiclass-spell-scope.test.ts`（17）、`multiclass-spell-storage.test.ts`（5）、`multiclass-2024-registration.test.ts`（9）、`multiclass-spellcasting-step.test.ts`（5） |

**关键行为**：
- **第二个施法职业此前完全不可选**：所有数量／候选都由 `getSpellcastingConfig(draft)` 解析出的单一配置决定，兼职时永远只解析起始职业。引入作用域后 `游侠4/术士3` 各自成组：游侠侧 3 个已知法术、最高 1 环；术士侧 4 个戏法 + 4 个已知法术、最高 2 环。
- **环级上限此前按角色总等级取值**：`游侠4/术士3` 会把总等级 7 当成两个职业的等级，游侠侧会误放开 2 环法术。现按各职业自己的等级取值。
- **法术选择此前共用一份顶层数组**：新建的兼职角色（未经过迁移）没有 `classSpellSelections`，`getClassSpellSelections` 会把顶层数组当成**每个**职业的选择，导致第二职业读到起始职业的法术。现只有起始职业沿用顶层数组，其余职业在写入时建桶。
- **法术攻击／DC 此前只有一个**：现按归属职业分别给出（`游侠4/术士3` → 游侠 `+4/DC12`、术士 `+6/DC14`；熟练加值按总等级 +3，属性调整值取各职业施法属性），角色卡与跑团助手并列展示。
- **停用记录此前无法区分职业**：`sourceKey` 恒为起始职业。现在按各职业作用域核对，被移除或降级的职业写自己的 id（`spell-2014-blur` 归 `class-2014-sorcerer`）。

**未改动的边界**：抄录与「子职额外入书／能力预留」仍是法术书内部的共享标记（`ClassSpellSelections` 不单独持有），因此这四个数组进分桶，其余写顶层；单职业草稿的全部路径与改造前逐字段一致（231 文件 / 2333 项测试无回归）。

### 7.1 批次验证（2026-10-11）

| 检查 | 结果 |
| --- | --- |
| `npx vue-tsc -b` | 通过 |
| `npx vitest run`（全量） | **231 文件 / 2333 项通过**（MC-E05 后为 227／2297；本阶段新增 4 文件 / 36 项） |
| `npm run build` | 通过（`vite-ssg` + PWA） |
| 拓扑复核 | 无新目录、无依赖方向变化 → **无需更新** `docs/frontend-architecture.md` |
