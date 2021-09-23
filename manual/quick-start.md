[SanProject 类][sanproject] 提供了你会用到的所有接口：

* 输入是组件对象。
* 输出是一个 render 函数。该函数接受数据对象作为参数，返回 HTML 字符串。

```javascript
const { SanProject } = require('san-ssr')
const app = require('src/component.js')

const project = new SanProject()
const render = project.compileToRenderer(app)

console.log(render({name: 'harttle'}))
```

详细请参考 API 文档：[SanProject][sanproject]，或 /demo 下的示例项目。

[sanproject]: https://baidu.github.io/san-ssr/classes/_src_models_san_project_.sanproject.html
