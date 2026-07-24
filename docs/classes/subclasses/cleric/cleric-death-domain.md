# 死亡领域 Death Domain

## 基本信息

- 子职 ID：`cleric-death-domain`
- 所属职业：[`cleric` 牧师](cleric.md)
- 规则集：`5e-2014`
- 原版选择等级：1级；套用2024基础职业时在3级取得原本1—3级的领域能力
- 内容来源：2014 Dungeon Master's Guide
- 可用范围：仅限 DM 明确批准；属于 DM 选项，不进入默认玩家可选列表
- 官方详情：[D&D Beyond — 2014 Dungeon Master's Guide](https://www.dndbeyond.com/sources/dnd/dmg-2014)

## 子职定位

死亡领域是面向反派和特殊 NPC 的 DM 选项，强化死灵戏法与黯蚀伤害，并能用引导神力追加近战伤害、绕过抗性，最终让单目标死灵法术影响第二个邻近目标。

## 子职特性

| 原版等级 | 特性 ID | 中文名 | 英文名 | 玩法摘要 |
|---:|---|---|---|---|
| 1 | `cleric-death-domain-spells` | 死亡领域法术 | Death Domain Spells | 获得始终准备的死灵、衰弱与死亡主题法术 |
| 1 | `cleric-death-bonus-proficiency` | 额外熟练 | Bonus Proficiency | 获得军用武器熟练 |
| 1 | `cleric-death-reaper` | 收割者 | Reaper | 学会一个死灵戏法，并可让特定单目标死灵戏法影响第二个邻近目标 |
| 2 | `cleric-death-touch-of-death` | 死亡之触 | Touch of Death | 近战攻击命中时消耗引导神力追加黯蚀伤害 |
| 6 | `cleric-death-inescapable-destruction` | 无可逃避的毁灭 | Inescapable Destruction | 牧师法术和领域能力造成的黯蚀伤害忽略抗性 |
| 8 | `cleric-death-divine-strike` | 神圣打击 | Divine Strike | 旧版武器伤害强化；使用2024基础职业时由神佑打击路线承接 |
| 17 | `cleric-death-improved-reaper` | 强化收割者 | Improved Reaper | 符合条件的单目标死灵法术可影响第二个邻近目标 |

## 选择、资源与兼容

- 本条目必须标记 `dm-only: true`，不进入默认玩家可选列表。
- 收割者的额外戏法与目标复制只适用于原特性规定的死灵法术和目标条件。
- 死亡之触消耗共享引导神力，必须在近战攻击命中后结算。
- 无可逃避的毁灭只忽略抗性，不忽略免疫。
- 强化收割者必须校验法术环阶、单目标结构、第二目标距离和额外材料成分。
- 套用2024牧师时，不再叠加旧版8级神圣打击；7级按基础职业选择神佑打击。

## 实现状态

- 资料状态：特性结构与来源已整理；商业法术表、数值和完整规则正文未收录。
- 规则数据路径：尚未实现。
- 自动化测试：尚未实现。
- 最后核验日期：2026-07-24。
