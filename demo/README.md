# SSR Demo

## 安装

```bash
npm install
```

## 生成 SSR

生成 JavaScript 版本的 SSR 文件(`dist/index.js`):

```bash
# 用 san-ssr CLI 构建
npm run cli-build
# 用 san-ssr 编程接口构建，传入 TypeScript 文件
npm run ts-build
# 用 san-ssr 编程接口构建，传入组件对象
npm run cpnt-build
```

## 渲染

把 `data.json` 解析出来传给上面生成的 `ssr.js`，得到 HTML 输出:

```bash
npm run render
```
