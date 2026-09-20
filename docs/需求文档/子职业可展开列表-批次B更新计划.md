# 子职业与职业选项可展开列表 · 批次 B 更新计划

- 对应需求：[子职业选择与子职选项展开需求](子职业选择与子职选项展开需求.md)（决策记录 6.1：Q1—Q11）。
- 前置批次：[批次 A 更新计划](子职业可展开列表-批次A更新计划.md)（**已完成**，提交 `54ef78b`）。
- 制定日期：2026-09-20。状态：**实施中**。
- 批次范围（需求 7.0）：**批次 B＝资料补齐**，即 W03-06（D2）、W03-07（D1）、W03-08（D4）与 Q10 术语统一。
- 数据基准：CHM v2026.09.13（章节号见需求 4.4.3，**不得沿用旧版号**）。

## 1. 目标

| 编号 | 目标 | 规模 |
| --- | --- | ---: |
| D2 | 装甲师「装甲型号」2 项 + 魔炮师「魔能炮台」3 项补进 `RuleOption` 仓库并统一译名 | 5 项 |
| D4 | 2014 子职与子职选项的资料完整度核查（状态口径见第 3 节） | 118 子职 / 588 特性 |
| D1 | 2014 子职详情（`SubclassRule` 层真实摘要，替换模板文案） | 113 项 |
| 术语 | 按 CHM 统一改动范围内的译名（Q10） | 已知 1 处 |

## 2. D2（已完成）

- 数据源：CHM `1273`（装甲师：装甲型号／守护者／渗透者）、`1274`（魔炮师：魔能炮台三型号）。
- 落点：`app/src/rules/data/subclass-choice-options-2014.ts`（与 2014 战技、图腾等既有 72 项同构）。
- 登记 5 项：`artificer-armor-model-guardian`（守护者／Guardian）、`artificer-armor-model-infiltrator`（**渗透者**／Infiltrator）、`artificer-cannon-flamethrower`（投火机／Flamethrower）、`artificer-cannon-force-ballista`（力场弩炮／Force Ballista）、`artificer-cannon-protector`（防御者／Protector）。
- 术语：CHM 用字与项目原标签差异处按 Q10 取 CHM——第二型号「潜行者」→「**渗透者**」，`subclass-features-2014.ts` 的 `optionLabels`、装甲型号与完美装甲两条特性的 `summary`／`description` 同步更新。
- 验收：`getOption` 解析缺口由 5 项降为 **0**（`.chm_output` 探测脚本实测）。

## 3. D4 核查口径（关键结论）

**盘点结论（2026-09-20，全量 118 个子职）**：

| 指标 | 结果 |
| --- | --- |
| `index-only` 特性 | **0 条** |
| `selectable` 特性 | 552 条 |
| `implemented` 特性 | 36 条 |
| `index-only` 子职 | **0 个**（仅 2 个 `dm-only`：死亡领域、破誓者） |
| 状态分布 | `selectable` 111、`dm-only` 2、`implemented` 5 |
| 模板摘要（D1 待补） | 113 |

**判定规则**（`app/src/rules/data/subclasses-2014.ts`）：子职状态是派生值——特性为空、存在 `requiresChoice` 且候选为空、或存在 `index-only` 特性 → `index-only`；全部特性 `implemented` 且子职在 `implementedIds` 中 → `implemented`；否则 `selectable`。

**由「仅可浏览，缺少必选数据时不可选择」的定义（`docs/rules.md`「内容状态」）反推**：

- 这 111 个 `selectable` 子职**结构完整、可保存可导出**，其特性效果属「情境效果以摘要提示并由桌面裁定」，**定义上不应升级为 `implemented`**（`implemented` ＝ 数据足以参与计算与合法性校验）。
- 因此 Q6-B 的「核查并升级」在本批的**正确落地**是：① 核实状态判定无遗漏（本次盘点已完成）；② 明确「哪些条目才够格升级」——需把可核验的数值效果接入 `rules/subclass-effects.ts` 或结构化字段，属**规则计算批次**，不在展示批次内。
- 本批结论：**不改动任何 `status`**，把上述结论与判定依据写入文档与交付说明；如后续要做「可计算效果接入」，另立批次（建议编号 B-05）。

> 同时修正需求文档 5.5 节的表述：不再写「批量升级 status」，改为「核查状态判定 + 登记可升级清单」。

## 4. D1（2014 子职详情 113 项）

- 落点：`app/src/rules/data/subclasses-2014.ts` 的 `subclassSummaryOverrides`（已有 3 条邪术师宗主先例）。
- 篇幅口径：每条 2—4 句原创中文转述，覆盖**主题定位 + 关键等级特性要点（1／2／3／6／10／14／17 级按子职实际）**；不复制规则正文，遵循版权约定。
- 取材：CHM v2026.09.13 章节（`search` 按子职中文名定位，主章见需求 4.4.3）。
- 单位口径：尺／里／磅（`docs/rules.md`「单位约定」）。
- 验收：模板文案计数 113 → 0；`unit-consistency` 与名称唯一性测试通过。

