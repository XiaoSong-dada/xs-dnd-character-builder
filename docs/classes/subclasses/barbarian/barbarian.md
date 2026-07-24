# 野蛮人 Barbarian

## 1. 文档范围

本文档记录野蛮人的基础职业资料、等级成长、车卡选择与项目实现边界。默认规则集为 `5e-2024`，公开规则依据 2024 Free Rules 与 SRD 5.2.1。

- 职业 ID：`barbarian`
- 规则集：`5e-2024`
- 核心定位：以力量近战、狂暴减伤、高生命值和武器精通承担前排输出与承伤
- 主要属性：力量
- 次要关注：体质影响生命值与无甲防御；敏捷影响无甲防御、先攻和部分技能
- 施法：基础职业不施法；狂暴期间不能施法或维持专注
- 子职选择等级：3级
- 资料状态：基础职业与狂战士道途已按开放规则核验；商业子职只记录索引和简要转述

## 2. 核心职业数据

| 字段 | 2024 规则 |
|---|---|
| 生命骰 | 每个野蛮人等级 `d12` |
| 1级最大生命值 | `12 + 体质调整值` |
| 后续等级生命值 | 每级增加 `1d12 + 体质调整值`，或采用团规则允许的固定值 |
| 豁免熟练 | 力量、体质 |
| 技能熟练 | 从驯兽、运动、威吓、自然、察觉、生存中选择2项 |
| 武器熟练 | 简易武器、军用武器 |
| 护甲训练 | 轻甲、中甲、盾牌 |
| 工具熟练 | 无 |
| 起始装备 A | 巨斧、4把手斧、探索套组、15 GP |
| 起始装备 B | 75 GP |
| 多职业属性前置 | 力量13 |

## 3. 1级车卡资料

### 3.1 必须完成的选择

1. 从野蛮人技能列表中选择2项不同技能。
2. 选择起始装备方案 A 或 B；两种方案互斥。
3. 选择2种简易或军用近战武器，启用其武器精通属性。
4. 决定使用护甲、无甲防御和盾牌的组合；最终 AC 由合法公式计算，不把多个基础 AC 公式相加。

### 3.2 1级派生值

```text
最大生命值 = 12 + 体质调整值
无甲防御 AC = 10 + 敏捷调整值 + 体质调整值 + 盾牌修正（若持盾）
近战攻击加值 = 力量调整值 + 熟练加值（使用熟练武器时）
狂暴近战伤害 = 武器伤害 + 力量调整值 + 狂暴伤害加值
```

1级熟练加值为 `+2`，狂暴次数为2，狂暴伤害加值为 `+2`，武器精通数量为2。

### 3.3 狂暴的实现要点

- 激活：未穿重甲时，以附赠动作消耗1次狂暴。
- 防御：获得钝击、穿刺和挥砍伤害抗性。
- 伤害：使用力量进行武器或徒手攻击并造成伤害时，加入当前狂暴伤害加值。
- 检定：力量检定和力量豁免具有优势。
- 限制：狂暴期间不能施法，也不能维持专注。
- 持续：默认持续到下一回合结束；攻击敌人、迫使敌人进行豁免，或花费附赠动作均可延长一轮，最长10分钟。
- 恢复：短休恢复1次已消耗的狂暴，长休恢复全部。
- 提前结束：穿上重甲或陷入失能时结束；15级持久狂暴会调整持续方式。

## 4. 职业成长表

| 等级 | 熟练加值 | 获得特性 | 狂暴次数 | 狂暴伤害 | 武器精通 |
|---:|---:|---|---:|---:|---:|
| 1 | +2 | 狂暴、无甲防御、武器精通 | 2 | +2 | 2 |
| 2 | +2 | 危险感知、鲁莽攻击 | 2 | +2 | 2 |
| 3 | +2 | 野蛮人子职、原始知识 | 3 | +2 | 2 |
| 4 | +2 | 属性值提升 | 3 | +2 | 3 |
| 5 | +3 | 额外攻击、快速移动 | 3 | +2 | 3 |
| 6 | +3 | 子职特性 | 4 | +2 | 3 |
| 7 | +3 | 野性直觉、本能突袭 | 4 | +2 | 3 |
| 8 | +3 | 属性值提升 | 4 | +2 | 3 |
| 9 | +4 | 残暴打击 | 4 | +3 | 3 |
| 10 | +4 | 子职特性 | 4 | +3 | 4 |
| 11 | +4 | 不屈狂暴 | 4 | +3 | 4 |
| 12 | +4 | 属性值提升 | 5 | +3 | 4 |
| 13 | +5 | 强化残暴打击 | 5 | +3 | 4 |
| 14 | +5 | 子职特性 | 5 | +3 | 4 |
| 15 | +5 | 持久狂暴 | 5 | +3 | 4 |
| 16 | +5 | 属性值提升 | 5 | +4 | 4 |
| 17 | +6 | 强化残暴打击 | 6 | +4 | 4 |
| 18 | +6 | 不屈之力 | 6 | +4 | 4 |
| 19 | +6 | 传奇恩惠 | 6 | +4 | 4 |
| 20 | +6 | 原始斗士 | 6 | +4 | 4 |

## 5. 职业特性摘要

