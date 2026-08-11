# 5e-2014 护甲与盾牌

> 来源：2014《玩家手册》（PHB）装备章节 / SRD 5.1 开放规则。价格与重量为官方表格数据（以 PHB 为准）；介绍为原创中文转述。
> 登记状态：`implemented` 表示已进入 `app/src/rules/data/equipment-2014.ts` 且描述完整；`pending` 表示待补全。

## 轻甲

| 稳定 ID | 中文名 | 英文名 | 价格 | 重量 | 基础 AC | 力量需求 | 隐蔽劣势 | 介绍（原创转述） | 状态 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `equipment-2014-padded-armor` | 衬甲 | Padded | 10 gp | 8 磅 | 11 + 敏捷调整值（不限） | 无 | 有 | 内衬布料的软甲，防御有限但便宜，适合临时防护。 | implemented |
| `equipment-2014-leather-armor` | 皮甲 | Leather | 10 gp | 10 磅 | 11 + 敏捷调整值（不限） | 无 | 无 | 硬化皮革制成的胸甲与护肩，行动灵活。 | implemented |
| `equipment-2014-studded-leather` | 镶钉皮甲 | Studded leather | 45 gp | 13 磅 | 12 + 敏捷调整值（不限） | 无 | 无 | 皮甲上钉满铆钉与金属片，兼顾灵活与防护。 | implemented |

## 中甲

| 稳定 ID | 中文名 | 英文名 | 价格 | 重量 | 基础 AC | 力量需求 | 隐蔽劣势 | 介绍（原创转述） | 状态 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `equipment-2014-hide-armor` | 兽皮甲 | Hide | 10 gp | 12 磅 | 12 + 敏捷调整值（最多 +2） | 无 | 无 | 厚兽皮鞣制而成，原始部族常见。 | implemented |
| `equipment-2014-chain-shirt` | 链甲衫 | Chain shirt | 50 gp | 20 磅 | 13 + 敏捷调整值（最多 +2） | 无 | 无 | 金属环编成的短衫，穿在衣物内层。 | implemented |
| `equipment-2014-scale-mail` | 鳞甲 | Scale mail | 50 gp | 45 磅 | 14 + 敏捷调整值（最多 +2） | 14 | 有 | 皮革底衬上叠覆金属鳞片，防护扎实。 | implemented |
| `equipment-2014-breastplate` | 胸甲 | Breastplate | 400 gp | 20 磅 | 14 + 敏捷调整值（最多 +2） | 无 | 无 | 覆盖躯干的正反两块金属板，其余部位保持灵活。 | implemented |
| `equipment-2014-half-plate` | 半身板甲 | Half plate | 750 gp | 40 磅 | 15 + 敏捷调整值（最多 +2） | 15 | 有 | 胸甲与锁子甲组合，防护接近全身板甲。 | implemented |

## 重甲

| 稳定 ID | 中文名 | 英文名 | 价格 | 重量 | 基础 AC | 力量需求 | 隐蔽劣势 | 介绍（原创转述） | 状态 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `equipment-2014-ring-mail` | 环甲 | Ring mail | 30 gp | 40 磅 | 14 | 无 | 有 | 皮甲上缝满金属环，是重甲中最廉价的款式。 | implemented |
| `equipment-2014-chain-mail` | 链甲 | Chain mail | 75 gp | 55 磅 | 16 | 13 | 有 | 全金属环编成的全身锁子甲。 | implemented |
| `equipment-2014-splint-armor` | 板条甲 | Splint | 200 gp | 60 磅 | 17 | 15 | 有 | 皮底上固定纵向金属条，介于链甲与板甲之间。 | implemented |
| `equipment-2014-plate-armor` | 板甲 | Plate | 1,500 gp | 65 磅 | 18 | 15 | 有 | 全面成型的金属甲胄，普通装备中的顶级防护。 | implemented |

## 盾牌

| 稳定 ID | 中文名 | 英文名 | 价格 | 重量 | 效果 | 介绍（原创转述） | 状态 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `equipment-2014-shield` | 盾牌 | Shield | 10 gp | 6 磅 | 装备时 AC +2 | 木或金属制的盾，需一只手持握，可格挡攻击。 | implemented |

## 备注

- 护甲条目在代码中的字段映射：`armorBase`（基础 AC）、`addsDexterityToArmor`（是否加敏捷调整值）、`armorDexterityCap`（敏捷上限）、`armorClassBonus`（盾牌 +2）；力量需求与隐蔽劣势目前在 `description` 文本中。
- 力量需求不满足时，角色速度降低 10 尺且不能施展法术（规则效果，当前项目未做该派生，属后续批次）。
