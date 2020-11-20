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

**The purpurse of this repo** is to provide an SSR framework and utils for the [san][san] components.

* [中文](https://github.com/baidu/san-ssr/blob/master/README.md)
* SSR migration：[from san to san-ssr](https://github.com/baidu/san-ssr/wiki/%E4%BB%8E-san-%E8%BF%81%E7%A7%BB%E5%88%B0-san-ssr)
* Demo：[demo/](https://github.com/baidu/san-ssr/tree/master/demo)

## Usage

The [SanProject class][sanproject] is used to compile component files into ssr render function.

```javascript
const { SanProject } = require('san-ssr')
const app = require('src/component.js')

const project = new SanProject()
const render = project.compileToRenderer(app)

console.log(render({name: 'harttle'}))
```

See API doc [SanProject][sanproject] for details, or refer to the demo project in /demo directory.

## Working with San

Supported san versions for each release are specified by `peerDependencies`, that means you'll need both `san` and `san-ssr` installed in case you need server side rendering. And it's considered compatible as long as you don't see any `UNMET` warning.

Note: As described in [baidu/san/issues/441](https://github.com/baidu/san/issues/441#issuecomment-550260372), a minor version in san implies possible BREAKING CHANGES, thus the peerDependency is specified via [tilde version](https://docs.npmjs.com/misc/semver#tilde-ranges-123-12-1).

## Other Target Platforms

san-ssr provides static analysis for San components and generates abstract component tree, while code generation is a separated process, which is provided by specific implementations:

* [san-ssr-target-js](https://github.com/baidu/san-ssr/tree/master/src/target-js)
* [san-ssr-target-php](https://github.com/baidu/san-ssr-target-php)

[san]: https://github.com/baidu/san
[sanproject]: https://baidu.github.io/san-ssr/classes/_models_san_project_.sanproject.html
[target-compile]: https://baidu.github.io/san-ssr/interfaces/_models_compiler_.compiler.html#compile