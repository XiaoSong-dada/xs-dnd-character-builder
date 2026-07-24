# 生命领域 Life Domain

## 基本信息

- 子职 ID：`cleric-life-domain`
- 所属职业：[`cleric` 牧师](cleric.md)
- 规则集：`5e-2024`
- 选择等级：3级
- 内容来源：2024 Free Rules、SRD 5.2.1
- 许可边界：开放规则，可整理到项目实现所需粒度
- 核验状态：特性、等级、资源和领域法术已核验
- 官方详情：[2024 Free Rules — Cleric](https://www.dndbeyond.com/sources/dnd/br-2024/character-classes)

## 子职定位

生命领域专注于稳定治疗和危急救援。它提高消耗法术位的治疗量，以引导神力在濒危队友间分配生命值，治疗他人时同步恢复自身，并在高等级把治疗骰直接视为最大值。

## 子职特性

| 等级 | 特性 ID | 中文名 | 英文名 | 玩法摘要 |
|---:|---|---|---|---|
| 3 | `cleric-life-disciple-of-life` | 生命门徒 | Disciple of Life | 使用法术位施放的治疗法术在施法回合额外恢复 `2 + 法术位环阶` 生命值 |
| 3 | `cleric-life-domain-spells` | 生命领域法术 | Life Domain Spells | 在3、5、7、9级取得始终准备的治疗与防护法术 |
| 3 | `cleric-life-preserve-life` | 维持生命 | Preserve Life | 消耗引导神力，在30尺内流血目标间分配等于牧师等级5倍的治疗池，但不能把目标治到超过生命上限一半 |
| 6 | `cleric-life-blessed-healer` | 受佑医者 | Blessed Healer | 使用法术位治疗其他生物后，自身恢复 `2 + 法术位环阶` 生命值 |
| 17 | `cleric-life-supreme-healing` | 极效治疗 | Supreme Healing | 法术或引导神力的治疗骰不再掷骰，直接采用每颗骰子的最大值 |

## 领域法术

| 牧师等级 | 始终准备 |
|---:|---|
| 3 | Aid、Bless、Cure Wounds、Lesser Restoration |
| 5 | Mass Healing Word、Revivify |
| 7 | Aura of Life、Death Ward |
| 9 | Greater Restoration、Mass Cure Wounds |

## 选择、资源与校验

- 领域法术不占普通准备法术数量，但仍受施法位和其他施法规则限制。
- 生命门徒只在施放治疗法术的当回合生效，同一法术持续治疗的后续回合不重复添加。
- 维持生命只选择具有“流血”状态的目标；治疗池可以拆分，但每个目标不能因此超过生命上限一半。
- 维持生命属于引导神力用途，与神圣火花、驱散亡灵共享次数。
- 受佑医者要求治疗至少一个自身以外的生物，每次符合条件的施法只结算一次。
- 极效治疗只最大化恢复生命值的骰子，不最大化固定加值、临时生命值或伤害骰。

## 实现状态

- 规则数据路径：尚未实现。
- 校验重点：领域法术、施法回合、治疗池分配、半血上限、自我治疗触发、骰子最大化。
- 自动化测试：尚未实现。
- 最后核验日期：2026-07-24。
