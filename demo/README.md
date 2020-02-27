# SSR Demo

## 结构

```
> tree .
.
├── app.js      # San 入口组件
├── data.json   # 渲染数据
└── server.js   # 服务端渲染入口
```

## 渲染

```bash
npm install
npm run render
```

编译到 render 函数、render 函数把数据渲染为 HTML 的代码都在 server.js 中。
