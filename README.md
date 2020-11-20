# San SSR
[![npm version](https://img.shields.io/npm/v/san-ssr.svg)](https://www.npmjs.org/package/san-ssr)
[![downloads](https://img.shields.io/npm/dm/san-ssr.svg)](https://www.npmjs.org/package/san-ssr)
[![Build Status](https://github.com/baidu/san-ssr/workflows/check.yml/badge.svg)](https://github.com/baidu/san-ssr/actions?query=workflow:Check)
[![Coveralls](https://img.shields.io/coveralls/baidu/san-ssr.svg)](https://coveralls.io/github/baidu/san-ssr?branch=master)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/baidu/san-ssr)
[![GitHub issues](https://img.shields.io/github/issues-closed/baidu/san-ssr.svg)](https://github.com/baidu/san-ssr/issues)
[![David](https://img.shields.io/david/baidu/san-ssr.svg)](https://david-dm.org/baidu/san-ssr)
[![David Dev](https://img.shields.io/david/dev/baidu/san-ssr.svg)](https://david-dm.org/baidu/san-ssr?type=dev)
[![DUB license](https://img.shields.io/dub/l/vibe-d.svg)](https://github.com/baidu/san-ssr/blob/master/LICENSE)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#commits)

本仓库的 **目的** 是为 [san][san]  提供一个 SSR 代码框架和工具，以及内置了 JavaScript 的代码生成。

* [English](https://github.com/baidu/san-ssr/blob/master/README.en.md)
* SSR 代码迁移：[从 san 到 san-ssr](https://github.com/baidu/san-ssr/wiki/%E4%BB%8E-san-%E8%BF%81%E7%A7%BB%E5%88%B0-san-ssr)
* Demo：[demo/](https://github.com/baidu/san-ssr/tree/master/demo)

## 安装

```bash
npm i san@latest san-ssr@latest
```

san-ssr 需要 san 提供的模板字符串解析和 TypeScript 类型，因此对 san 的版本有依赖。你需要安装对应版本的 san 和 san-ssr。
san-ssr 支持的 san 版本声明在 `peerDependencies` 里，因此只要能安装成功就能正确工作。一般的建议如下：

* 如果是新项目，建议使用 `npm i san@latest san-ssr@latest`
* 否则从 san-ssr 最新版本开始降主版本号找到能安装成功的版本。

更多讨论请参考：[baidu/san/issues/441](https://github.com/baidu/san/issues/441#issuecomment-550260372)

## 使用

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

## 其他目标平台

san-ssr 提供了 San 组件的静态分析，提供了项目文件集合和 San 组件树，以及二者的对应关系。
具体的代码生成抽象为 [Compiler 接口][compiler]，目前有 JS 和 PHP 两个实现，其中 san-ssr-target-js 内置在本仓库中：

* [san-ssr-target-js](https://github.com/baidu/san-ssr/tree/master/src/target-js)
* [san-ssr-target-php](https://github.com/searchfe/san-ssr-target-php)

CLI 参数 `--target` 参数用来选择目标代码，默认为 `js`：

```bash
san-ssr --target js ./component.js > ssr.js
```

编程接口也可以通过 `SanProject#compile()` 的第二个参数来指定目标，第三个参数来指定传给 Compiler 实现的参数：

```typescript
import { Target, SanProject } from 'san-ssr'
import { writeFileSync } from 'fs'

const project = new SanProject()
const targetCode = project.compile('src/component.ts', Target.PHP, { emitHeader: true })

writeFileSync('ssr.php', targetCode)
```

指定非 `js` 的目标时，san-ssr 会从 CWD 开始寻找 `san-ssr-target-${target}` 的包，因此需要作为 san-ssr 的 peer 来安装。例如：

```bash
npm i san-ssr san-ssr-target-php
```

## 已知问题

- script 元素内容不可在组件间传递。即 script 内不可引用组件，也不可包含 slot。

## 贡献指南

### 开发起步

欢迎任何类型的 Issue、完整的 Pull Request、或者不完整的 Pull Request。可以按照下面的步骤开始开发：

1. 克隆本仓库并 `npm install`
2. 在 [san-html-cases][san-html-cases] 下添加你的测试样例，以 node_modules/san-html-cases/src/array-literal 为例
3. 通过 `./bin/debug array-literal` 来查看 SSR 结果。输出包括：
    1. 预期输出。即 node_modules/san-html-cases/src/array-literal/expected.html 的内容。
    2. 从 JavaScript 组件代码编译到 render 代码并渲染得到的内容。
    3. 从 TypeScript 组件代码编译到 render 代码并渲染得到的内容。
    4. 从组件 Class 编译到 render 代码并渲染得到的内容。
    5. 从组件 Class 编译到 render 函数并渲染得到的内容。
4. 如果 debug 符合预期，可以运行 `npm run e2e` 来查看其它样例是否仍然正常。
5. 如果一切正常，运行 `npm run check` 来做最后的编码风格检查，和完整的测试。
6. 如果能够通过那么 CI 就应该能通过，请发 PR 到本仓库。

### debug 进阶

准备步骤：

1. 添加 `export PATH=$PATH:./bin` 到你的 Shell 配置里。
2. 让你的 zsh 进入项目目录后自动 `source ./bin/auto-complete`（如果你想自动补全 case 名字的话）。可以自定义 chpwd() 方法来实现。

debug 命令：

- `debug array-literal` 来执行这个 case 的所有编译方式：
    1. 从 component.js 编译到 ssr.js 并执行 SSR 和 assert 结果
    2. 从 component.ts 编译到 ssr.js 并执行 SSR 和 assert 结果
    3. 从 component.js 编译到 render 函数并 SSR 和 assert 结果
- `render-by-source.js array-literal` 来跳过编译，直接执行 ssr.js 并 assert 结果。用于手改 ssr.js 调试。
- `render-onthefly.js array-literal` 来把这个 case 编译到 render 函数并 SSR 和 assert 结果。

注意：

- 如果没能把 ./bin 添加到 PATH，则执行命令需要全路径，例如：`./bin/debug array-literal`
- 如果没能执行 ./bin/auto-complete，则没法 Tab 自动补全 array-literal

[san]: https://github.com/baidu/san
[sanproject]: https://baidu.github.io/san-ssr/classes/_models_san_project_.sanproject.html
[target-compile]: https://baidu.github.io/san-ssr/interfaces/_models_compiler_.compiler.html#compile
[compiler]: https://github.com/baidu/san-ssr/blob/809fc8eb710253f6e5aa3bd1afc0b7f615ef572e/src/models/compiler.ts#L3
[san-html-cases]: https://github.com/ecomfe/san-html-cases