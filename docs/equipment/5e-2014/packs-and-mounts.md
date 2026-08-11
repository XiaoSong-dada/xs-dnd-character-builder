# 5e-2014 套组、坐骑与车辆

> 来源：2014《玩家手册》（PHB）装备章节 / SRD 5.1。价格为官方表格数据；介绍为原创中文转述。
> 状态：`implemented` = 已进入 `app/src/rules/data/equipment-2014.ts`；`pending` = PHB 有而代码尚未登记。

## 标准起始套组（Packs，7 个）

套组在代码中以 `contents`（EquipmentGrant 列表）登记，领取时展开为具体物品；价格为整套官方价。

| 稳定 ID | 中文名 | 英文名 | 价格 | 内含物品（官方清单） | 状态 |
| --- | --- | --- | --- | --- | --- |
| `equipment-2014-burglar-pack` | 窃贼套组 | Burglar's pack | 16 gp | 背包、滚珠、细绳、铃铛、蜡烛 ×5、撬棍、锤子、岩钉 ×10、附盖提灯、油 ×2、口粮 ×5、火绒盒、水袋、麻绳 | implemented |
| `equipment-2014-diplomat-pack` | 外交官套组 | Diplomat's pack | 39 gp | 箱子、地图/卷轴匣 ×2、华服、墨水、墨水笔、油灯、油 ×2、纸 ×5、香水、封蜡、肥皂 | implemented |
| `equipment-2014-dungeoneer-pack` | 地城探险套组 | Dungeoneer's pack | 12 gp | 背包、撬棍、锤子、岩钉 ×10、火把 ×10、火绒盒、口粮 ×10、水袋、麻绳 | implemented |
| `equipment-2014-entertainer-pack` | 艺人套组 | Entertainer's pack | 40 gp | 背包、铺盖、戏服 ×2、蜡烛 ×5、口粮 ×5、水袋、易容工具 | implemented |
| `equipment-2014-explorer-pack` | 探索套组 | Explorer's pack | 10 gp | 背包、铺盖、餐具组、火绒盒、火把 ×10、口粮 ×10、水袋、麻绳 | implemented |
| `equipment-2014-priest-pack` | 祭司套组 | Priest's pack | 33 gp | 背包、毯子、蜡烛 ×10、火绒盒、布施盒、熏香块 ×2、香炉、法衣、口粮 ×2、水袋 | implemented |
| `equipment-2014-scholar-pack` | 学者套组 | Scholar's pack | 40 gp | 背包、知识书籍、墨水、墨水笔、羊皮纸 ×10、小袋细沙、小刀 | implemented |

## 坐骑与驮畜

| 稳定 ID | 中文名 | 英文名 | 价格 | 重量 | 介绍（原创转述） | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| `equipment-2014-donkey` | 驴 | Donkey | 8 gp | — | 耐劳的驮畜，速度较慢。 | pending |
| `equipment-2014-mule` | 骡子 | Mule | 8 gp | — | 驮运货物的骡子。 | implemented |
| `equipment-2014-pony` | 矮马 | Pony | 30 gp | — | 体型较小的马，适合矮人等地精种族骑乘。 | pending |
| `equipment-2014-riding-horse` | 坐骑用马 | Horse, riding | 75 gp | — | 适合日常骑乘的马。 | pending |
| `equipment-2014-draft-horse` | 挽马 | Horse, draft | 50 gp | — | 拉车负重的强壮马匹。 | pending |
| `equipment-2014-warhorse` | 战马 | Warhorse | 400 gp | — | 训练有素的战斗用马，冲锋践踏。 | pending |

## 鞍具与载具附件

| 稳定 ID | 中文名 | 英文名 | 价格 | 重量 | 介绍（原创转述） | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| `equipment-2014-bit-and-bridle` | 马勒 | Bit and bridle | 2 gp | 1 磅 | 控制坐骑的衔铁与缰绳。 | pending |
| `equipment-2014-riding-saddle` | 骑乘马鞍 | Saddle, riding | 10 gp | 25 磅 | 标准骑乘马鞍。 | pending |
| `equipment-2014-pack-saddle` | 驮鞍 | Saddle, pack | 5 gp | 15 磅 | 固定货物于驮畜背上的鞍具。 | pending |
| `equipment-2014-exotic-saddle` | 异种马鞍 | Saddle, exotic | 60 gp | 40 磅 | 适用于非马坐骑（狮鹫等）的专用鞍具。 | pending |
| `equipment-2014-saddlebags` | 鞍囊 | Saddlebags | 4 gp | 8 磅 | 挂在鞍侧装物的袋子。 | pending |
| `equipment-2014-tack-and-harness` | 挽具 | Tack and harness | 2 gp | 10 磅 | 拖车拉犁用的挽具。 | pending |
| `equipment-2014-feed` | 饲料 | Feed | 5 cp | 10 磅 | 一头驮畜一天的饲料。 | pending |
| `equipment-2014-stabling` | 马厩费（1 天） | Stabling | 5 sp | — | 寄养坐骑一天的厩舍服务费。 | pending |

## 车辆与船只

| 稳定 ID | 中文名 | 英文名 | 价格 | 重量 | 介绍（原创转述） | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| `equipment-2014-cart` | 货车 | Cart | 15 gp | 200 磅 | 由骡子拉动的货车。 | implemented |
| `equipment-2014-wagon` | 四轮马车 | Wagon | 35 gp | 400 磅 | 四轮货运马车，可载大量货物。 | pending |
| `equipment-2014-rowboat` | 划桨船 | Rowboat | 50 gp | 100 磅 | 2–3 人划桨的小船，可载约 4 人。 | pending |
| `equipment-2014-keelboat` | 龙骨船 | Keelboat | 3,000 gp | — | 河运帆船，可载多人并用于巡逻。 | pending |
| `equipment-2014-longship` | 长船 | Longship | 10,000 gp | — | 桨帆并用的北欧式战船，可运载约百人。 | pending |
| `equipment-2014-sailing-ship` | 帆船 | Sailing ship | 10,000 gp | — | 远洋商用帆船，可搭载约 60 人。 | pending |
| `equipment-2014-warship` | 战舰 | Warship | 25,000 gp | — | 配备撞角的武装帆船，船员约百人。 | pending |
| `equipment-2014-galley` | 桨帆船 | Galley | 30,000 gp | — | 大型桨帆战船，可装载火炮与数百人。 | pending |

## 备注

- 坐骑的速度、载重与战斗行为（战马践踏等）属规则层后续批次；本批仅作物品登记。
- 船只价格与载员为官方表格数据；雇佣船员、维护费属 DM 裁定，不在规则数据中。
