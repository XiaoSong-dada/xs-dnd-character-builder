# 神龙宗 Way of the Ascendant Dragon

## 基本信息

- 子职 ID：`monk-ascendant-dragon`
- 所属职业：[`monk` 武僧](monk.md)
- 规则集：`5e-2014`
- 原版选择等级：3级；套用2024基础职业时仍在3级取得子职
- 内容来源：Fizban's Treasury of Dragons
- 内容边界：商业规则，仅记录元数据、特性名称、原创摘要和兼容提示
- 官方详情：[Fizban's Treasury of Dragons](https://www.dndbeyond.com/sources/dnd/ftod)
- 最后核验：2026-07-27

## 玩法定位

把龙族气息融入徒手打击和锥形吐息，逐步获得短时飞翼、威仪灵光与高阶龙族防护。

## 快速索引

| 2024兼容等级 | 原版等级 | 特性 | 资源摘要 |
|---:|---:|---|---|
| 3 | 3 | 龙族弟子（Draconic Disciple） | 无固定次数 |
| 3 | 3 | 龙之息（Breath of the Dragon） | 熟练加值次/长休；之后可耗气 |
| 6 | 6 | 展翼（Wings Unfurled） | 熟练加值次/长休 |
| 11 | 11 | 巨龙威仪（Aspect of the Wyrm） | 长休一次；之后可耗气 |
| 17 | 17 | 升龙威仪（Ascendant Aspect） | 无独立次数 |

## 特性详解

### 3级：龙族弟子 Draconic Disciple

- 特性 ID：`monk-ascendant-dragon-draconic-disciple`
- 动作或触发：被动；徒手攻击或社交检定时
- 资源与恢复：无固定次数

可改变徒手打击为指定元素伤害，学会龙语，并在威吓或说服失败时尝试重掷。

实现与校验：

- 保存伤害选择和语言；社交重掷使用次数按来源恢复；必须采用新结果。

### 3级：龙之息 Breath of the Dragon

- 特性 ID：`monk-ascendant-dragon-breath-of-the-dragon`
- 动作或触发：攻击动作中替换一次攻击
- 资源与恢复：熟练加值次/长休；之后可耗气

以锥形或线形吐息造成所选元素伤害，目标敏捷豁免减半。

实现与校验：

- 替换而非追加攻击；记录免费次数与气消耗；武艺骰和范围按等级升级。

### 6级：展翼 Wings Unfurled

- 特性 ID：`monk-ascendant-dragon-wings-unfurled`
- 动作或触发：使用疾风步时
- 资源与恢复：熟练加值次/长休

显现龙翼，获得持续到回合结束的飞行速度。

实现与校验：

- 与疾风步同一流程；扣除次数；回合结束移除飞行并处理坠落。

### 11级：巨龙威仪 Aspect of the Wyrm

- 特性 ID：`monk-ascendant-dragon-aspect-of-the-wyrm`
- 动作或触发：奖励动作；展开龙族灵光
- 资源与恢复：长休一次；之后可耗气

选择威慑敌人或为盟友提供元素抗性的灵光；灵光持续一段时间。

实现与校验：

- 记录选项、范围和持续；恐慌逐目标豁免；抗性不叠加。

### 17级：升龙威仪 Ascendant Aspect

- 特性 ID：`monk-ascendant-dragon-ascendant-aspect`
- 动作或触发：被动；强化龙之息与巨龙威仪
- 资源与恢复：无独立次数

获得盲视，吐息伤害增强，灵光还可在开启时爆发元素伤害。

实现与校验：

- 强化旧能力而非新增并行资源；爆发逐目标豁免并使用当前元素。

## 兼容与校验

- 战役必须允许该来源，武僧达到3级，且子职选择位尚未占用。
- 规则数据保留 `5e-2014`；武艺骰、专注点/气、动作经济、免费次数与独立资源分开追踪。
- 2014子职用于2024职业需要DM许可，气与专注点的名称映射不代表可以混用两版特性数值。
- 新旧同名或替代能力不得叠加；规则数据与自动化测试尚未实现。
