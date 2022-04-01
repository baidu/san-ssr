# 支持的三种输入方式及区别

在之前的示例中，传入 `SanProject` 的内容为组件类：

```javascript
const { SanProject } = require('san-ssr')
const san = require('san')
const MyComponent = san.defineComponent({
    template: `<div>Hello {{ name }}</div>`
})

// SanProject 类提供了你会用到的所有接口
const project = new SanProject()

// 输入是组件对象
// 输出是一个 render 函数。该函数接受数据对象作为参数，返回 HTML 字符串。
const render = project.compileToRenderer(MyComponent)

const html = render({name: 'San'})
```

事实上，San-SSR 支持三种输入，分别为组件类、JavaScript 文件路径与 TypeScript 文件路径：

```javascript
// app.js
const san = require('san')
let MyComponent = san.defineComponent({
    template: "<div>Hello {{ name }}</div>"
})
exports = module.exports = MyComponent
```

```javascript
// index.js
const { SanProject } = require('san-ssr')
const fs = require('fs')
const path = require('path')

const project = new SanProject()

// 此时传入的是一个文件路径
// 得到的是 render 函数文件内容
const renderStr = project.compileToSource(require.resolve('./app.js'))
// const renderStr = project.compileToSource(require.resolve('./app.ts'))

fs.writeFileSync(path.resolve(__dirname, 'output.js'), renderStr)


// 在服务器端执行以下代码进行渲染
const render = require('./output.js')
const html = render({name: 'San'})
```

## compileToRender 与 compileToSource

- compileToRender 只支持输入组件类。
- compileToSource 支持输入组件类、JavaScript 文件路径以及 TypeScript 文件路径。

## 区别

根据不同的输入，San-SSR 的行为是不同的。

### 输入为组件类时

此时 San-SSR 接收到的是已经在内存中的类，组件的 template、components 等信息可以直接在类上通过属性读取。

优点：

- 可以通过递归的方式遍历整个组件树。
- 获取到的是代码执行后的结果，San-SSR 对于组件的写法是无感的。

缺点：

- San-SSR 并不知道当前类及其子组件所对应的文件信息，也就是“不知道这些组件类是从哪里来的”。
- 当使用 compileToSource 时，San-SSR 需要尝试将内存中的类转换为字符串定义，有一定局限性。
- 由于需要将组件加载到内存中，因此可能在线下编译阶段执行组件代码，其依赖必须完备（仅仅是为了 require 不报错）。

### 输入为文件路径时

此时 San-SSR 会尝试读取文件内容，其输入是组件文件的字符串，组件的 template、components 等信息需要通过静态分析的方式获取哦。

优点：

- San-SSR 知道组件的明确路径。
- San-SSR 知道组件定义文件内容。
- 可以单文件编译，不需要加载完整的组件树。

缺点：

- 组件写法需要相对固定，过于复杂时，无法通过静态分析获取到 template、components 等信息。
