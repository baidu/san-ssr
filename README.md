# San SSR
[![npm version](https://img.shields.io/npm/v/san-ssr.svg)](https://www.npmjs.org/package/san-ssr)
[![downloads](https://img.shields.io/npm/dm/san-ssr.svg)](https://www.npmjs.org/package/san-ssr)
[![Build Status](https://travis-ci.org/baidu/san-ssr.svg?branch=master)](https://travis-ci.org/baidu/san-ssr)
[![Coveralls](https://img.shields.io/coveralls/baidu/san-ssr.svg)](https://coveralls.io/github/baidu/san-ssr?branch=master)
[![dependencies](https://img.shields.io/david/baidu/san-ssr.svg)](https://david-dm.org/baidu/san-ssr)
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

## 命令行工具

san-ssr 提供了命令行工具来编译 san 组件到 SSR 代码。

```none
> san-ssr
san-ssr -o <OUT_FILE> [OPTION]... <FILE>

Options:
  --help                Show help                                           [boolean]
  --version             Show version number                                 [boolean]
  --output, -o          output file path, output to STDOUT if not specified
  --target, -t          target SSR file                                     [string]
  --targetOptions, -j   options for target compiler in JSON format          [string]
  --tsconfig, -c        tsconfig path, will auto resolve if not specified
```

输入文件需要把 ComponentClass 作为默认导出。对于

* TypeScript 是 `export default ComponentClass`
* CommonJS 是 `exports = module.exports = ComponentClass`

把 component.js 编译到 ssr.js：

```bash
san-ssr ./component.js > ssr.js
```

## 编程接口

[SanProject 类][sanproject] 提供了你会用到的所有接口：

* 输入可以是组件对象，也可以是组件文件，这个文件可以是 JavaScript 文件，也可以是 TypeScript 文件。
* 输出可以是 CommonJS 代码，也可以一个 render 函数。

TypeScript 编写的 San 组件:

```typescript
import { SanProject } from 'san-ssr'
import { writeFileSync } from 'fs'

const project = new SanProject()
const targetCode = project.compile('src/component.ts')

writeFileSync('ssr.js', targetCode)
```

JavaScript 编写的 San 组件:

```javascript
const { SanProject } = require('san-ssr')
import { writeFileSync } from 'fs'

const project = new SanProject()
const targetCode = project.compile('src/component.js')

writeFileSync('ssr.js', targetCode)
```

输出到 render 函数：

```typescript
import { SanProject } from 'san-ssr'
import { writeFileSync } from 'fs'

const project = new SanProject()
const render = project.compileToRenderer('src/component.ts')

console.log(render({name: 'harttle'}))
```

Compile 还支持目标平台、编译参数，详细请参考 API 文档：[SanProject#compile(filepath, target, options)][compile]。

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

[san]: https://github.com/baidu/san
[sanproject]: https://baidu.github.io/san-ssr/classes/_models_san_project_.sanproject.html
[compile]: https://baidu.github.io/san-ssr/classes/_models_san_project_.sanproject.html#compile
[target-compile]: https://baidu.github.io/san-ssr/interfaces/_models_compiler_.compiler.html#compile
[compiler]: https://github.com/baidu/san-ssr/blob/809fc8eb710253f6e5aa3bd1afc0b7f615ef572e/src/models/compiler.ts#L3