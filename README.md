# D&D 5e 2014 快速车卡辅助

一个移动端优先的 D&D 5e 2014 车卡 Web 应用，通过分步引导、自动计算和规则校验，帮助新玩家快速创建并使用角色卡。

## 当前支持

- D&D 5e 2014 规则集
- 1—20 级单职业角色
- 标准数组、27 点购点和自定义属性
- 职业推荐、种族与背景、升级时间线、装备及法术配置
- 角色数值自动计算与选择合法性校验
- 浏览器本地保存和角色 JSON 导入、导出

当前暂不支持 2024 规则编辑、多职业、云同步、PDF 导出和 DM 房规编辑器。

## v0.3.0

- 新增赛博骰娘，支持多面骰组合投掷、3D 骰子动画与结果汇总
- 优化骰子渲染、物理效果和移动端交互体验
- 完善奥法骑士的法术位与法术选择规则
- 修复部分种族技能、工具熟练项的选择与校验问题
- 接入可选的站点访问统计

完整版本记录见[更新日志](CHANGELOG.md)。

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
