# San SSR
[![npm version](https://img.shields.io/npm/v/san-ssr.svg)](https://www.npmjs.org/package/san-ssr)
[![downloads](https://img.shields.io/npm/dm/san-ssr.svg)](https://www.npmjs.org/package/san-ssr)
[![Build Status](https://travis-ci.com/searchfe/san-ssr.svg?branch=master)](https://travis-ci.com/searchfe/san-ssr)
[![Coveralls](https://img.shields.io/coveralls/searchfe/san-ssr.svg)](https://coveralls.io/github/searchfe/san-ssr?branch=master)
[![dependencies](https://img.shields.io/david/searchfe/san-ssr.svg)](https://david-dm.org/searchfe/san-ssr)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/searchfe/san-ssr)
[![GitHub issues](https://img.shields.io/github/issues-closed/searchfe/san-ssr.svg)](https://github.com/searchfe/san-ssr/issues)
[![David](https://img.shields.io/david/searchfe/san-ssr.svg)](https://david-dm.org/searchfe/san-ssr)
[![David Dev](https://img.shields.io/david/dev/searchfe/san-ssr.svg)](https://david-dm.org/searchfe/san-ssr?type=dev)
[![DUB license](https://img.shields.io/dub/l/vibe-d.svg)](https://github.com/searchfe/san-ssr/blob/master/LICENSE)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#commits)

**The purpurse of this repo** is to provide an SSR framework and utils for the [san][san] components.

## Target

san-ssr provides static analysis for San components and generates abstract component tree, while code generation is a separated process, which is provided by specific implementations:

* [san-ssr-target-js][san-ssr-target-js]
* [san-ssr-target-php][san-ssr-target-php]

## CLI Usage

Command line interface:

```none
> san-ssr
san-ssr -o <OUT_FILE> [OPTION]... <FILE>

Options:
  --help          Show help                                            [boolean]
  --version       Show version number                                  [boolean]
  --output, -o    output file path, output to STDOUT if not specified
  --target, -t    target SSR file              [required] [choices: "php", "js"]
  --prefix, -p    namespace prefix for ssr.php                 [default: "san\"]
  --tsconfig, -c  tsconfig path, will auto resolve if not specified
```

san-ssr will lookup `san-ssr-target-{target}` from node_modules to generate target code. The san-ssr-target-js package is installed as a dependency of san-ssr by default.

```bash
# build to ssr.php
san-ssr --target php --prefix 'demo\\' ./component.ts > ssr.php

# build to ssr.js
san-ssr --target js  ./component.ts > ssr.js
```

## Programmatic Interface

To PHP programmatic inteface ([typedoc: ToPHPCompiler](https://harttle.github.io/san-ssr/classes/_compilers_to_php_compiler_.tophpcompiler.html)):

```javascript
const { ToPHPCompiler } = require('san-ssr')
const { writeFileSync } = require('fs')

const compiler = new ToPHPCompiler()
const targetCode = compiler.compile('./component.ts')

writeFileSync('ssr.php', targetCode)
```

To JavaScript programmatic inteface ([typedoc: ToJSCompiler](https://harttle.github.io/san-ssr/classes/_compilers_to_js_compiler_.tojscompiler.html)):

```javascript
const { ToJSCompiler } = require('san-ssr')
const { writeFileSync } = require('fs')

const compiler = new ToJSCompiler()
const targetCode = compiler.compile('./component.ts', {emitHeader: true})

writeFileSync('ssr.js', targetCode)
```

## Milestones

0. Baseline Establishment
    - [x] create a simplified JS SSR for reference
    - [x] migrate all SSR cases from baidu/san
    - [x] migrate all e2e cases from baidu/san
1. Basic Templating
    - [x] implement runtime utils in PHP
    - [x] introduce emitter and apply to php-ssr
    - [x] beautify the output
    - [x] pass all template-only test cases
    - [x] debug scripts and Zsh auto completion
    - [ ] CLI support
    - [ ] travis CI
    - [ ] semantic release
2. Bussiness Logic to PHP
    - [x] compile source files to php: make use of ts2php
    - [x] compile component files to php
    - [x] parse files to AST to bind sourcecode info to runtime
    - [x] wireup ssr.php and component.php
    - [x] pass all test cases using filters/computed
    - [ ] set FilterDeclarations, ComputedDeclarations types if not declared
3. Multiple Source Files
    - [x] a virtual CommonJS to load AST transformed sourceFiles
    - [x] support multiple source files for a single component
    - [x] support nested components in multiple files
4. Misc.
    - support anonymous default export: `export default class extends Component {}`
    - check default export and throw a more spcific Error
    - check default export extends Component
    - support SyntheticDefaultImports: `import * as san`
    - [x] prefix for all namespaces

## Known Issues

THIS SECTION IS FOR MAINTAINERS ONLY

TODO 移动以下文档到对应的代码生成器仓库。

### PHP

- filters/computed 是 static，这要求使用时额外声明其类型

### JS

作为对照和参考，本仓库也维护了 JS 版本的 SSR。它和 PHP SSR 一同演化，可以跑通所有 san 代码库提供的 SSR 集成测试和 e2e 测试。

JS SSR 目前存在以下问题：

* san runtime 要求 filters/computed 是 static，而 static 属性无法用接口来描述
* ssr 通过 toString 来编译 function，以下情况编译不了：
    * ES6 method。toString 后形如： foo: foo() {}
    * 值为 funciton 的表达式。例如：_.curry(sum, 2)
* 成员通过 Object.keys 遍历，以下情况遍历不到：
    * ES6 Method，需要通过 getOwnPropertyNames/Symbols 来取。
    * ES6 Property 必须中 constructor 中赋值，也会找不到。
* 只能编译 Component 文件，不支持引用纯工具文件。例如：`const someFilter = require('./somfilter'); export default class Component { static filters = { someFilter }}`

## Contribute

Development Prerequisites:

* Node.js>=8
* PHP 7
* [composer](https://getcomposer.org)

Install dependencies:

```bash
npm install
composer install
```

Run tests

```bash
npm test
```

[san]: https://github.com/baidu/san