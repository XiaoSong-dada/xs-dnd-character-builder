# 王冠之誓 Oath of the Crown

## 基本信息

- 子职 ID：`paladin-oath-of-the-crown`
- 所属职业：[`paladin` 圣武士](paladin.md)
- 规则集：`5e-2014`
- 原版选择等级：3级；用于2024基础职业须通过兼容审核
- 内容来源：Sword Coast Adventurer's Guide
- 内容边界：商业规则，仅记录元数据、特性名称、原创摘要与兼容提示
- 官方详情：[Sword Coast Adventurer's Guide](https://www.dndbeyond.com/sources/dnd/scag)
- 最后核验：2026-07-27

## 玩法定位

以王权誓言强迫敌人留在战线、治疗盟友并代受伤害，随后获得保命优势和团队抗性。

## 快速索引

| 2024兼容等级 | 原版等级 | 特性 | 资源摘要 |
|---:|---:|---|---|
| 3 | 3 | 誓言法术（Oath Spells） | 自动常备 |
| 3 | 3 | 王冠引导神力（Champion Challenge and Turn the Tide） | 消耗引导神力 |
| 7 | 7 | 神圣忠诚（Divine Allegiance） | 受反应限制 |
| 15 | 15 | 不屈圣灵（Unyielding Saint） | 无次数限制 |
| 20 | 20 | 崇高斗士（Exalted Champion） | 长休一次 |

## 特性详解

### 3级：誓言法术 Oath Spells

- 特性 ID：`paladin-oath-of-the-crown-oath-spells`
- 动作或触发：被动；随等级解锁
- 资源与恢复：自动常备

获得命令、守护、群体治疗和忠诚主题额外法术。

实现与校验：

- 按等级解锁；不占普通准备数量；绑定5e-2014。

### 3级：王冠引导神力 Champion Challenge and Turn the Tide

- 特性 ID：`paladin-oath-of-the-crown-crown-channel-divinity`
- 动作或触发：奖励动作使用引导神力
- 资源与恢复：消耗引导神力

选择迫使附近敌人难以主动远离自己，或治疗附近生命低于一半的盟友。

实现与校验：

- 共用资源；挑战逐目标豁免并记录距离限制；治疗校验生命阈值。

### 7级：神圣忠诚 Divine Allegiance

- 特性 ID：`paladin-oath-of-the-crown-divine-allegiance`
- 动作或触发：反应；身旁生物受伤
- 资源与恢复：受反应限制

代替相邻生物承受该次伤害，且该伤害不能被减免。

实现与校验：

- 校验相邻；转移完整数值；不再应用抗性、免疫或减伤。

### 15级：不屈圣灵 Unyielding Saint

- 特性 ID：`paladin-oath-of-the-crown-unyielding-saint`
- 动作或触发：被动
- 资源与恢复：无次数限制

对抗麻痹和震慑的豁免获得优势。

实现与校验：

- 只应用于导致或维持相应状态的豁免。

### 20级：崇高斗士 Exalted Champion

- 特性 ID：`paladin-oath-of-the-crown-exalted-champion`
- 动作或触发：动作；变身
- 资源与恢复：长休一次

获得常规武器伤害抗性，并使附近盟友在死亡豁免和感知豁免上更有利。

实现与校验：

- 记录持续和灵光范围；抗性排除项按来源；盟友离开后失效。

## 兼容与校验

- 战役必须允许该来源，圣武士达到3级，且子职选择位尚未占用；破誓者还必须获得DM明确许可。
- 规则数据保留 `5e-2014`；誓言法术、引导神力、灵光、法术位和变身次数分开记录。
- 2014子职用于2024职业时不得隐式采用同名新版数值；新旧替代能力不得叠加。
- 规则数据与自动化测试尚未实现。
