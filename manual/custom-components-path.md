有时我们希望在线上执行阶段使用不同的组件。例如有两个版本的组件库，希望通过抽样变量决定使用其中的某个版本。

San-SSR 提供了 `customSSRFilePath` API 来支持上述场景。

# 编译阶段

1. 输入为代码字符串

    此时不需要其他额外操作。

2. 输入为组件 Class

    由于我们需要提前 require 组件代码得到 Class， 之后传入 San-SSR 进行编译，因此需要使用 [markExternalComponent](./使用-markExternalComponent-特性进行编译.md) 特性提前标记出外部组件。

# 运行阶段

在调用 render 函数进行渲染时，传入 `customSSRFilePath`：

```javascript
const render = require('./output')

const html = render({}, {
    parentCtx: {
        context: {
            customSSRFilePath ({ specifier, id, tagName }) {
                if (specifier.endsWith('childA.san')) {
                    return specifier.replace('childA', 'childB')
                }
            }
        }
    }
})
```