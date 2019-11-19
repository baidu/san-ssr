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

* [san-ssr-target-js](https://github.com/searchfe/san-ssr-target-js)
* [san-ssr-target-php](https://github.com/searchfe/san-ssr-target-php)

## CLI Usage

Command line interface:

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

san-ssr will lookup `san-ssr-target-{target}` from node_modules to generate target code. The san-ssr-target-js package is installed as a dependency of san-ssr by default.

```bash
san-ssr ./component.js > ssr.js
```

## Programmatic Interface

The [SanProject class][sanproject] is used to compile component files into ssr code string.

TypeScript:

```typescript
import { Target, SanProject } from 'san-project'
import { writeFileSync } from 'fs'

const project = new SanProject()
const targetCode = project.compile('src/component.ts', Target.js)

writeFileSync('ssr.js', targetCode)
```

Or in JavaScript:

```typescript
const { SanProject } = require('san-project')
import { writeFileSync } from 'fs'

const project = new SanProject()
const targetCode = project.compile('src/component.js', 'js')

writeFileSync('ssr.js', targetCode)
```

The [SanProject#compile(filepath, target, options)][compile] has a third parameter `options`, which is passed
directly to the target code generator's [compile(sanApp, options)][target-compile] as the second parameter.


[san]: https://github.com/baidu/san
[sanproject]: https://searchfe.github.io/san-ssr/classes/_models_san_project_.sanproject.html
[compile]: https://searchfe.github.io/san-ssr/classes/_models_san_project_.sanproject.html#compile
[target-compile]: https://searchfe.github.io/san-ssr/interfaces/_models_compiler_.compiler.html#compile