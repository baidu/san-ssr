# SSR Demo

## Install

```
npm install
```

## Generage ssr.js

Generate ssr file in JavaScript (`dist/index.js`):

```bash
# 用 san-ssr CLI 构建
npm run cli-build
# 用 san-ssr 编程接口构建，传入 TypeScript 文件
npm run ts-build
# 用 san-ssr 编程接口构建，传入组件对象
npm run cpnt-build
```

## Render

Pass `data.json` to `ssr.js`:

```bash
npm run render
```
