# 2014 术士（Sorcerer）

## 文档定位

5e 2014 规则集的术士职业基础资料。与 `sorcerer.md`（2024 版，2 级获得超魔）**相互独立，禁止混用**；当前车卡程序唯一规则集为 `5e-2014`，本条为程序实际使用的数据基线。

## 规则要点

- 施法：全施法者进度（最高 9 环），以魅力施法；戏法与已知法术数量按 2014 术士表推进。
- 术法点：2 级起获得，数量 = 术士等级 + 2，长休后恢复；可与 1—5 环法术位互相转换（1 环 2 点、2 环 3 点、3 环 5 点、4 环 6 点、5 环 7 点）。
- 超魔法（Metamagic）：**3 级**选择 2 项，**10 级**、**17 级**各再选 1 项（共 4 项，不可重复）；施法时消耗术法点改变法术效果，每次施法只能应用一种超魔。
- 2014 超魔选项全部在 3 级获得超魔特性时即可选用，无等级解锁前置。

## 超魔选项（10 项，全部核验为 implemented）

登记于 `app/src/rules/data/metamagic-2014.ts`（`METAMAGIC_OPTION_IDS` / `metamagicOptions2014`），每条含中英文名、来源、原创中文摘要；术法点消耗仅作摘要展示，不做施法时消耗的自动计算。

| ID | 中文名 | 英文名 | 术法点消耗 | 来源 |
|---|---|---|---|---|
| `metamagic-careful` | 谨慎法术 | Careful Spell | 1 点 | SRD 5.1 |
| `metamagic-distant` | 增远法术 | Distant Spell | 1 点 | SRD 5.1 |
| `metamagic-empowered` | 强化法术 | Empowered Spell | 1 点 | SRD 5.1 |
| `metamagic-extended` | 延展法术 | Extended Spell | 1 点 | SRD 5.1 |
| `metamagic-heightened` | 威能法术 | Heightened Spell | 3 点 | SRD 5.1 |
| `metamagic-quickened` | 迅捷法术 | Quickened Spell | 2 点 | SRD 5.1 |
| `metamagic-subtle` | 隐蔽法术 | Subtle Spell | 1 点 | SRD 5.1 |
| `metamagic-twinned` | 孪生法术 | Twinned Spell | 1 点/目标 | SRD 5.1 |
| `metamagic-seeking` | 寻求法术 | Seeking Spell | 2 点 | TCoE 索引 |
| `metamagic-transmuted` | 易变法术 | Transmuted Spell | 1 点 | TCoE 索引 |

## 等级时间线检查点

| 等级 | 检查点 |
|---|---|
| 1 | 选择 2 项术士技能；选择术法起源（子职） |
| 3 | 选择 2 项超魔法（`sorcerer-2014-metamagic-3`） |
| 4/8/12/16/19 | 属性提升或专长 |
| 10 | 再选 1 项超魔法（`sorcerer-2014-metamagic-10`，不可与已选重复） |
| 17 | 再选 1 项超魔法（`sorcerer-2014-metamagic-17`，不可与已选重复） |

## 数据与校验

- 职业数据：`app/src/rules/data/full-casters-2014.ts`（checkpoints、spellcasting）。
- 特性注册：`app/src/rules/data/class-features-2014.ts`（超魔法 3 条特性带 `checkpointIds` 关联检查点，角色卡据此展示完成度）。
- 跨等级查重：超魔选项跨检查点不可重复选择（时间线 UI 按 `metamagic-` 前缀统一锁定，提示"已在较低等级掌握"）。
- 校验：未完成超魔检查点时报 error 并引导返回时间线；升级到 3/10/17 级时等级调整引导自动提示补全。
- 角色卡：能力页签展示超魔法特性完成度（"已选择 N 项"/"需选择 N/M"）与已选超魔列表。

## 子职索引（2014）

龙族血脉、狂野魔法、风暴术法、神圣之魂、暗影魔法、异怪心智、机关魂、月相术法；登记与核验状态见 `docs/dnd-classes.md` 的旧版与扩展子职索引。
