# 5e-2014 武器

> 来源：2014《玩家手册》（PHB）装备章节 / SRD 5.1 开放规则。价格与重量为官方表格数据；介绍为原创中文转述。
> 全部 37 种武器已在 `app/src/rules/data/equipment-2014.ts` 登记（状态 `implemented`），`damageDice`/`damageType` 已入代码。

## 简单近战武器

| 稳定 ID | 中文名 | 英文名 | 价格 | 重量 | 伤害骰 | 伤害类型 | 特性（原创转述） | 介绍（原创转述） |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `equipment-2014-club` | 木棒 | Club | 1 sp | 2 磅 | 1d4 | 钝击 | 轻 | 随手可得的粗木棍。 |
| `equipment-2014-dagger` | 匕首 | Dagger | 2 gp | 1 磅 | 1d4 | 穿刺 | 灵巧、轻、投掷 6/18 米 | 双刃短刃，便于隐藏与近身搏斗。 |
| `equipment-2014-greatclub` | 巨棒 | Greatclub | 2 sp | 10 磅 | 1d8 | 钝击 | 双手 | 粗大的实心木棒，需双手抡动。 |
| `equipment-2014-handaxe` | 手斧 | Handaxe | 5 gp | 2 磅 | 1d6 | 挥砍 | 轻、投掷 6/18 米 | 单手短柄斧，可投掷。 |
| `equipment-2014-javelin` | 标枪 | Javelin | 5 sp | 2 磅 | 1d6 | 穿刺 | 投掷 9/36 米 | 细长投掷矛。 |
| `equipment-2014-light-hammer` | 轻锤 | Light hammer | 2 gp | 2 磅 | 1d4 | 钝击 | 轻、投掷 6/18 米 | 单手小锤，可投掷。 |
| `equipment-2014-mace` | 硬头锤 | Mace | 5 gp | 4 磅 | 1d6 | 钝击 | — | 金属锤头装于短柄，破甲利器。 |
| `equipment-2014-quarterstaff` | 长棍 | Quarterstaff | 2 sp | 4 磅 | 1d6 | 钝击 | 多用 1d8（双手） | 约 2 米长的木棍，游侠与法师常用。 |
| `equipment-2014-sickle` | 镰刀 | Sickle | 1 gp | 2 磅 | 1d4 | 挥砍 | 轻 | 弧形刀刃的农具改造成武器。 |
| `equipment-2014-spear` | 矛 | Spear | 1 gp | 3 磅 | 1d6 | 穿刺 | 投掷 6/18 米、多用 1d8（双手） | 尖头长杆，可单手或双手使用。 |

## 简单远程武器

| 稳定 ID | 中文名 | 英文名 | 价格 | 重量 | 伤害骰 | 伤害类型 | 特性（原创转述） | 介绍（原创转述） |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `equipment-2014-light-crossbow` | 轻弩 | Light crossbow | 25 gp | 5 磅 | 1d8 | 穿刺 | 弹药 24/96 米、装填、双手 | 结构简单、易于上弦的弩。 |
| `equipment-2014-dart` | 飞镖 | Dart | 5 cp | 1/4 磅 | 1d4 | 穿刺 | 灵巧、投掷 6/18 米 | 小型投掷镖。 |
| `equipment-2014-shortbow` | 短弓 | Shortbow | 25 gp | 2 磅 | 1d6 | 穿刺 | 弹药 24/96 米、双手 | 体型小巧的弓，射程适中。 |
| `equipment-2014-sling` | 投石索 | Sling | 1 sp | — | 1d4 | 钝击 | 弹药 9/36 米 | 皮带兜石抛射，成本极低。 |

## 军用近战武器

