# 快速开始

## 安装


```bash
npm i san@latest san-ssr@latest
```


san-ssr 需要 san 提供的模板字符串解析和 TypeScript 类型，因此对 san 的版本有依赖。你需要安装对应版本的 san 和 san-ssr。

san-ssr 支持的 san 版本声明在 `peerDependencies` 里，因此只要能安装成功就能正确工作。一般的建议如下：

- 如果是新项目，建议使用 `npm i san@latest san-ssr@latest`

- 否则从 san-ssr 最新版本开始降主版本号找到能安装成功的版本。

> 更多讨论请参考：[baidu/san/issues/441](https://github.com/baidu/san/issues/441#issuecomment-550260372)

## 渲染一个 San 组件

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



参考内容：

- API 文档：[SanProject][sanproject]
- /demo 下的示例项目。


[sanproject]: https://baidu.github.io/san-ssr/classes/_src_models_san_project_.sanproject.html
