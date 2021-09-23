本文档介绍对于已经在使用 san 进行 ssr 的代码，如何迁移到 san-ssr。
ssr 接口也是兼容 san 的，所以理论上 san 组件代码不需要迁移，编译代码则需要少量工作

1. 最新的 san-ssr 只能在 san@3.8.0 及以上进行工作，建议先把 san 升至最新版本。如果要在其他版本上使用，请参考 [README](https://github.com/searchfe/san-ssr/blob/master/README.md) 中的“安装”一节。
2. 编译组件代码到 ssr 代码的地方，把 `require('san')` 改为 `require('san-ssr')`，`compileToSource` 和 `compileToRenderer` 是兼容于 san 的。

至此项目应该已经可以跑起来了。要发挥 san-ssr 的最大潜力，后续可以做以下改动：

1. 迁移 `compileToSource` 和 `compileToRenderer` 到 [SanProject][SanProject] 对象。它有更丰富的 API，有更多的参数和方法。
2. 迁移 San 组件代码到 TypeScript，这样 san-ssr 可以正确地找到依赖并一同打包它们。

[SanProject]: https://searchfe.github.io/san-ssr/classes/_models_san_project_.sanproject.html