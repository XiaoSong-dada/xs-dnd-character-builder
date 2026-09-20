# 背景/出身补全 · G 批次更新计划

- 对应需求：[背景补全-G批次需求](背景补全-G批次需求.md)（决策记录 6.1／6.2 已全部确认，含 Q1—Q11）。
- 数据基准：CHM v2026.09.13（章节号见需求文档第 3 节与附录，**禁止沿用旧版号**）。
- 制定日期：2026-09-20。状态：**实施中**。
- 版本：收尾发 **v1.7.0**（Q7-A），三处同步（`CHANGELOG.md`／`update-notices.ts`／`package.json`）。

## 1. 目标与范围

目标：把 `5e-2014` 官方扩展缺口的 **22 个背景**、第三方缺口的 **33 个背景**（28 条 2014 写法 + 5 条 2024 写法）以及 **2 个索引条目**补齐，并同步资料文档。

| 分类 | 数量 | 落点 |
| --- | ---: | --- |
| 官方扩展背景 | 22 | `app/src/rules/data/origins-2014.ts` + `background-features-2014.ts` |
| 第三方 2014 写法背景 | 28 | 同上（来源默认关闭） |
| 第三方 2024 写法背景 | 5 | `app/src/rules/data/origins-2024.ts`（2024 仓库） |
| 第三方起源专长（Q10-A） | 待定（DoD 4 条固定授予） | 2024 专长数据 |
| 第三方起始装备（Q11-A） | 5 套 A/B | `app/src/rules/data/starting-equipment-2024.ts` |
| 2024 第三方来源（Q8-B） | 2 | `app/src/rules/data/sources-2024.ts` |
| 2014 新来源 | 1（GoS） | `app/src/rules/data/sources-2014.ts` |
| 索引条目 | 2 | EGtW 英雄编年史、GoS 盐沼 DM 工具页 |
| 资料文档 | 约 57 份 | `docs/backgrounds/<规则集>/<id>/<id>.md` + `docs/dnd-backgrounds.md` |

## 2. 实施小批与顺序

按需求文档第 5 节的 6 个小批执行；**先代码（可运行、可验证），后资料文档**（文档量大，按批补齐）。

| 小批 | 内容 | 数量 | 状态 |
| --- | --- | ---: | --- |
| G-A | GoS（含来源注册）+ AI 3 + EGtW 2（含英雄编年史索引页） | 11 | 待办 |
| G-B | DSotDQ 2 + SatO 2 + AAG 2 + VRGtR 1 + GGR 1 | 8 | 待办 |
| G-C | SCC 5 学生 | 5 | 待办 |
| G-D | 第三方 2014 写法：CM 13 + OBO 6 + TAL 4 | 23 | 待办 |
| G-E | 第三方 2014 写法：DoD 5 | 5 | 待办 |
| G-F | 第三方 2024 写法 5 条 + 2 个 2024 来源 + 起源专长 + 装备 + 盐沼 DM 工具页 | 6 | 待办 |
| G-G | 资料文档：`docs/backgrounds/**` 与索引表 | 约 57 份 | 待办 |
| G-H | 发版与验证：v1.7.0、三处同步、全量验证 | — | 待办 |

### 2.1 G-A 实施记录（2026-09-20）

已完成：GoS 来源注册（`gos-2019-index`，沿用 `source()` 工厂 → 自动进入 `SELECTABLE_SOURCE_IDS`）、7 个背景与 7 条背景特性登记（GoS 4 + AI 3 + EGtW 2 已在 G-A 内完成，共 9 条背景）。

| 背景 | ID | 技能 | 工具 | 语言 | 特性 |
| --- | --- | --- | --- | ---: | --- |
| 海军 | `background-2014-marine` | 运动、求生 | 水上载具 | 0 | 稳步前进 |
| 渔民 | `background-2014-fisher` | 历史、求生 | — | 1 | 捕获水产 |
| 船工 | `background-2014-shipwright` | 历史、察觉 | 木匠工具、水上载具 | 0 | 我来修好它 |
| 走私者 | `background-2014-smuggler` | 运动、欺瞒 | 水上载具 | 0 | 灰色地带 |
| 失败商人 | `background-2014-failed-merchant` | 调查、游说 | 工匠工具 | 1 | 供应链 |
| 竞争对手实习生 | `background-2014-rival-intern` | 历史、调查 | 工匠工具 | 1 | 内部线人 |
| 赌徒 | `background-2014-gambler` | 欺瞒、洞悉 | 赌具 | 1 | 永远别告诉我赔率 |
| 笑面人 | `background-2014-grinner` | 欺瞒、表演 | 乐器、盗贼工具 | 0 | 偏好乐曲 |
| 沃什塔克特工 | `background-2014-volstrucker-agent` | 欺瞒、隐匿 | 制毒工具 | 1 | 悲剧 |

