# D&D 快速车卡 Web 应用

程序部分使用 Vue 3、TypeScript、Vite、Vue Router 和 Pinia。项目保留 `js-cookie`，供后续确有 Cookie 状态需求时使用。

```sh
pnpm install
pnpm dev
pnpm build
```

## SPA History 部署要求

项目使用 Vue Router 的 HTML5 History 模式。部署服务器必须把找不到的前端路径回退到应用的 `index.html`，再交由 Vue Router 匹配。

以下地址应在直接访问或刷新时返回同一个应用入口，而不是由服务器返回 404：

```text
/character-builder
/classes
/dice
/profile
/:pathMatch(.*)*
```

静态资源文件仍应按真实文件处理；只有不对应真实文件的前端页面路径需要回退。
