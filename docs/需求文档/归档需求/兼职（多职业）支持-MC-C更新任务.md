# MC-C 时间线、特性互斥与升级降级 · 更新任务

- 对应 TODO：MC-C01、MC-C02、MC-C03、MC-C04（父批次 MC-C）
- 当前状态：**已完成**（MC-C01—MC-C04 全部执行完毕）
- 目标：兼职草稿的时间线按各职业分别展开、检查点带职业归属；特性互斥与资源合并正确；升降级与移除职业的失效清单准确；兼职校验给出可执行的中文原因。
- 前置依赖：MC-A（类型与解析）、MC-B（先决与熟练项）。
- 本次范围：2014 与 2024 共用；等级 1—20；职业数不设上限（D9）。
- 不包含：法术与法术位（MC-D）、界面渲染（MC-E）、导出（MC-F）。
- 规则依据：需求 §2.7（特性专属规则）、§2.9（子职按各职业等级）、§6.3（现存缺口 1—3）、R5、R7。

## 1. 实施步骤

1. **MC-C01 多职业时间线**
   - `TimelineContext` 新增 `classes` 与 `classSubclassIds`；`buildTimeline` 按职业集合逐个展开，各职业只到**自己的等级**，产物注入 `classId`／`classLevel`。
   - 新增统一入口 `buildTimelineForDraft(draft, context?)`，自动带上职业集合、各子职、来源、种族／背景、手动专长；支持 `targetLevelOverride` 按比例缩放到另一总等级。
   - 全部内部调用点（store 完成度、validate、dependency、useCharacterBuilderPage、feat-eligibility、导出模型）改用统一入口。

2. **MC-C02 特性互斥、去重与资源合并**
   - 汇总所有职业（及其子职）在各自等级内的特性；额外攻击族取最大值（战士的「额外攻击（二）／（三）」提升上限）。
   - AC 计算方式（无甲防御、龙族体魄、炫目舞步等）并存时只取一种，未选择给中文提示。
   - 引导神力共享使用次数池，使用方式取并集。

3. **MC-C03 依赖影响与升降级**
   - `DraftChange` 新增 `{ kind: 'class-allocation'; classes; levelOrder; enabled }`；实现为旧／新分配两条时间线求差。
   - 关闭兼职开关触发的合并不改变总等级但改变职业集合，走同一变更类型。
   - 法术按归属职业归档进 `inactiveSpellSelections`。

4. **MC-C04 兼职校验**
   - `validateDraft` 接入先决报告（error）与兼职分配合法性。
   - 子职归属按**职业配对**校验（现状是单值比较）。
   - `uniqueGroup` 去重改为「同职业内唯一」，避免跨职业锁死专精。

## 2. 验证

- 时间线：各职业只展开到自己的等级；检查点 id 唯一；子职按各职业等级出现；`targetLevelOverride` 缩放正确。
- 特性：`战士5/野蛮人5` 攻击 2 次、`战士11/野蛮人5` 攻击 3 次；武僧/术士 AC 公式择一；牧师6/圣武士4 引导神力 2 次。
- 依赖：新增职业列入「待补全」；降级／移除职业列入「将失效」并保留记录；`target-level` 兼容分支不变。
- 校验：先决不足报 error；子职不属于其职业按职业配对报错；跨职业专精不再互相锁死。
- 回归：单职业时间线、依赖影响与校验结果不变。

## 3. 文档同步

- `docs/rules.md`：兼职时间线、特性互斥与校验口径。
- `docs/frontend-architecture.md`：无新目录时无需更新。

## 4. 完成标准

- 兼职草稿的时间线可完整走通并通过校验。
- 单职业时间线与校验结果与改造前逐字段一致。

## 5. 结果回填

### 5.1 MC-C01 执行记录（2026-10-11）

| 文件 | 变更 |
| --- | --- |
| `app/src/rules/timeline.ts` | `TimelineContext` 新增 `classes`／`classSubclassIds`；新增 `buildClassCheckpoints`（按职业展开并注入 `classId`／`classLevel`）；`buildTimeline` 支持职业集合；新增 `buildTimelineForDraft` 与 `scaleClassEntries` |
| `app/src/rules/multiclass.ts` | 新增 `getClassSubclassIds` |
| `app/src/rules/dependency.ts` | `countCheckpointKind`／`countManeuverCheckpoints`／降级复查／`target-level` 分支改用 `buildTimelineForDraft` |
| `app/src/stores/character-drafts.ts`、`app/src/rules/validate.ts`、`app/src/views/character-builder/hooks/useCharacterBuilderPage.ts` | 改用 `buildTimelineForDraft` |
| 测试 | 新增 `multiclass-timeline.test.ts`（10 项） |

**设计决定**：
1. **子职特性检查点 id 保持 `subclass-feature-<featureId>` 不变**。需求 §6.3 缺口 2 曾设想改为职业限定 id，但实测该前缀被 4 处字面匹配（`validate.ts`、`derive.ts`、`spellcasting.ts`、`TimelineStep.vue`）以及 10+ 个测试夹具引用；改用 `classId` 字段表达归属即可满足分组与过滤需求，兼容成本远低于改 id。原缺口按「以字段而非 id 表达归属」关闭。
2. **`level` 仍为角色等级口径的解锁等级**（单职业下与职业等级相等），职业等级另记在 `classLevel`；这样既有按 `level` 排序与比较的逻辑无需改动。
3. **`targetLevelOverride` 按比例缩放职业等级**，仅用于时间线预览与统计（升降级影响清单、按等级计数），不写回草稿。