验证：`vue-tsc -b` 通过；运行期复核 2014 背景 40 → **49**、重复 ID 0、无缺特性背景。

**索引条目设计约束（重要，需在 G-A 收尾时确认）**：`BackgroundRule` 虽有 `status` 字段，但 `OriginStep.vue` 的背景候选只按 `parentBackgroundId` 与来源开关过滤（第 54—56 行），**不按 `status` 过滤**。因此把「盐沼背景 DM 工具页」「英雄编年史出身故事」以 `index-only`／`dm-only` 入库会让它们出现在车卡候选里、且可被选中，直接违背 Q5-B／Q6-B 的「不进入普通车卡」目标。当前处理：**这两条只在资料文档（`docs/dnd-backgrounds.md`）登记为索引条目，不写入运行时仓库**；如确需入库，需先补「背景候选按 status 过滤」的实现（属模型改动，另行确认）。

## 3. 关键实现口径（已定）

1. **2014 背景**：`origin()` 式登记，字段为 `skillIds`／`toolIds`／`languageChoices`／`featureName`／`description`／`variantIds`／`status`／`sourceIds`；装备要点写入 `description`（2014 惯例）。
2. **背景特性**：每条基础背景 1 条 `BackgroundFeature`（`implemented` 或 `selectable`，按效果是否可自动计算判定）。
3. **第三方来源**：2014 侧沿用已注册的 `tp-*` 来源（`contentKind: 'third-party'`、`defaultEnabled: false`）；2024 侧新增 2 个 `source-2024-*` 第三方来源。
4. **Q2-A／Q3-A**：SCC 5 学生、SatO 2 条、DSotDQ 2 条登记为 `selectable` 摘要，不接入专长授予与位阶选择。
5. **Q8-B**：5 条 2024 写法背景只进 `5e-2024` 仓库；属性候选按原书三项；神话调查员的「任选」按全部六项登记并在摘要标注自选。
6. **Q10-A**：DoD 4 条背景的固定起源专长一并登记为 2024 第三方专长（`selectable`、来源默认关闭）。
7. **Q9-A**：每个新增背景提供 8 项人格特征／6 理想／6 羁绊／6 缺点（项目原创转述）。
8. **德拉肯海姆 1d8 秘宝／传闻表**：写入 `description`，不建结构化表。
9. **术语**：一律以 5e 不全书用字为准（沿用术语批次 Q10 口径）。
10. **拳斗士**（`4889`）为第三方职业，不作为背景登记。

## 4. 验证计划

1. `npx vue-tsc -b`；
2. `npx vitest run`（含 `background-descriptions-2014.test.ts`、`race-features-2014.test.ts`、`starting-equipment-2014.test.ts`、`unit-consistency.test.ts`；计数类断言按需同步）；
3. 生产构建 `npm run build`；
4. 运行期复核脚本：按来源统计新增背景数与特性数、确认第三方来源默认关闭、确认 2014／2024 无同 ID 冲突；
5. 若新增文本引入未覆盖字形 → 重建 `app/public/templates/fonts/noto-sans-sc-subset.ttf`（`python tools-subset/make-subset.py`）；
6. 依赖拓扑复核并在交付说明中写明结论。

## 5. 风险

| 风险 | 处理 |
| --- | --- |
| 57 项资料文档（8/6/6/6 特征表）工作量最大 | 代码先行、文档按批补齐；文档可独立成批（G-G），不阻塞代码验收 |
| 第三方 2024 背景需要起源专长与装备数据 | Q10-A／Q11-A 已确认一并登记；若某专长在原书仅有名称与摘要，按 `selectable` 登记 |
| 神话调查员「任选属性」超出三项候选类型 | 登记为六项候选 + 摘要标注「原书为任选」，不新增类型字段（如确需新增，先报告） |
| 既有计数断言 | 已列入第 4 节第 2 项 |
| SCC／SatO 的专长与战役先决 | Q2-A 已定：只登记摘要并显式标注 |
| 字体子集 | 已列入第 4 节第 5 项 |

## 6. 完成记录

（实施后填写：实际改动文件、验证结果、提交哈希、偏差说明。）
