# D&D 5e 装备资料索引

> 本文档是护甲、武器、冒险装备、工具、法器、坐骑货物与魔法物品的选择性加载入口，不属于每次开发任务的立即加载文档。
> 当前已建立 `5e-2014` 装备结构，覆盖《玩家手册》（PHB 2014）装备章节全部普通装备与《地下城主指南》（DMG 2014）魔法物品，均为**原创中文转述**，遵守版权边界（不复制原书正文）。

0.7.0 进一步登记 XGtE 玩家可持有常见魔法物品与 TCoE 刺青、法器、魔法书等条目；重印内容使用单一稳定 ID 和多来源集合。`magicItems2024` 与 2014 可编辑仓库严格隔离。

## 术语与版本边界

| 规则集 | 装备组织方式 | 程序支持状态 |
| --- | --- | --- |
| `5e-2014` | 普通装备（护甲/盾牌/武器/冒险装备/工具/法器/套组/坐骑货物）+ 魔法物品（按英文名 A–Z） | 普通装备 222 条；DMG 候选 247 条已全部装配，连同具体型号共 278 条 DMG 运行时实体 |

- 角色只能使用与自身 `ruleset` 一致的装备条目；2014 与 2024 的同名装备必须使用不同稳定 ID 和独立数据。
- 价格与重量为官方机械数据（`gp`/`sp`/`cp` 与磅），以 2014《玩家手册》装备表为准；魔法物品无固定价格，按稀有度给出参考区间（以 XGtE 附录购买规则为准）并注明"由 DM 定价"。
- 所有介绍均为**原创中文摘要转述**，覆盖用途、效果要点与规则影响；不复制原书正文，不用于自动派生计算之外的版权敏感内容。
- 魔法物品分罕见度等级：常见（common）、非普通（uncommon）、稀有（rare）、非常稀有（very rare）、传说（legendary）、神器（artifact）及聚合索引（varies）；诅咒物品单独标注“诅咒”。

## 文档目录与字段约定

```text
docs/dnd-equipment.md                        总入口（本文档）
docs/equipment/5e-2014/armor-and-shields.md  护甲与盾牌（13 条）
docs/equipment/5e-2014/weapons.md            武器（37 条）
docs/equipment/5e-2014/adventuring-gear.md   冒险装备（约 80 条 + 背景专属 24 条）
docs/equipment/5e-2014/tools.md              工具与法器（约 45 条）
docs/equipment/5e-2014/packs-and-mounts.md   套组、坐骑与车辆（约 35 条）
docs/equipment/5e-2014/magic-items/a.md      魔法物品 A
docs/equipment/5e-2014/magic-items/b.md      魔法物品 B
docs/equipment/5e-2014/magic-items/c.md      魔法物品 C
docs/equipment/5e-2014/magic-items/d.md      魔法物品 D
docs/equipment/5e-2014/magic-items/e-f.md    魔法物品 E–F
docs/equipment/5e-2014/magic-items/g-h.md    魔法物品 G–H
docs/equipment/5e-2014/magic-items/i-j.md    魔法物品 I–J
docs/equipment/5e-2014/magic-items/k-l.md    魔法物品 K–L
docs/equipment/5e-2014/magic-items/m-n.md    魔法物品 M–N
docs/equipment/5e-2014/magic-items/o-p.md    魔法物品 O–P（含药水表）
docs/equipment/5e-2014/magic-items/q-r.md    魔法物品 Q–R
docs/equipment/5e-2014/magic-items/s.md      魔法物品 S
docs/equipment/5e-2014/magic-items/t-v.md    魔法物品 T–V
docs/equipment/5e-2014/magic-items/w-z.md    魔法物品 W–Z
docs/equipment/5e-2014/magic-items/artifacts.md 神器（artifact，8 件）
```

每个装备条目至少记录：

