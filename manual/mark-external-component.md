
**该特性目前为试验功能，未正式发版**

***


# San-SSR 输入的三种类型

目前 San-SSR 在进行编译时，输入的类型有三种，分别为：

1. Class

```javascript
const {compileToSource} = require('san-ssr')
const MyComponent = require('path/to/mycomponent')
compileToSource(MyCompoent)
```

2. JavaScript string

```javascript
const {compileToSource} = require('san-ssr')
const fs = require('fs')
const MyComponentStr = fs.readFileSync('path/to/mycomponent.js', 'utf-8')
compileToSource(MyCompoentStr)
```

3. TypeScript string

```javascript
const {compileToSource} = require('san-ssr')
const fs = require('fs')
const MyComponentStr = fs.readFileSync('path/to/mycomponent.ts', 'utf-8')
compileToSource(MyCompoentStr)
```

由于输入 JavaScript 或 TypeScript 源码的形式，需要对输入字符串进行静态分析，因此不适合组件写法过于灵活过的情况。而以 Class 形式作为输入则可以解决上述问题。

# Class 作为输入存在的问题

当使用 Class 作为输入时，我们需要在编译阶段直接 require 该组件，因此所有依赖（子组件、工具库等）此时都需要是可被引用到的。

由于我们的组件可能分布于多个代码库，因此大多数情况下只能在生产环境中进行组件的编译工作。markExternalComponet 的引入就是为了解决该问题。

基于 San-SSR 最新提供的 markExternalComponet 特性，我们可以在本地进行组件的编译工作。

# 快速上手

## markExternalComponent

新版本的 San-SSR 中，提供了一个 `markExternalComponent` 函数，使用该函数，可以提前标记外部组件。

假设我们有这样一个组件：

```javascript
const san = require('san')
const Child = require('./childA.san')

const MyComponent = san.defineComponent({
    components: {
        'x-l': Child
    },
    template: '<div><x-l/></div>'
})

module.exports = MyComponent
```

其中 childA 组件不在当前代码库中，它可能是一个单独维护的组件库等。此时我们可以在引用该组件类进行编译之前，对 `childA` 进行标记：

```javascript
markExternalComponent({
    isExternalComponent (specifier) {
        if (specifier === './childA.san') {
            return true
        }
        return false
    }
})
const {compileToSource} = require('san-ssr')
const MyComponent = require('path/to/mycomponent')
compileToSource(MyCompoent)
```

进行标记后，当我们 require `MyComponent` 时，将不会去加载 `childA`，我们可以在生产环境中单独提供 `childA`。

## 组件 id

当我们从文件中引用一个组件时，需要两个信息来定位一个组件：

1. `specifier`：表示组件所在文件的路径，运行时会使用 `require(specifier)` 来加载该文件。因此它可以是一个相对路径、绝对路径或一个包名称。
2. `id`：表示某个文件中的组件 id。

例如：

```javascript
// specifier 为 './childA.san'，id 为 ‘default’
const Child = require('./childA.san')
```

```javascript
// specifier 为 'some-ui-module'，id 为 'compA' 和 'compB'
const { compA, compB } = require('some-ui-module')
```

当我们使用 `markExternalComponent` 时，**需要手动对子组件的 id 进行标记**，否则 san-ssr 会默认以递增数字的形式对 id 进行命名。

例如：

```javascript
const san = require('san')

const OtherComponent = san.defineComponent({
    id: 'default', // id 标记
    template: '<div></div>'
})

module.exports = OtherComponent
```

```javascript
const san = require('san')

const ComponentA = san.defineComponent({
    id: 'ComponentA', // id 标记
    template: '<div></div>'
})
const ComponentB = san.defineComponent({
    id: 'ComponentB', // id 标记
    template: '<div></div>'
})

module.exports = {
    ComponentA,
    ComponentB
}
```

# 实现原理

调用 `markExternalComponent` 时，San-SSR 会对 Node.js 中的 require 进行 hook，拦截子组件的加载。判断为子组件的 require 调用，San-SSR 会返回一个组件引用信息（specifier 和 id）。编译期间遇到组件引用信息，则会编译为外部组件的调用。

# 注意事项

require 的 hook 使用的是类似 [require-in-the-middle](https://www.npmjs.com/package/require-in-the-middle) 的方式，与 [jest](https://www.npmjs.com/package/jest) 不兼容。

