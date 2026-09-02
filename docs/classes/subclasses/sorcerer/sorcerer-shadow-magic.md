# 幽影魔法 Shadow Magic

## 基本信息

- 子职 ID：`sorcerer-shadow-magic`
- 所属职业：[`sorcerer` 术士](sorcerer.md)
- 规则集：`5e-2014`
- 选择等级：原版1级；2024兼容时3级
- 来源与边界：Xanathar's Guide to Everything；商业规则，不复制正文
- 官方详情：[Xanathar's Guide to Everything](https://www.dndbeyond.com/sources/dnd/xgte)
- 最后核验：2026-07-27

## 玩法定位

依靠黑暗视觉、濒死保命、暗影猎犬和阴影传送压制目标，最终化为阴影。

## 快速索引

| 2024兼容等级 | 原版等级 | 特性 | 资源摘要 |
|---:|---:|---|---|
| 3 | 1 | 黑夜明目（Eyes of the Dark） | 无次数限制 |
| 3 | 1 | 墓中之力（Strength of the Grave） | 长休一次 |
| 3 | 3 | 幽暗之瞳强化（Eyes of the Dark Upgrade） | 消耗术法点 |
| 6 | 6 | 恶兆猎犬（Hound of Ill Omen） | 消耗术法点 |
| 14 | 14 | 幽影漫步（Shadow Walk） | 无次数限制 |
| 18 | 18 | 阴影形态（Umbral Form） | 消耗术法点 |

## 特性详解

### 3级（原版1级）：黑夜明目 Eyes of the Dark

- 特性 ID：`sorcerer-shadow-magic-eyes-of-the-dark`
- 动作或触发：被动
- 资源与恢复：无次数限制

获得强化黑暗视觉，后续等级扩展与黑暗术相关的能力。

实现与校验：

- 2024兼容时在3级取得；已有更远视觉时不叠加。

### 3级（原版1级）：墓中之力 Strength of the Grave

- 特性 ID：`sorcerer-shadow-magic-strength-of-the-grave`
- 动作或触发：受伤将降至0生命时
- 资源与恢复：长休一次

魅力豁免成功则改为保留1点生命；某些伤害不适用。

实现与校验：

- 先判断排除条件，再计算DC；成功后改写生命并消耗资源。

### 3级：幽暗之瞳强化 Eyes of the Dark Upgrade

- 特性 ID：`sorcerer-shadow-magic-eyes-of-the-dark-upgrade`
- 动作或触发：施放黑暗术时
- 资源与恢复：消耗术法点

学会黑暗术；用术法点施放时能看穿自己创造的黑暗。

实现与校验：

- 记录施法来源；只看穿由该方式创造的黑暗。

### 6级：恶兆猎犬 Hound of Ill Omen

- 特性 ID：`sorcerer-shadow-magic-hound-of-ill-omen`
- 动作或触发：奖励动作；指定可见目标
- 资源与恢复：消耗术法点

在目标附近召唤只追猎该目标的暗影猎犬，并削弱其对术士法术的豁免。

实现与校验：

- 校验空位和目标；使用指定模板；劣势只应用于对应法术。

### 14级：幽影漫步 Shadow Walk

- 特性 ID：`sorcerer-shadow-magic-shadow-walk`
- 动作或触发：奖励动作；位于昏暗或黑暗中
- 资源与恢复：无次数限制

传送到可见的另一处昏暗或黑暗空位。

实现与校验：

- 起点终点均校验光照；终点可见且未占用。

### 18级：阴影形态 Umbral Form

- 特性 ID：`sorcerer-shadow-magic-umbral-form`
- 动作或触发：奖励动作
- 资源与恢复：消耗术法点

化为阴影，可穿越生物和物体并获得多种伤害抗性。

实现与校验：

- 记录持续；在物体内结束回合时结算惩罚；校验抗性排除项。

## 兼容与校验

- 战役必须允许该来源，且子职选择位尚未占用。
- 规则数据保留 `5e-2014`；2014子职兼容2024职业时只移动首次授予等级，不自动采用2024同名数值。
- 额外法术、普通法术、术法点、免费施放和独立资源分开记录。
- 新旧同名或替代能力不得叠加；规则数据与自动化测试尚未实现。
