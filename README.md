# D&D 5e 2014 快速车卡辅助

一个移动端优先的 D&D 5e 2014 车卡 Web 应用，通过分步引导、自动计算和规则校验，帮助新玩家快速创建并使用角色卡。

## 当前支持

- D&D 5e 2014 规则集
- 1—20 级单职业角色
- 标准数组、27 点购点和自定义属性
- 职业推荐、种族与背景、升级时间线、装备及法术配置
- 角色数值自动计算与选择合法性校验
- 浏览器本地保存，并支持 PDF、XLSX 与 JSON 导出

当前暂不支持 2024 规则编辑、多职业、云同步和 DM 房规编辑器。

## v0.6.4

- 跑团助手生命值双向钳制：加血超上限自动满血、减血归零；手机端禁用双击缩放（与赛博骰娘一致）
- 弹窗滚动优化：抄录法术书与新增物品弹窗标题/页脚固定，仅内容区滚动


## 快速开始

项目代码位于 `app`，建议使用 Node.js 22 和 pnpm 10。

```sh
cd app
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

测试与构建：

```sh
cd app
pnpm test:run
pnpm build
```

## Docker 部署

复制环境变量示例并启动服务：

```sh
cp .env.example .env
docker compose up -d --build
```

默认访问地址为 `http://localhost:8080`，可通过根目录 `.env` 中的 `APP_PORT` 修改端口。

## 项目文档

- [版本更新日志](CHANGELOG.md)
- [应用开发、配置与部署说明](app/README.md)
- [产品与规则约定](docs/rules.md)
- [前端架构与依赖边界](docs/frontend-architecture.md)
- [快速车卡实现说明](docs/quick-build-implementation.md)

> 本项目不提供或替代 D&D 官方规则书。商业资料仅保留必要索引和原创摘要，具体规则以合法来源及 DM 裁定为准。

## 开源协议

本项目代码以 [MIT 许可证](LICENSE) 开源。规则数据仅收录公开可用的 SRD 与索引信息，不包含商业规则书正文。