- 稳定 ID：本文档按规范 ID（`equipment-2014-<slug>`）登记；现有代码 `app/src/rules/data/equipment-2014.ts` 当前使用裸 ID（如 `padded-armor`、`club`），两者为同一物品，后续数据补全批次决定是否统一迁移 ID（迁移需同步更新 `starting-equipment-2014.ts` 等全部引用）。中文名、英文名、`ruleset`、分类、来源与版权边界照常记录。
- 价格（普通装备为 PHB 表格价；魔法物品为稀有度参考区间）、重量（如有）。
- 是否可装备（`equippable`）、装备位/类别（护甲、盾牌、武器、奇物、戒指、法杖等）。
- 效果摘要（原创转述）与规则影响（AC、伤害、施法、资源等）。
- 登记状态：`implemented`（已进入 `equipment-2014.ts` 并可参与派生）/ `index-only`（已建索引与摘要，未核验，不参与派生）/ `pending`（待登记）。

## 普通装备范围（PHB 2014 装备章节）

- **护甲与盾牌**：轻甲 3 种、中甲 5 种、重甲 4 种、盾牌 1 种；含 AC 公式、力量需求与隐蔽劣势。
- **武器**：简单近战 10、简单远程 4、军用近战 18、军用远程 5；含伤害骰、伤害类型与特性（灵巧、轻、双手、重、投掷、弹药、触及等）。
- **冒险装备**：工具类外的随身物品（容器、光源、绳索、服装、文书、补给、特殊装备如放大镜/望远镜等）。
- **工具与法器**：17 种工匠工具、6 种专用工具包、4 种游戏套具、10 种乐器、圣徽/德鲁伊法器/奥术法器/材料包。
- **套组**：7 个标准起始套组（窃贼、外交官、地城探险、艺人、探索、祭司、学者），展开为具体物品清单。
- **坐骑与车辆**：驴、骡、马、矮马、战马、货车、四轮马车、鞍具，以及 6 种水上船只。

## 魔法物品范围（DMG 2014 第 7 章）

- 按英文名 A–Z 全量收录，含各稀有度等级的护甲、武器、药水、卷轴、法杖、魔杖、戒指、奇物与诅咒物品。
- 神器（artifact）单独成文件：矮人诸王战斧、崇高之书、邪恶之书、维克纳之眼、维克纳之手、龙族宝珠、卡斯之剑、奥库斯魔杖。
- 魔法物品的随机属性表、诅咒表与"每件神器专属效果"不逐表登记，只记效果摘要与来源入口。
- XGtE 常见魔法物品与 TCoE 刺青、法器、魔法书等既有批次已完成公共字段、细分类别和同调三态迁移；其他扩展来源仍按来源逐书核验，不凭书名生成条目。

## 与代码数据的关系

- 数据实现文件：`equipment-2014.ts`（普通装备）、`magic-items-2014.ts`（手工核验 DMG 条目）、`magic-items-dmg-catalog-2014.ts`（247 条 A–Z/神器目录）、`magic-items-xgte-tcoe-2014.ts`（XGtE/TCoE）、`magic-items-expansions-2014.ts`（ERftLW/EGtW 索引与重印合并）、`equipment-metadata.ts`（迁移辅助）和 `magic-items-2024.ts`（与 2014 仓库隔离）。
- `EquipmentRule` 公共字段包含 `id/name/englishName/ruleset/status/description/classIds/equippable/category/attunement/sourceIds`；魔法物品另含 `rarity/magicItemCategory/attunementCondition/magicBonus`。**暂无价格与重量字段**。
- **登记状态（2026-08-26）**：运行时共 677 条，其中普通装备 222 条、魔法物品 455 条；DMG 来源实体 278 条（259 `selectable`、19 `index-only`），247 条文档候选均能对照到运行时实体；ERftLW 23 条与 EGtW 48 条来源索引已导入。重印内容保持单实体多来源；2024 六条独立数据不装配进 2014 仓库。
- 弹窗候选来源为 `rulesRepository.equipment`，支持稀有度、护甲/药水/戒指/权杖/卷轴/法杖/魔杖/武器/奇物及普通盾牌/工具/杂物、同调和来源多选；未收录条目由“自定义物品”入口兜底。
- 派生说明：装备栏 AC 计算（`app/src/rules/derive.ts`）目前只识别带 `armorBase` 的护甲；泛型魔法护甲（如"护甲 +1"）装备后按基础 10 计算，附着具体护甲后的 AC 增强属后续派生增强点。
