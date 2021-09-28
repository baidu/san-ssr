# 使用编译产出的组件类存在的问题

在 ssr 过程中，模板可能需要读取组件实例上的属性或方法，因此我们需要在每次渲染时创建组件的一个实例。

当编译输出字符串时，会有以下问题：

- 当输入为 JavaScript 或 TypeScript 时，San-SSR 会将组件类的字符串定义直接输出在产物中，之后在渲染阶段根据这些类创建组件实例。当组件书写方式过于复杂时，解析可能会失败。
- 当输入为 Class 时，San-SSR 会尝试将内存中的类字符串化。该方法只能输出组件自身内容，如果组件类引用了外部变量等，执行阶段会报错。

编译输出为 render 函数时，则可以避免上述问题。

基于以上，San-SSR 提供了在执行阶段手动传入组件 Class 进行渲染的能力，此时编译产物中不会含有组件类代码，San-SSR 的产物与组件代码需要一起上到线上执行。

# 使用方式

## 编译阶段

```typescript
const MyComponent = require('./component')
const sanProject = new SanProject()
const res = sanProject.compileToSource(MyComponent, 'js', {
    useProvidedComponentClass: true
})

fs.writeFileSync(path.resolve(__dirname, './output.js'), res)
```

## 线上执行

只需传入根组件即可

```typescript
const Component = require('./component')
const render = require('./output')

const html = render({}, { ComponentClass: Component })
```

# 与 markExternalComponent 特性配合使用

当与 [markExternalComponent](./使用-markExternalComponent-特性进行编译.md) 配合使用时，由于定义外部组件引用的 specifier 为组件类文件，我们需要使用 [customSSRFilePath](./渲染阶段自定义组件路径.md) 来帮助 San-SSR 找到外部组件所对应的 San-SSR 产物位置：

```javascript
const Component = require('./component')
const render = require('./output')

const html = render({}, {
    ComponentClass: Component,
    parentCtx: {
        context: {
            customSSRFilePath ({ specifier }) {
                if (specifier.endsWith('childA.san')) {
                    return specifier + '.ssr'
                }
            }
        }
    }
})
```

如果我们想要完全改变子组件的路径，则可以再配合 `customComponentFilePath` 方法，替换所使用的子组件类：

```javascript
const Component = require('./component')
const render = require('./output')

const html = render({}, {
    ComponentClass: Component,
    parentCtx: {
        context: {
            customSSRFilePath ({ specifier, id, tagName }) {
                if (specifier.endsWith('childA.san')) {
                    return specifier + '.ssr'
                }
            },
            customComponentFilePath ({ specifier, id, tagName }) {
                if (specifier === './childA.san') {
                    if (tagName === 'x-b') {
                        return path.resolve(__dirname, './childB.san')
                    }
                    return path.resolve(__dirname, './childA.san')
                }
            },
        }
    }
})
```