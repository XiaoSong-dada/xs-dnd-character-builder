# 破誓者 Oathbreaker

## 基本信息

- 子职 ID：`paladin-oathbreaker`
- 所属职业：[`paladin` 圣武士](paladin.md)
- 规则集：`5e-2014`
- 原版选择等级：3级；用于2024基础职业须通过兼容审核
- 内容来源：Dungeon Master's Guide
- 内容边界：商业规则，仅记录元数据、特性名称、原创摘要与兼容提示
- 官方详情：[Dungeon Master's Guide](https://www.dndbeyond.com/sources/dnd/dmg-2014)
- 最后核验：2026-07-27

## 玩法定位

以破誓之力控制亡灵、散播恐惧并强化邪恶近战单位，最终形成黑暗、恐慌和持续伤害领域；必须由DM明确许可。

## 快速索引

| 2024兼容等级 | 原版等级 | 特性 | 资源摘要 |
|---:|---:|---|---|
| 3 | 3 | 誓言法术（Oathbreaker Spells） | 自动常备 |
| 3 | 3 | 破誓引导神力（Control Undead and Dreadful Aspect） | 消耗引导神力 |
| 7 | 7 | 憎恨灵光（Aura of Hate） | 无次数限制 |
| 15 | 15 | 超凡抗性（Supernatural Resistance） | 无次数限制 |
| 20 | 20 | 恐惧领主（Dread Lord） | 长休一次 |

## 特性详解

### 3级：誓言法术 Oathbreaker Spells

- 特性 ID：`paladin-oathbreaker-oath-spells`
- 动作或触发：被动；随等级解锁
- 资源与恢复：自动常备

获得诅咒、亡灵、黑暗和支配主题额外法术。

实现与校验：

- 仅在DM允许反派职业时解锁；按等级常备并绑定5e-2014。

### 3级：破誓引导神力 Control Undead and Dreadful Aspect

- 特性 ID：`paladin-oathbreaker-oathbreaker-channel-divinity`
- 动作或触发：动作；使用引导神力
- 资源与恢复：消耗引导神力

选择控制一个符合条件的亡灵，或释放恐惧威仪使附近生物恐慌。

实现与校验：

- 两个选项共用资源；控制校验挑战等级；恐惧逐目标豁免并记录持续。

### 7级：憎恨灵光 Aura of Hate

- 特性 ID：`paladin-oathbreaker-aura-of-hate`
- 动作或触发：被动；影响灵光内特定生物
- 资源与恢复：无次数限制

自己以及附近邪魔和亡灵的近战武器伤害加入魅力调整值，可能同样强化敌人。

实现与校验：

- 不区分敌我，按生物类型实时生效；同一来源不叠加；范围随等级。

### 15级：超凡抗性 Supernatural Resistance

- 特性 ID：`paladin-oathbreaker-supernatural-resistance`
- 动作或触发：被动
- 资源与恢复：无次数限制

获得对非魔法普通武器伤害的抗性。

实现与校验：

- 校验攻击是否魔法及伤害类型；与其他抗性不重复减半。

### 20级：恐惧领主 Dread Lord

- 特性 ID：`paladin-oathbreaker-dread-lord`
- 动作或触发：动作；开启黑暗领域
- 资源与恢复：长休一次

制造魔法昏暗，令恐慌敌人在其中持续受伤，并可用奖励动作发动暗影攻击。

实现与校验：

- 记录范围、光照、恐慌来源和伤害时点；暗影攻击使用奖励动作并正确选目标。

## 兼容与校验

- 战役必须允许该来源，圣武士达到3级，且子职选择位尚未占用；破誓者还必须获得DM明确许可。
- 规则数据保留 `5e-2014`；誓言法术、引导神力、灵光、法术位和变身次数分开记录。
- 2014子职用于2024职业时不得隐式采用同名新版数值；新旧替代能力不得叠加。
- 规则数据与自动化测试尚未实现。
