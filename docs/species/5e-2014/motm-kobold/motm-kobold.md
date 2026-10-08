# 狗头人（多元宇宙） - 5e-2014

[返回种族索引](../../../dnd-species.md)

## 来源与基础

- 独立主种族 `race-2014-motm-kobold`；Kobold；来源 `motm-2022-index`。
- 生物类型：类人生物；类型相关目标条件仅提示。
- 本地 CHM 1764 与创建总则1771；商业内容只保留必要元数据及原创机械摘要。
- 不继承旧版父项，不覆盖旧种族、2024物种或其特性ID。
- 体型：小型；步行30尺；黑暗视觉60尺。
- 属性任选不同两项+2/+1或三项各+1，最高20；通用语加一门自选语言。

## 必选与依赖

选择存入现有 `selections`，在时间线收集；按等级、父选择、候选和来源统一校验。失效原值保留但停用。

- `race-2014-motm-kobold-legacy`：1级，选择狗头人遗赠；选择狗头人遗赠
- `race-2014-motm-kobold-skill`：1级，机智技能；机智技能 依赖 `race-2014-motm-kobold-legacy` 的 `race-2014-motm-kobold-craftiness`。
- `race-2014-motm-kobold-spellcasting-ability`：1级，龙术施法属性；龙术施法属性 依赖 `race-2014-motm-kobold-legacy` 的 `race-2014-motm-kobold-draconic-sorcery`。
- `race-2014-motm-kobold-cantrip`：1级，选择术士戏法；选择术士戏法 依赖 `race-2014-motm-kobold-legacy` 的 `race-2014-motm-kobold-draconic-sorcery`。

## 特性索引与边界

| 稳定ID后缀 | 等级 | 名称 | 原创机械摘要与资源 |
| --- | --- | --- | --- |
| `branch-craftiness` | 1 | 机智 | 奥秘、调查、医药、巧手、求生选一熟练。 |
| `branch-defiance` | 1 | 逆反 | 避免或结束自身恐慌的豁免具有优势。 |
| `branch-draconic-sorcery` | 1 | 龙术 | 从术士法术表选一戏法，施法属性智力、感知、魅力选一。 |
| `draconic-cry` | 1 | 龙吼 | 附赠动作吼向10尺内敌人；可听见自己的敌人受到自己与盟友攻击时具有优势，至自己下回合开始；熟练次数/长休。 资源：长休恢复，上限按角色熟练加值。 |
| `darkvision` | 1 | 黑暗视觉 | 60尺黑暗视觉；黑暗中只能分辨灰度。 |

## 验证与实现边界

专项测试见 `app/test/rules/motm-*2014.test.ts`；33项联验在 `motm-complete-2014.test.ts`、`motm-complete-surfaces.test.ts`、`motm-complete-export.test.ts`。覆盖1—20级、两种属性方案、合法候选与依赖、等级和来源失效/恢复、版本隔离、JSON/ZIP/本地保存以及真实PDF/XLSX模板。实际验证结果及未闭合证据见 [MotM验收记录](../../../需求文档/MotM完整接入验收记录.md)。

临时状态、位移、天然攻击、伤害、治疗、抗性与长休临时熟练只给出规则提示，不自动修改生命、伤害、移动、永久熟练或临时AC。