**验证**：`vue-tsc -b` 通过；`vitest run` **217 文件 / 2179 项全通过**（本批新增 1 文件 / 10 项）；`npm run build` 通过。已复核前端依赖拓扑：无新模块、无依赖方向变化 → **无需更新** `docs/frontend-architecture.md`。

### 5.2 MC-C02 执行记录（2026-10-11）

| 文件 | 变更 |
| --- | --- |
| `app/src/rules/multiclass-features.ts`（新增） | `listCharacterFeatures`（按**各职业自己的等级**汇总职业与子职特性，含来源开关过滤）、`resolveExtraAttack`（额外攻击取最大值）、`resolveArmorClassFormula`（收集 AC 计算方式）、`resolveSharedResources`（同名资源合并计数池） |
| `app/src/rules/session-resources.ts` | `grantedFeatures` 改用 `listCharacterFeatures` |

**规则落地**：
- **额外攻击不叠加**：从特性摘要解析次数（`攻击动作可进行两次攻击。`→2），取所有来源的最大值。`战士5/野蛮人5`→2、`战士11/野蛮人5`→3、`战士20/圣武士5`→4。魔契师「饥渴魔刃」按规则也不叠加，因此不参与计算。
- **AC 公式择一**：收集所有声明 `unarmoredDefense` 的职业／子职公式（2024 武僧、野蛮人、舞蹈学院、龙族体魄等），供派生层按「取最高」自动择一；2014 的职业级无甲防御仍走既有派生分支。
- **同名资源合并**：按 `englishName` 归组，次数上限取各来源最大值（如引导神力由等级最高的那条特性决定）。

### 5.3 MC-C03 执行记录（2026-10-11）

- `DraftChange` 新增 `{ kind: 'class-allocation'; classes; levelOrder?; enabled?; primaryClassId? }`。
- 实现为「旧分配 vs 新分配」两条 `buildTimelineForDraft` 时间线求差，与 `target-level` 分支共用 `added`／`invalidatedDetails`／`reviews`／`spellUpdates` 语义；关闭开关触发的合并（总等级不变、职业集合变化）走同一类型。
- 清空职业集合时按「换职业」语义作废全部选择。

### 5.4 MC-C04 执行记录（2026-10-11）

- 新增 `validateMulticlassAllocation`：总等级与职业合计一致性、单职业等级 1—19、总等级 1—20、起始职业在列表中、先决 `error`／`pending`（未登记先决只给提示级问题，D8）。
- `validateSubclassSelections` 改为按**职业配对**校验：子职必须属于该职业（错误消息指出归属职业与持有职业），解锁等级按**该职业等级**判断（兼职下不再误用总等级），子职特性的选择校验也按该职业等级过滤。
- 错误 id 带上职业（`subclass-class-mismatch-<classId>`、`subclass-level-too-early-<classId>`），兼职时可区分是哪个职业配对出错。

### 5.5 批次验证（2026-10-11）

| 检查 | 结果 |
| --- | --- |
| `npx vue-tsc -b` | 通过 |
| `npx vitest run`（全量） | **219 文件 / 2201 项通过**（MC-B 后为 216／2169；本批新增 3 文件 / 32 项） |
| `npm run build` | 通过（`vite-ssg` + PWA） |
| 拓扑复核 | 新增 `rules/multiclass-features.ts` 属既有目录职责，无新目录、无依赖方向变化 → **无需更新** `docs/frontend-architecture.md` |

### 5.6 过程中修掉的连带影响

1. **`fallbackEntry` 丢子职**：单职业兼容条目最初没有带 `subclassId`，导致改走统一入口的 `getClassSubclassId`／`listCharacterFeatures` 拿不到子职，`b10-session-acceptance` 立刻暴露（UA 子职特性全部消失）。补上后与旧 `draft.subclassId` 路径行为一致。
2. **来源开关过滤是新行为**：`listCharacterFeatures` 按既有约定过滤掉来源关闭的内容，使 `b10-session-acceptance` 的全量验收用例（原本假设所有已登记内容都生效）失败。该用例改为显式启用本规则集全部来源，并按「特性已获得的等级」而非固定 20 级核对资源上限——原写法在 20 级会漏掉上限已降为 0 的条目。

### 5.7 剩余问题

- AC 公式目前按「取最高」自动择一；规则要求由玩家显式择一，玩家可选项的 UI 与检查点归 MC-E。
- `resolveSharedResources` 已实现但尚未接入 `listSessionResources` 的计数池（合并同一资源的已用量需与跑团状态 key 一起调整，归 MC-E05）。
- `class-allocation` 变更类型已就绪，但界面入口（第 1／3 步与角色卡弹窗）归 MC-E01／E02／E03。

### 5.8 允许勾选的 TODO

MC-C01—MC-C04 已勾选（见 [TODO 计划](兼职（多职业）支持TODO计划.md)）。