## 5. 任务分解

| 编号 | 任务 | 落点 | 状态 |
| --- | --- | --- | --- |
| B-01 | D2：登记 5 项候选 + 术语统一 | `subclass-choice-options-2014.ts`、`subclass-features-2014.ts` | **已完成**（提交 `956bf57`） |
| B-02 | D4：全量盘点与判定口径结论 | 本文档第 3 节、需求 5.5 | **已完成**（提交 `956bf57`） |
| B-03 | D1 分批一：奇械师／野蛮人／吟游诗人（4+9+8＝21 项） | `subclasses-2014.ts` | **已完成**（提交 `21fbd3d`） |
| B-04 | D1 分批二：牧师／德鲁伊／战士（14+7+10＝31 项） | 同上 | **已完成**（子代理执行，主代理验收） |
| B-05 | D1 分批三：武僧／圣武士／游侠／游荡者／术士／法师（56 项） | 同上 | **已完成**（子代理执行，主代理验收） |
| B-05b | D1 尾批：邪术师剩余 6 项（不朽者／天界／咒剑／深海意志／巨灵／死灵） | 同上 | **已完成**（主代理执行） |
| B-06 | 收尾：字体子集重建、全量验证、文档与公告 | — | **已完成** |

> **D1 最终覆盖：118 / 118 子职，模板残留 0。**

## 7. 完成记录

实施日期：2026-09-20。状态：**已完成（B-01—B-06）**。

### 7.1 实际改动文件

| 文件 | 改动 |
| --- | --- |
| `app/src/rules/data/subclass-choice-options-2014.ts` | 新增 5 项候选项（装甲型号 2 + 魔能炮台 3）并收录进 `SUBCLASS_CHOICE_OPTION_IDS`（83 → 88） |
| `app/src/rules/data/subclass-features-2014.ts` | 「装甲型号」与「完美装甲」的 `optionLabels`／摘要按 CHM 统一为「渗透者」 |
| `app/src/rules/data/subclasses-2014.ts` | `subclassSummaryOverrides` 由 3 条扩充到 **118 条**（113 项新登记，按职业分节注释） |
| `app/public/templates/fonts/noto-sans-sc-subset.ttf` | 重建（新增摘要引入 蹒／跚／蜻／蜓／柩 等字形，1,203,456 → 1,205,252 字节） |
| `app/test/rules/subclass-choice-options-2014.test.ts` | 计数 83／72 → 88／77，并新增装甲型号与炮台型号的解析与译名断言 |
| `CHANGELOG.md`、`app/src/constants/update-notices.ts`、`app/package.json` | v1.6.0 发版登记（版本号 1.5.1 → 1.6.0） |

> 三条自检：`git diff` 显示已有条目零删除；`vue-tsc -b` 通过；全量测试 150 文件 / 1232 项通过；生产构建通过。

### 7.2 数据质量核验（主代理执行）

| 检查项 | 结果 |
| --- | --- |
| 子职详情覆盖 | 118 / 118，模板残留 **0** |
| 摘要长度 | 中位 331 字，最短 39 字（dm-only 死亡领域，按既有格式），最长 593 字 |
| 禁用单位（米／千克／英尺／英里） | 0 |
| 缺少等级要点 | 0 |
| 来源简写 | 按各子职 `sourceIds` 取（PHB／XGtE／TCoE／SCAG／DMG／EGtW／VRGtR／Bigby／FTD／DSotDQ） |

### 7.3 与计划的偏差

| 项 | 说明 |
| --- | --- |
| 分批方式 | 第三批改为「六职业一次完成」，并把邪术师剩余 6 项拆为尾批（原计划把邪术师并入第三批） |
| 并行执行 | 第二、三批由两个子代理并行处理同一文件的不同区段；期间出现一次「old_string 未找到」，子代理按要求重读后续写，未覆盖他人条目（`git diff` 无删除行佐证） |
| 分批一返工 | 首批 8 条特性名最初凭印象拟写，经章节原文复核后修正（见提交 `21fbd3d` 说明）；后续批次已把「特性名必须取自原文」写入子代理约束 |
| 字体子集 | 计划未预见的连带改动：新增文本引入未覆盖字形，需重建 `noto-sans-sc-subset.ttf` 才能通过 `pdf-font.test.ts` |
| D4 口径 | 由「批量升级 status」改为「完成核查 + 登记可升级条件」（见第 3 节），需求文档 5.5 节同步更正 |

## 6. 验证与交付

- `npx vue-tsc -b`；`npx vitest run`；生产构建。
- 规则行为变化（术语与详情文案）同步 `docs/rules.md` 与 `CHANGELOG.md`／`update-notices.ts`／`package.json`（版本号按批次收尾统一处理）。
- 依赖拓扑复核；提交本批改动。

## 7. 完成记录

（实施后填写。）