| 稳定 ID | 中文名 | 英文名 | 价格 | 重量 | 伤害骰 | 伤害类型 | 特性（原创转述） | 介绍（原创转述） |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `equipment-2014-battleaxe` | 战斧 | Battleaxe | 10 gp | 4 磅 | 1d8 | 挥砍 | 多用 1d10（双手） | 宽刃战斧，单手双手皆宜。 |
| `equipment-2014-flail` | 连枷 | Flail | 10 gp | 2 磅 | 1d8 | 钝击 | — | 链连锤头，可绕过盾牌格挡。 |
| `equipment-2014-glaive` | 长柄刀 | Glaive | 20 gp | 6 磅 | 1d10 | 挥砍 | 重、触及 3 米、双手 | 长柄单刃刀，拉开距离作战。 |
| `equipment-2014-greataxe` | 巨斧 | Greataxe | 30 gp | 7 磅 | 1d12 | 挥砍 | 重、双手 | 双手巨斧，劈砍威力大。 |
| `equipment-2014-greatsword` | 巨剑 | Greatsword | 50 gp | 6 磅 | 2d6 | 挥砍 | 重、双手 | 双手大剑，可横扫敌群。 |
| `equipment-2014-halberd` | 戟 | Halberd | 20 gp | 6 磅 | 1d10 | 挥砍 | 重、触及 3 米、双手 | 长柄顶端集矛头与斧刃。 |
| `equipment-2014-lance` | 骑枪 | Lance | 10 gp | 6 磅 | 1d12 | 穿刺 | 触及 3 米；骑乘时对 1.5 米内目标攻击劣势 | 骑兵长枪，骑乘冲撞威力极大。 |
| `equipment-2014-longsword` | 长剑 | Longsword | 15 gp | 3 磅 | 1d8 | 挥砍 | 多用 1d10（双手） | 最经典的直刃剑。 |
| `equipment-2014-maul` | 巨锤 | Maul | 10 gp | 10 磅 | 2d6 | 钝击 | 重、双手 | 双手大锤，砸击破坏力强。 |
| `equipment-2014-morningstar` | 晨星 | Morningstar | 15 gp | 4 磅 | 1d8 | 穿刺 | — | 锤柄顶端带刺钉球。 |
| `equipment-2014-pike` | 长矛 | Pike | 5 gp | 18 磅 | 1d10 | 穿刺 | 重、触及 3 米、双手 | 极长的枪杆，步兵方阵主力。 |
| `equipment-2014-rapier` | 刺剑 | Rapier | 25 gp | 2 磅 | 1d8 | 穿刺 | 灵巧 | 细长刺击剑，讲究技巧。 |
| `equipment-2014-scimitar` | 弯刀 | Scimitar | 25 gp | 3 磅 | 1d6 | 挥砍 | 灵巧、轻 | 弧形单刃刀。 |
| `equipment-2014-shortsword` | 短剑 | Shortsword | 10 gp | 2 磅 | 1d6 | 穿刺 | 灵巧、轻 | 短刃剑，双持常用。 |
| `equipment-2014-trident` | 三叉戟 | Trident | 5 gp | 4 磅 | 1d6 | 穿刺 | 投掷 6/18 米、多用 1d8（双手） | 三叉鱼叉状武器。 |
| `equipment-2014-war-pick` | 战镐 | War pick | 5 gp | 2 磅 | 1d8 | 穿刺 | — | 镐头武器，可凿穿护甲。 |
| `equipment-2014-warhammer` | 战锤 | Warhammer | 15 gp | 2 磅 | 1d8 | 钝击 | 多用 1d10（双手） | 锤头战锤，单手双手皆宜。 |
| `equipment-2014-whip` | 鞭 | Whip | 2 gp | 3 磅 | 1d4 | 挥砍 | 灵巧、触及 3 米 | 皮革长鞭，攻击距离远。 |

## 军用远程武器

| 稳定 ID | 中文名 | 英文名 | 价格 | 重量 | 伤害骰 | 伤害类型 | 特性（原创转述） | 介绍（原创转述） |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `equipment-2014-blowgun` | 吹箭筒 | Blowgun | 10 gp | 1 磅 | 1 | 穿刺 | 弹药 7.5/30 米、装填 | 细管吹射毒针，便于隐匿。 |
| `equipment-2014-hand-crossbow` | 手弩 | Hand crossbow | 75 gp | 3 磅 | 1d6 | 穿刺 | 弹药 9/36 米、轻、装填 | 单手小型弩。 |
| `equipment-2014-heavy-crossbow` | 重弩 | Heavy crossbow | 50 gp | 18 磅 | 1d10 | 穿刺 | 弹药 30/120 米、重、装填、双手 | 威力大的重型弩，装填缓慢。 |
| `equipment-2014-longbow` | 长弓 | Longbow | 50 gp | 2 磅 | 1d8 | 穿刺 | 弹药 45/180 米、重、双手 | 接近身高的长弓，射程远。 |
| `equipment-2014-net` | 网 | Net | 1 gp | 3 磅 | — | — | 投掷 1.5/4.5 米；命中使目标束缚（无伤害） | 投掷网困住敌人。 |

## 备注

- 弹药消耗规则（箭、弩矢、吹箭针按使用扣减）与武器的"熟练"判定（简单/军用 × 近战/远程）属规则层校验，当前项目未实现，列为后续批次。
- 武器特性（灵巧、轻、双手、重、投掷、弹药、触及、多用）目前记录在 `description` 文本，未结构化为字段。
