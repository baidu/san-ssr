目前 San-SSR **只支持以组件类作为输入**进行编译。

假设有以下组件：

```javascript
// app.js
const { connect } = require('san-store')
const san = require('san')

const MyComponent = connect.san({
    'name': 'text'
})(san.defineComponent({
    template: "<div>{{ name }}</div>"
}))

module.exports = MyComponent
```

# compileToRender

```javascript
const { SanProject } = require('san-ssr')
const { connect, store } = require('san-store')
const san = require('san')

const MyComponent = require('./app.js')

store.raw = {text: 'san'}

const project = new SanProject()
const render = project.compileToRenderer(MyComponent)
const html = render({name: 'San'})
```

# compileToSource

当 `compileToSource` 时，必须配合[手动传入组件类进行-render](/pages/Guides/use-outside-component.html)特性来使用。

编译阶段：
```javascript
// compile
const { SanProject } = require('san-ssr')
const { store } = require('san-store')
const fs = require('fs')
const path = require('path')

const MyComponent = require('./app')
const project = new SanProject()
const renderStr = project.compileToSource(MyComponent, 'js', {
    useProvidedComponentClass: true
})
fs.writeFileSync(path.resolve(__dirname, './output.js'), renderStr)
```

渲染阶段：
```javascript
// render
const { store } = require('san-store')

const MyComponent = require('./app')
const render = require('./output')
store.raw = {text: 'san'}
const html = render({name: 'San'}, {
    ComponentClass: MyComponent
})
```

