# 使用 San-Composition

目前 San-Composition **只支持以组件类作为输入**进行编译。

对于 San-Composition 文档中的例子：

```javascript
const san = require('san')
const {
    defineComponent,
    template,
    data,
    computed,
    filters,
    watch,
    components,
    method,
    onCreated,
    onAttached
} = require('san-composition')

const Component = defineComponent(() => {
    // 定义模板
    template`
        <div>
            <span>count: {{ count }} </span>
            <input type="text" value="{= count =}" />
            <div>double: {{ double }} </div>
            <div>triple: {{ count|triple }} </div>
            <button on-click="increment"> +1 </button>
            <my-child></my-child>
        </div>
    `

    // 初始化数据
    const count = data('count', 1)

    // 添加方法
    method('increment', () => count.set(count.get() + 1))

    // 监听数据变化
    watch('count', newVal => {
        console.log('count updated: ', newVal)
    })

    // 添加计算数据
    computed('double', () => count.get() * 2)

    // 添加过滤器
    filters('triple', n => n * 3)

    // 定义子组件
    components({ 'my-child': defineComponent(() => template('<div>My Child</div>'), san) })

    // 生命周期钩子方法
    onAttached(() => {
        console.log('onAttached')
    })

    onAttached(() => {
        console.log('another onAttached')
    })

    onCreated(() => {
        console.log('onCreated')
    })
}, san)

module.exports = Component
```

## compileToRender

```javascript
const { SanProject } = require('san-ssr')
const san = require('san')

const MyComponent = require('./app.js')

const project = new SanProject()
const render = project.compileToRenderer(MyComponent)
const html = render({name: 'San'})
```

## compileToSource

当 `compileToSource` 时，必须配合[手动传入组件类进行-render](/pages/Guides/use-outside-component.html)特性来使用。

编译阶段：
```javascript
// compile
const { SanProject } = require('san-ssr')
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
const MyComponent = require('./app')
const render = require('./output')
const html = render({name: 'San'}, {
    ComponentClass: MyComponent
})
```

