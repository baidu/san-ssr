从名字即可看出，将组件传入 `compileToRender` 得到 render 函数是一个编译过程，需要一定的编译时间。

这一编译过程只会进行一次，后续渲染可以直接使用 render 函数。但如果对启动时间比较介意，可以在线下对 San 组件进行预编译。

使用 San-SSR 提供的 `compileToSource` 方法可以得到 render 函数的字符串版本：

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
// 得到的是文件内容
const renderStr = project.compileToSource(require.resolve('./app.js'))

fs.writeFileSync(path.resolve(__dirname, 'output.js'), renderStr)


// 在服务器端执行以下代码进行渲染
const render = require('./output.js')
const html = render({name: 'San'})
```

