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

事实上，San-SSR 支持三种输入，分别为组件类、JavaScript 字符串代码与 TypeScript 字符串代码。

```javascript
const { SanProject } = require('san-ssr')
const san = require('san')
const componentStr = `san.defineComponent({
    template: "<div>Hello {{ name }}</div>"
})`

// SanProject 类提供了你会用到的所有接口
const project = new SanProject()

// 输入是组件对象
// 输出是一个 render 函数。该函数接受数据对象作为参数，返回 HTML 字符串。
const render = project.compileToRenderer(MyComponent)

const html = render({name: 'San'})
```



