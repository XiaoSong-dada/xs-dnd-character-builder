# 地底矮人（Duergar）— 5e-2014

[返回 2014 矮人](dwarf.md) · [返回种族总索引](../../../dnd-species.md)

## 基础资料

| 字段 | 内容 |
| --- | --- |
| 稳定 ID | `race-2014-dwarf-duergar` |
| 中文名 | 地底矮人 |
| 英文名 | Duergar |
| 规则集 | `5e-2014` |
| 父种族 | `race-2014-dwarf` |
| 生物类型、体型、速度、感官 | 继承矮人：类人生物、中型、25 尺（穿重甲不减速）；强化黑暗视觉 120 尺 |
| 子种族属性提升 | 体质 +2、力量 +1 |
| 来源 | Mordenkainen's Tome of Foes（重印 Sword Coast Adventurer's Guide 版） |
| 版权边界 | 商业规则内容，只记录元数据与原创摘要 |

官方来源：[Mordenkainen's Tome of Foes](https://www.dndbeyond.com/sources/mtof/races-dwarves)

## 继承与选择

- 继承矮人的毒素防护（矮人韧性）、石工知识，并以本文件覆盖/补充其余内容。
- 子种族属性提升为体质 +2、力量 +1（替换丘陵/山地矮人的 +1 加值，与基础矮人体质 +2 合计）。
- 与丘陵矮人、山地矮人互斥；常需战役设定许可。

## 快速索引

| 等级 | 特性 | 特性 ID | 核心效果 |
| --- | --- | --- | --- |
| 1 | 子种族属性提升 | `race-2014-dwarf-duergar-ability-score-increase` | 体质 +2、力量 +1 |
| 1 | 强化黑暗视觉 | `race-2014-dwarf-duergar-superior-darkvision` | 120 尺黑暗视觉 |
| 1 | 地底矮人韧性 | `race-2014-dwarf-duergar-resilience` | 对幻术、魅惑、麻痹豁免优势 |
| 1 | 矮人战斗训练 | `race-2014-dwarf-duergar-combat-training` | 战斧、手斧、轻型锤、战锤熟练 |
| 1 | 工具熟练 | `race-2014-dwarf-duergar-tool-proficiency` | 铁匠/酿酒/石匠工具任选其一 |
| 3 | 地底矮人魔法 | `race-2014-dwarf-duergar-magic` | 3 级放大术（仅放大）、5 级隐形术（仅自身）；各长休一次；直接阳光下不能施放；智力施法 |
| 1 | 日光敏感 | `race-2014-dwarf-duergar-sunlight-sensitivity` | 直接阳光下攻击与依赖视觉的察觉检定劣势 |

## 特性详解

### 3级：地底矮人魔法

- 特性 ID：`race-2014-dwarf-duergar-magic`
- 动作或触发：按对应法术施放。
- 资源与恢复：放大术（仅放大选项）3 级起、隐形术（仅自身）5 级起，各长休一次；无需材料成分。
- 效果：以智力为施法属性施放上述法术；直接阳光下不能施放。
- 实现与校验：两个法术限制条件（仅放大/仅自身、日光禁用）需在施放校验中生效。

### 1级：日光敏感

- 特性 ID：`race-2014-dwarf-duergar-sunlight-sensitivity`
- 动作或触发：被动。
- 资源与恢复：无。
- 效果：你、你的目标或你们之间的感知对象处于直射阳光下时，攻击检定与依赖视觉的感知（察觉）检定具有劣势。
- 实现与校验：与狗头人等同类特性共用一套日光敏感判定。

## 兼容边界

- 2014 原版保留日光敏感与力量 +1（MotM 重制版已删除/调整）。
- 核验日期：2026-08-11（dnd5e.wikidot.com 与 5e.tools 交叉核验）。