| 等级 | 特性 ID | 中文名 | 英文名 | 项目摘要 |
|---:|---|---|---|---|
| 1 | `barbarian-rage` | 狂暴 | Rage | 消耗型核心状态，提供减伤、力量优势和力量攻击伤害加值 |
| 1 | `barbarian-unarmored-defense` | 无甲防御 | Unarmored Defense | 未着甲时使用敏捷与体质计算基础 AC，可搭配盾牌 |
| 1 | `barbarian-weapon-mastery` | 武器精通 | Weapon Mastery | 为指定近战武器启用精通属性，长休后可调整选择 |
| 2 | `barbarian-danger-sense` | 危险感知 | Danger Sense | 未失能时，敏捷豁免具有优势 |
| 2 | `barbarian-reckless-attack` | 鲁莽攻击 | Reckless Attack | 用防御风险换取本轮力量攻击优势，敌人攻击你时也获得优势 |
| 3 | `barbarian-subclass` | 野蛮人子职 | Barbarian Subclass | 选择一个道途，在3、6、10、14级取得子职特性 |
| 3 | `barbarian-primal-knowledge` | 原始知识 | Primal Knowledge | 增加1项职业技能；狂暴时部分技能可改用力量检定 |
| 4 | `barbarian-ability-score-improvement` | 属性值提升 | Ability Score Improvement | 在4、8、12、16级取得符合条件的专长 |
| 5 | `barbarian-extra-attack` | 额外攻击 | Extra Attack | 执行攻击动作时攻击2次 |
| 5 | `barbarian-fast-movement` | 快速移动 | Fast Movement | 未穿重甲时速度增加10尺 |
| 7 | `barbarian-feral-instinct` | 野性直觉 | Feral Instinct | 先攻检定具有优势 |
| 7 | `barbarian-instinctive-pounce` | 本能突袭 | Instinctive Pounce | 进入狂暴时可移动至多一半速度 |
| 9 | `barbarian-brutal-strike` | 残暴打击 | Brutal Strike | 放弃一次鲁莽攻击优势，命中后增加伤害并施加战术效果 |
| 11 | `barbarian-relentless-rage` | 不屈狂暴 | Relentless Rage | 狂暴中降至0 HP时以体质豁免尝试保留生命值 |
| 13 | `barbarian-improved-brutal-strike-13` | 强化残暴打击 | Improved Brutal Strike | 增加残暴打击的控制或协作选项 |
| 15 | `barbarian-persistent-rage` | 持久狂暴 | Persistent Rage | 先攻时可恢复狂暴，并取消逐轮维持操作 |
| 17 | `barbarian-improved-brutal-strike-17` | 强化残暴打击 | Improved Brutal Strike | 伤害提升为2d10，并可组合两个不同效果 |
| 18 | `barbarian-indomitable-might` | 不屈之力 | Indomitable Might | 力量检定或豁免过低时，可用力量值替代结果 |
| 19 | `barbarian-epic-boon` | 传奇恩惠 | Epic Boon | 取得符合条件的传奇恩惠或其他专长 |
| 20 | `barbarian-primal-champion` | 原始斗士 | Primal Champion | 力量和体质各提高4，上限提高至25 |

## 6. 子职业资料

### 6.1 2024 核心子职

- [狂战士道途 Path of the Berserker](barbarian-berserker.md)：直接强化鲁莽攻击、抗心智控制与反击。
- [狂野之心道途 Path of the Wild Heart](barbarian-wild-heart.md)：按动物灵性在防御、移动和团队增益间切换。
- [世界树道途 Path of the World Tree](barbarian-world-tree.md)：提供临时生命值、位移控制、触及和传送。
- [狂信者道途 Path of the Zealot](barbarian-zealot.md)：神圣伤害、自我恢复、团队爆发和高等级生存。

### 6.2 官方旧版与扩展子职

- [战狂道途 Path of the Battlerager](barbarian-battlerager.md)
- [先祖守卫道途 Path of the Ancestral Guardian](barbarian-ancestral-guardian.md)
- [风暴先驱道途 Path of the Storm Herald](barbarian-storm-herald.md)
- [狂野魔法道途 Path of Wild Magic](barbarian-wild-magic.md)
- [野兽道途 Path of the Beast](barbarian-beast.md)
- [巨人道途 Path of the Giant](barbarian-giant.md)

旧版和扩展子职仍使用 `5e-2014` 标记。套用 2024 野蛮人时必须由团规则允许，并按官方兼容说明在3级取得子职能力，不能把同名旧版与新版能力叠加。

## 7. 车卡校验要求

- 技能必须从职业允许列表中选择2项，且不能重复计数。
- 起始装备方案 A/B 互斥；金币购买路线由装备模块另行校验。
- 武器精通必须绑定具体武器种类，数量不能超过当前等级上限。
- 狂暴伤害只应用于使用力量的武器或徒手攻击。
- 穿重甲时不能进入或维持狂暴；无甲防御要求未穿任何护甲。
- AC 应在护甲公式与无甲防御公式中选择合法的一种，再应用盾牌等可叠加修正。
- 3级以前不能选择子职；同一个子职选择位只能选择一个道途。
- 旧版扩展子职必须记录 `ruleset: 5e-2014`、来源书与 DM 许可状态。

## 8. 官方来源

- [2024 Free Rules — Character Classes](https://www.dndbeyond.com/sources/dnd/br-2024/character-classes)
- [SRD 5.2.1](https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf)
- [2024 Barbarian vs. 2014 Barbarian: What’s New](https://www.dndbeyond.com/posts/1750-2024-barbarian-vs-2014-barbarian-whats-new)
- [2024 Player’s Handbook 更新目录](https://www.dndbeyond.com/posts/1810-updates-in-the-players-handbook-2024)

最后核验日期：2026-07-24。
