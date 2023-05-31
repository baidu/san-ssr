## [3.13.1](https://github.com/baidu/san-ssr/compare/nv3.13.0...nv3.13.1) (2023-05-31)


### Bug Fixes

* renderOnly should backward compatible with old version ([#167](https://github.com/baidu/san-ssr/issues/167)) ([a989bb4](https://github.com/baidu/san-ssr/commit/a989bb4ca4be86bc836227f129ae2e9821257b22))

# [3.13.0](https://github.com/baidu/san-ssr/compare/nv3.12.0...nv3.13.0) (2023-04-18)


### Bug Fixes

* component attr string interpolation ([3f0ffac](https://github.com/baidu/san-ssr/commit/3f0ffacde65711b477be8c7b229a870d341723d1))
* use loader component with mark external ([ee53d66](https://github.com/baidu/san-ssr/commit/ee53d663baee710987d5dbaab82a785af9bf7661))


### Features

* render only component ([#165](https://github.com/baidu/san-ssr/issues/165)) ([d78c4c9](https://github.com/baidu/san-ssr/commit/d78c4c94bdebc2ac20d6bdcb0ef7bdf6c58b30e8))

# [3.12.0](https://github.com/baidu/san-ssr/compare/nv3.11.0...nv3.12.0) (2022-05-30)


### Features

* parse templateComponent ([883cd24](https://github.com/baidu/san-ssr/commit/883cd249e0fb0da2be580d6d699fc0815b4caedf))
* replace instance creation with object literal in template component ([7a59118](https://github.com/baidu/san-ssr/commit/7a59118b1f0a6f0a5872683f81d483f7afc42d3b))
* simplify the template component's rendering function ([1955ddc](https://github.com/baidu/san-ssr/commit/1955ddc05607bfa3043e7ab5e8e643903e014d1d))
* support defineTemplateComponent ([15c17ec](https://github.com/baidu/san-ssr/commit/15c17ecb1d7bbac9c5dc7f5273d6cb4473f79ffd))

# [5.4.0](https://github.com/baidu/san-ssr/compare/v5.3.1...v5.4.0) (2022-05-09)


### Features

* add cache to getRenderer and getChildComponentClass ([bf091b4](https://github.com/baidu/san-ssr/commit/bf091b4654615139c5c384aad9d0a359e6fa54a2))
* remove map filter reduce foreach in runtime ([a757013](https://github.com/baidu/san-ssr/commit/a757013a055d2fd09a5c05e7c0a0cc422b1406f7))

## [5.3.1](https://github.com/baidu/san-ssr/compare/v5.3.0...v5.3.1) (2022-05-09)


### Bug Fixes

* update deps @semantic-release/commit-analyzer and @semantic-release/npm ([cf75d47](https://github.com/baidu/san-ssr/commit/cf75d47967e44683f4cd44cf85980829bf672d51))

# [5.3.0](https://github.com/baidu/san-ssr/compare/v5.2.0...v5.3.0) (2022-04-21)


### Features

* support custom output data ([e3b8664](https://github.com/baidu/san-ssr/commit/e3b8664259d39ce0a3fed7a523d58f484c9f19cd))

# [5.2.0](https://github.com/baidu/san-ssr/compare/v5.1.0...v5.2.0) (2022-04-18)


### Bug Fixes

* revert "computed 应该在 inited 之前调用" [#144](https://github.com/baidu/san-ssr/issues/144) ([2b80c02](https://github.com/baidu/san-ssr/commit/2b80c0257bbf46d19e3ebfba4faa950e2c4dc2ec))
* 根组件有 if 指令时，没有输出数据 [#146](https://github.com/baidu/san-ssr/issues/146) ([30b7f1c](https://github.com/baidu/san-ssr/commit/30b7f1cc45bb848979524f3d48139d6b69b2bc46))


### Features

* support [] while calling data methods ([30fd0dd](https://github.com/baidu/san-ssr/commit/30fd0dd650a519cdc0d072870c95314741b8fef1)), closes [#145](https://github.com/baidu/san-ssr/issues/145)

# [5.1.0](https://github.com/baidu/san-ssr/compare/v5.0.4...v5.1.0) (2022-04-02)


### Bug Fixes

* move define ComponentClass into if block ([e7f1fd6](https://github.com/baidu/san-ssr/commit/e7f1fd640a6c24dc13e9f946975cde85a9132cd0))
* 插值运算为 + 时，进行了局部转义，应为整体转义 ([a6d4622](https://github.com/baidu/san-ssr/commit/a6d4622f857f374abe4dfe2f811d5486851c7f54))


### Features

* render 函数兼容多参数的情况 ([ff24c26](https://github.com/baidu/san-ssr/commit/ff24c26d249d46ce26acb5464e19ae4fa6214434))
* support auto require entry component ([2ca6c32](https://github.com/baidu/san-ssr/commit/2ca6c32e60120ec15024ef05dc9e99aca2ae8dc1))

## [5.0.4](https://github.com/baidu/san-ssr/compare/v5.0.3...v5.0.4) (2021-12-27)


### Bug Fixes

* emit comment 处理 interpExpr 的情况 ([2644e55](https://github.com/baidu/san-ssr/commit/2644e55d8571f43e8853d63586e23873e690d314))

## [5.0.3](https://github.com/baidu/san-ssr/compare/v5.0.2...v5.0.3) (2021-12-27)


### Bug Fixes

* emit comment 处理 interpExpr 的情况 ([2fda583](https://github.com/baidu/san-ssr/commit/2fda583a256a32b8eee7db8d606264bf41e4ddaf))

## [5.0.2](https://github.com/baidu/san-ssr/compare/v5.0.1...v5.0.2) (2021-12-22)


### Bug Fixes

* dynamic component child with if ([2dbc051](https://github.com/baidu/san-ssr/commit/2dbc05189ddc660571c2549a8a191726b1acb91c))

## [5.0.1](https://github.com/baidu/san-ssr/compare/v5.0.0...v5.0.1) (2021-12-15)


### Bug Fixes

* error using useProvidedComponentClass with componentLoader ([7705623](https://github.com/baidu/san-ssr/commit/770562326b7555c2787387f83e0422a2d9041bea))
* error when using useProvidedComponentClass with s-is ([f08b821](https://github.com/baidu/san-ssr/commit/f08b8211507061dd8a71d4c50f1065b29cab6f43))
* useProvidedComponentClass 时，传入复杂类，会报错 ([d66d8a9](https://github.com/baidu/san-ssr/commit/d66d8a958b1af681e3f5cf243ab4390334e23c35))

# [5.0.0](https://github.com/baidu/san-ssr/compare/v4.9.1...v5.0.0) (2021-12-06)


### Bug Fixes

* child components maybe undefined ([3bdfec0](https://github.com/baidu/san-ssr/commit/3bdfec039c6fa800dab20e6609a3dc4fd252bdd3))
* ChildComponetClass 可能会重复 ([d8e0fa0](https://github.com/baidu/san-ssr/commit/d8e0fa0ff6c141dba5b2fa6e705fadfd8fabe617))
* compile call expression twice got error ([3404cd1](https://github.com/baidu/san-ssr/commit/3404cd17d744123f59f4ddd450192a8a73dbbc24))
* compile call expression twice got error ([0329a1d](https://github.com/baidu/san-ssr/commit/0329a1de32119c1b2b500a7baa8704b6bbb165d1))
* computed 应该在 inited 之前调用 ([aa21455](https://github.com/baidu/san-ssr/commit/aa21455f8cefdb6d1e74c1f4d58cae36cc7250cd))
* s-bind error if value is null or undefined [#135](https://github.com/baidu/san-ssr/issues/135) ([e731d02](https://github.com/baidu/san-ssr/commit/e731d02e1bedc939f9da0a84cd6a9161ac557116))
* toSource render params ([631483e](https://github.com/baidu/san-ssr/commit/631483ebcbf759ae1c05eb75eab590887b128e16))
* 使用字符串常量作为 COMPONENT_REFERENCE ([3b48b37](https://github.com/baidu/san-ssr/commit/3b48b37cd3dd8b7e79ddd92cef656f089c8b6c80))
* 修改 createInstanceFromClass，补全所有属性。 ([d43b327](https://github.com/baidu/san-ssr/commit/d43b3275fa7429ddf42298d6850ed39aa31d3b01))
* 手动传入 class 时，使用 Object.create 创建 instance ([2ad9def](https://github.com/baidu/san-ssr/commit/2ad9def0b20bb971e1e690bb9e337876a294e8ab))


### Features

* customSSRFilePath 与 customComponentFilePath 参数中增加 tagName ([158bdd3](https://github.com/baidu/san-ssr/commit/158bdd3f490536ac5d17af06a73b8afc4a9f77d5))
* e2e 测试时，输出到每个case中output下的随机目录中 ([4b7a5d9](https://github.com/baidu/san-ssr/commit/4b7a5d92374356f919026cdbdc47fa6624e5154a))
* support dynamic tagName as normal html tags [#134](https://github.com/baidu/san-ssr/issues/134) ([b3ac8a8](https://github.com/baidu/san-ssr/commit/b3ac8a80bb71dcf7d01215273bc1c39aaba2f796))
* 使用新版本的 san.d.ts ([a9649f2](https://github.com/baidu/san-ssr/commit/a9649f2d409113d949c869ef71dca04fa8b49c56))
* 删除原始组件定义代码中无用的子组件定义 ([1fc6d47](https://github.com/baidu/san-ssr/commit/1fc6d470748dd8de3ff2d573c24e14e6723b1298))
* 增加 lifeCycle 属性 ([8d70ed6](https://github.com/baidu/san-ssr/commit/8d70ed6a32699fe268b7faf4de2fe8917f899902))
* 支持渲染阶段使用手动传入的组件类 ([1b66ed1](https://github.com/baidu/san-ssr/commit/1b66ed1e932277f739b1fda4c873b3bcda3783fc))
* 支持输入为 class 时，标记外部组件 ([0537911](https://github.com/baidu/san-ssr/commit/0537911db975a804195be12461aa9b73f275a92c))
* 支持运行时改变子组件的路径 ([aae9378](https://github.com/baidu/san-ssr/commit/aae93782dc1a0b0381159ec09fb4b43f180b8152))
* 收敛 renderer 的参数 ([c0e63f9](https://github.com/baidu/san-ssr/commit/c0e63f9646b47ce7ef163edaa8dda10e1ffe9bdf))
* 收敛 renderer 的参数 ([47a0424](https://github.com/baidu/san-ssr/commit/47a0424bc4e26e59acd4270a9b2c6b611c3d6198))
* 组件实例中增加 sourceSlots 属性。 ([ae6c698](https://github.com/baidu/san-ssr/commit/ae6c698c6b641d341082d753fc9e99f4225fd44d))
* 适配新版本的 san.d.ts ([dcd29c2](https://github.com/baidu/san-ssr/commit/dcd29c280b142b50c51c51b3cdad0faba34c7379))


### BREAKING CHANGES

* a6deec81986575d687daab64e39e937fe69a24ae

# [5.0.0-beta.6](https://github.com/baidu/san-ssr/compare/v5.0.0-beta.5...v5.0.0-beta.6) (2021-09-26)


### Bug Fixes

* compile call expression twice got error ([15b950f](https://github.com/baidu/san-ssr/commit/15b950f1c97451f55d5471178ec4def860a8c0cc))
* compile call expression twice got error ([916550e](https://github.com/baidu/san-ssr/commit/916550e7aa197c292c36ce6f9577edf547956ed2))

# [5.0.0-beta.5](https://github.com/baidu/san-ssr/compare/v5.0.0-beta.4...v5.0.0-beta.5) (2021-09-26)


### Bug Fixes

* s-bind error if value is null or undefined [#135](https://github.com/baidu/san-ssr/issues/135) ([a4efe27](https://github.com/baidu/san-ssr/commit/a4efe27023b1848bb59cc6c1460d70fb121881c3))


### Features

* support dynamic tagName as normal html tags [#134](https://github.com/baidu/san-ssr/issues/134) ([729fee0](https://github.com/baidu/san-ssr/commit/729fee0e9e35a1025f02cf6179e8cb0fad2b442a))

# [5.0.0-beta.4](https://github.com/baidu/san-ssr/compare/v5.0.0-beta.3...v5.0.0-beta.4) (2021-09-24)


### Bug Fixes

* computed 应该在 inited 之前调用 ([1b3ac22](https://github.com/baidu/san-ssr/commit/1b3ac22a237b23b41123eb6a7db29634acb9e528))
* 修改 createInstanceFromClass，补全所有属性。 ([1388f06](https://github.com/baidu/san-ssr/commit/1388f068b4f7dcdafaacc65824ef3a8e75985005))


### Features

* 增加 lifeCycle 属性 ([7d18e6f](https://github.com/baidu/san-ssr/commit/7d18e6f8727c776660e3f86c8de359428fa02d71))
* 组件实例中增加 sourceSlots 属性。 ([ef57823](https://github.com/baidu/san-ssr/commit/ef578235fe9c2115b74ff6e928bfa2299b5d076d))

# [5.0.0-beta.3](https://github.com/baidu/san-ssr/compare/v5.0.0-beta.2...v5.0.0-beta.3) (2021-09-22)


### Bug Fixes

* 使用字符串常量作为 COMPONENT_REFERENCE ([7434587](https://github.com/baidu/san-ssr/commit/7434587974d3cd5e392ca37f34602503d911e0bc))

# [5.0.0-beta.2](https://github.com/baidu/san-ssr/compare/v5.0.0-beta.1...v5.0.0-beta.2) (2021-09-14)


### Bug Fixes

* 手动传入 class 时，使用 Object.create 创建 instance ([dd37fe6](https://github.com/baidu/san-ssr/commit/dd37fe6891a6876fce4c0b949ee44dea4f424827))

# [5.0.0-beta.1](https://github.com/baidu/san-ssr/compare/v4.10.0-beta.1...v5.0.0-beta.1) (2021-09-13)


### Features

* 收敛 renderer 的参数 ([21b13a3](https://github.com/baidu/san-ssr/commit/21b13a31c9e1bf84d608e5c8805db2a781172798))


### BREAKING CHANGES

* a6deec81986575d687daab64e39e937fe69a24ae

# [4.10.0-beta.1](https://github.com/baidu/san-ssr/compare/v4.9.1...v4.10.0-beta.1) (2021-09-13)


### Bug Fixes

* child components maybe undefined ([9bc2bdc](https://github.com/baidu/san-ssr/commit/9bc2bdcbefbe9b7634a13dcb01714c2d2af9cff1))
* ChildComponetClass 可能会重复 ([b6a04e5](https://github.com/baidu/san-ssr/commit/b6a04e519189c4da516c9c02d674251ad6eaf933))
* toSource render params ([bc2a6cd](https://github.com/baidu/san-ssr/commit/bc2a6cd5bb787c9b63ac93f541983e7807b2318c))


### Features

* customSSRFilePath 与 customComponentFilePath 参数中增加 tagName ([c04734c](https://github.com/baidu/san-ssr/commit/c04734c6a92a828916a54709bc6bb2a620e3e5f1))
* e2e 测试时，输出到每个case中output下的随机目录中 ([66e1483](https://github.com/baidu/san-ssr/commit/66e1483aba125631ca19f4e1c7d3ad4286d827d1))
* 删除原始组件定义代码中无用的子组件定义 ([2bff855](https://github.com/baidu/san-ssr/commit/2bff855e2339d1b9b43a680a971c982e7a282d50))
* 支持渲染阶段使用手动传入的组件类 ([ac1d97e](https://github.com/baidu/san-ssr/commit/ac1d97ebb8701c536035845b3ae77f8d0873a33f))
* 支持输入为 class 时，标记外部组件 ([0fe957d](https://github.com/baidu/san-ssr/commit/0fe957dc38c620be300b513889262294f5d1c00b))
* 支持运行时改变子组件的路径 ([bf00b38](https://github.com/baidu/san-ssr/commit/bf00b3814ab51b7953ba80cdbadcbb240cf2e73f))
* 收敛 renderer 的参数 ([a6deec8](https://github.com/baidu/san-ssr/commit/a6deec81986575d687daab64e39e937fe69a24ae))

## [4.9.1](https://github.com/baidu/san-ssr/compare/v4.9.0...v4.9.1) (2021-09-13)


### Bug Fixes

* [#130](https://github.com/baidu/san-ssr/issues/130) ([462c62b](https://github.com/baidu/san-ssr/commit/462c62b5844dd6285f1fcbdcceb0933d89c24cba))

# [4.9.0](https://github.com/baidu/san-ssr/compare/v4.8.0...v4.9.0) (2021-09-09)


### Bug Fixes

* [#119](https://github.com/baidu/san-ssr/issues/119) ([abf73e3](https://github.com/baidu/san-ssr/commit/abf73e3ec5a3f55941eed076cd205aee6bda5fed))
* binary, tertiary 表达式没有转义 ([a3a69a2](https://github.com/baidu/san-ssr/commit/a3a69a29ceb8137692a6fdd574f05c4a084c50f9))
* slot 内容为字符串时，可能会反解失败 ([cbbeba5](https://github.com/baidu/san-ssr/commit/cbbeba59fdb3d8464ef90e446d27f0413540597d))


### Features

* 支持使用名称不为 san 的包 ([b8ba4c2](https://github.com/baidu/san-ssr/commit/b8ba4c2b8d556bf4c2fb0b978678ed7a72ec17b9))

# [4.8.0](https://github.com/baidu/san-ssr/compare/v4.7.1...v4.8.0) (2021-08-16)


### Bug Fixes

* render 函数使用未声明的变量 initData ([ef4bb5e](https://github.com/baidu/san-ssr/commit/ef4bb5e359c2504e5c1398630c4efd3050280de8))


### Features

* add error hook ([54fb958](https://github.com/baidu/san-ssr/commit/54fb95887a51fe10c4fb009900bc7c9b61ff3b9b))
* add unit test for error hook ([34cec13](https://github.com/baidu/san-ssr/commit/34cec134458377b2643ead8a84245f49e0ab6c07))
* move handleError to underscore ([e936157](https://github.com/baidu/san-ssr/commit/e936157ccbb44384f11e2641670c9bee36aec5b9))
* support esbuild ([008b403](https://github.com/baidu/san-ssr/commit/008b4033e9f5aa6c90081d46c8c14554e539a161))

## [4.7.1](https://github.com/baidu/san-ssr/compare/v4.7.0...v4.7.1) (2021-08-09)


### Bug Fixes

* [#117](https://github.com/baidu/san-ssr/issues/117) 兼容 ATextNode 直接为 interpolation 的情况 ([7a2dd9a](https://github.com/baidu/san-ssr/commit/7a2dd9ac8bd856bdf92745ed6366751694a1048f))

# [4.7.0](https://github.com/baidu/san-ssr/compare/v4.6.4...v4.7.0) (2021-06-21)


### Bug Fixes

* code style ([7e54619](https://github.com/baidu/san-ssr/commit/7e54619ef0eed99f9a8da70f429027e22d41af09))
* proto !== Function.prototype ([dcf79a1](https://github.com/baidu/san-ssr/commit/dcf79a156736a3fa5c9857d4e1063c79cc66ed2b))


### Features

* class-extend unit test ([a4db92a](https://github.com/baidu/san-ssr/commit/a4db92a6b5d2df1376446075c80efd40e885778e))
* comsrc 时，支持类的继承 ([074c85e](https://github.com/baidu/san-ssr/commit/074c85ea4895da8b4cd5cde0977c51c655ab88f9))

## [4.6.4](https://github.com/baidu/san-ssr/compare/v4.6.3...v4.6.4) (2021-05-21)


### Bug Fixes

* template 表达式中不支持 % 运算符 ([21d414f](https://github.com/baidu/san-ssr/commit/21d414fe07853ddf6c98ff06d9391318b62251cd))

## [4.6.3](https://github.com/baidu/san-ssr/compare/v4.6.2...v4.6.3) (2021-04-14)


### Bug Fixes

* 修复 initData() 返回值不是字面量时序列化结果不正确的问题, close [#99](https://github.com/baidu/san-ssr/issues/99) ([17c2256](https://github.com/baidu/san-ssr/commit/17c2256ef5c25cded21d4bb4bdf029cb4640aa3f))

## [4.6.2](https://github.com/baidu/san-ssr/compare/v4.6.1...v4.6.2) (2021-04-06)


### Bug Fixes

* 修复 class 属性为 falsy 时直接取了默认值的问题 ([609401f](https://github.com/baidu/san-ssr/commit/609401fe84e84a519789c7e5d0d2bcb2b28b39da))

## [4.6.1](https://github.com/baidu/san-ssr/compare/v4.6.0...v4.6.1) (2021-03-30)


### Bug Fixes

* 修复子组件未定义 attribute 时父组件无法指定的问题, close [#94](https://github.com/baidu/san-ssr/issues/94) ([e6ece33](https://github.com/baidu/san-ssr/commit/e6ece33fbee6480ce3716f7064e2b0d94539a9d3))

# [4.6.0](https://github.com/baidu/san-ssr/compare/v4.5.0...v4.6.0) (2021-03-22)


### Features

* 支持对象字面量形式的子组件 ([dbcce56](https://github.com/baidu/san-ssr/commit/dbcce56592ec34e2e147d5c8a8d253792b14cd36))

# [4.5.0](https://github.com/baidu/san-ssr/compare/v4.4.2...v4.5.0) (2021-02-18)


### Features

* 支持 components 属性通过 self 调用自身组件 ([41dda59](https://github.com/baidu/san-ssr/commit/41dda59da083969d05d38bca869db61c306bcd92))

## [4.4.2](https://github.com/baidu/san-ssr/compare/v4.4.1...v4.4.2) (2021-02-05)


### Bug Fixes

* 修复 initData 初始值为 falsy 时会赋值成默认值的问题 ([922e718](https://github.com/baidu/san-ssr/commit/922e718dd666b0413d5269cbdec607bc7b31521c))

## [4.4.1](https://github.com/baidu/san-ssr/compare/v4.4.0...v4.4.1) (2021-01-27)


### Bug Fixes

* 修复属性值不支持 raw 的问题 ([4874a94](https://github.com/baidu/san-ssr/commit/4874a9490d08cfe0b9e3028296b788bf70ad4a30))

# [4.4.0](https://github.com/baidu/san-ssr/compare/v4.3.0...v4.4.0) (2021-01-27)


### Features

* renderer AST 提供 SlotRenderCall 结构 ([8ce69d1](https://github.com/baidu/san-ssr/commit/8ce69d1a568023ea632f2184b41e2671afc275b3))

# [4.3.0](https://github.com/baidu/san-ssr/compare/v4.2.0...v4.3.0) (2021-01-21)


### Features

* 支持配置正则移除模块引用 ([b443052](https://github.com/baidu/san-ssr/commit/b4430522d1ba211b1f534ab79f79dba680f612c5))

# [4.2.0](https://github.com/baidu/san-ssr/compare/v4.1.1...v4.2.0) (2021-01-07)


### Features

* renderer AST 提供 GetRootCtxCall, ComponentReferenceLiteral, SlotRendererDefinition 结构 ([3a26e0a](https://github.com/baidu/san-ssr/commit/3a26e0a070307d1b378337b1ee1c5519af373267))

## [4.1.1](https://github.com/baidu/san-ssr/compare/v4.1.0...v4.1.1) (2020-12-18)


### Performance Improvements

* 语法结点采用 flyweight 设计 ([7ae19b7](https://github.com/baidu/san-ssr/commit/7ae19b7ff1d128f2a58a65ddbe21265be68ea8e9))
* 系统性地合并 html += <Literal> 语句 ([4f145b3](https://github.com/baidu/san-ssr/commit/4f145b30aff246a6a2da7138e3e943a901e6d0da))
* 系统性地改 \[\] notation 为 . notation ([2fed822](https://github.com/baidu/san-ssr/commit/2fed8221ce66e51aff961413f475e04fd83bfc8d))

# [4.1.0](https://github.com/baidu/san-ssr/compare/v4.0.3...v4.1.0) (2020-12-07)


### Features

* 提供 emitHelpers 来单独产出运行时工具库 ([0cd221f](https://github.com/baidu/san-ssr/commit/0cd221f01a504344c849f9fd188ac8b94a387d93))
* 转义 s-data 注释中的特殊字符，消除 XSS 隐患 ([c29c22f](https://github.com/baidu/san-ssr/commit/c29c22fe91232abb3a9badb73b4f752d28e57569))

## [4.0.3](https://github.com/baidu/san-ssr/compare/v4.0.2...v4.0.3) (2020-11-20)


### Bug Fixes

* 修复 script 内容也错误地过了 HTML 转义的问题，见 [#73](https://github.com/baidu/san-ssr/issues/73) ([3ea06a4](https://github.com/baidu/san-ssr/commit/3ea06a4b0b66b367513541b9903e8d422e8d87ce))

## [4.0.2](https://github.com/baidu/san-ssr/compare/v4.0.1...v4.0.2) (2020-11-11)


### Bug Fixes

* 添加 estree type (被 san-ssr export 了) 作为依赖 ([e8d0f90](https://github.com/baidu/san-ssr/commit/e8d0f9037ca2998b7c8b74b00c6362b4e11eef4c))

## [4.0.1](https://github.com/baidu/san-ssr/compare/v4.0.0...v4.0.1) (2020-11-09)


### Bug Fixes

* 所有 render 函数都统一通过 exports.sanSSRRenders 暴露出来 ([74536c9](https://github.com/baidu/san-ssr/commit/74536c901656ce64e2275ebdbc94cef415b8ee03))

# [4.0.0](https://github.com/baidu/san-ssr/compare/v3.0.1...v4.0.0) (2020-11-05)


### Documentation

* demo/ 下添加更多用例 ([17e19d2](https://github.com/baidu/san-ssr/commit/17e19d25ef1ea5b03657e704db77d117afc12186))


### Features

* 支持 s-is 指令，见 https://github.com/baidu/san/issues/533 ([f8c2b81](https://github.com/baidu/san-ssr/commit/f8c2b81fe175b44a147a1ab24da0419316a9ccbe))
* 提供 JSSanSourceFile 抽象 ([549531e](https://github.com/baidu/san-ssr/commit/549531ed4c491b6a64e1196f1b37f06eace462bf))
* 提供 SanFileParser 工具 ([50c7387](https://github.com/baidu/san-ssr/commit/50c7387a6ca99855ed32e15d47a888a5001e1733))


### BREAKING CHANGES

* San 组件中，不再支持定义 getComponentType 方法
* SanSourceFile ComponentInfo 类型有变化

## [3.0.1](https://github.com/baidu/san-ssr/compare/v3.0.0...v3.0.1) (2020-08-27)


### Bug Fixes

* undefined/null 值应该输出为 "" ([37e91b2](https://github.com/baidu/san-ssr/commit/37e91b2e47250030642bd1d900267bde419196c1))

# [3.0.0](https://github.com/baidu/san-ssr/compare/v2.2.4...v3.0.0) (2020-08-04)

### BREAKING CHANGES

* 升级所有依赖，包括 ts-morph 版本（它也用于 ts2php）

## [2.2.4](https://github.com/baidu/san-ssr/compare/v2.2.3...v2.2.4) (2020-07-31)


### Bug Fixes

* 修复输入为 TypeScript 时不调用构造函数的问题 ([40bf654](https://github.com/baidu/san-ssr/commit/40bf654054f75b25e6a9782dea55f23644602662))

## [2.2.3](https://github.com/baidu/san-ssr/compare/v2.2.2...v2.2.3) (2020-07-27)


### Bug Fixes

* 重命名 ComponentReference#relativeFilePath 为 specifier ([adda06b](https://github.com/baidu/san-ssr/commit/adda06bab887a499d90b3e5b1a381df49bc1597f))
* 修复根元素为组件时，s-data 不正确的问题 ([fd87852](https://github.com/baidu/san-ssr/commit/fd878523181170d035b700edf7137ecc1f7421ff))

## [2.2.2](https://github.com/baidu/san-ssr/compare/v2.2.1...v2.2.2) (2020-07-16)


### Bug Fixes

* 支持了 trimWhitespace 和 delimiters，见 https://baidu.github.io/san/doc/api/#trimWhitespace ([ca9be69](https://github.com/baidu/san-ssr/commit/ca9be698fa4f7b17071e6fb4e5fbf5c435b38a78))

## [2.2.1](https://github.com/baidu/san-ssr/compare/v2.2.0...v2.2.1) (2020-07-10)


### Bug Fixes

* 只在合并数据时属性名转 camelCase ([af4893f](https://github.com/baidu/san-ssr/commit/af4893f564a9890bf9a182da88ce2d4304c4c39e))

# [2.2.0](https://github.com/baidu/san-ssr/compare/v2.1.0...v2.2.0) (2020-07-06)


### Features

* 支持 san@3.9.0 ([5de18cc](https://github.com/baidu/san-ssr/commit/5de18ccbcda62f695ea078ba68c066453aaa77cb))

# [2.1.0](https://github.com/baidu/san-ssr/compare/v2.0.1...v2.1.0) (2020-07-03)


### Features

* SanProject#compile({filePath, fileContent}) ([4ed9cf1](https://github.com/baidu/san-ssr/commit/4ed9cf11fdc084e29d08532298165b71c70695d2))

## [2.0.1](https://github.com/baidu/san-ssr/compare/v2.0.0...v2.0.1) (2020-07-02)


### Bug Fixes

* more accurate type for parseSanSourceFile() ([4078ad7](https://github.com/baidu/san-ssr/commit/4078ad7868457e08f9d86327ee8e3e870573a1b0))

# [2.0.0](https://github.com/baidu/san-ssr/compare/v1.13.1...v2.0.0) (2020-07-02)


### Features

* TypeScript 输入静态分析；以 SourceFile 为粒度编译 ([1000a05](https://github.com/baidu/san-ssr/commit/1000a052ed74e7a7d15a557a15ca016d9feac403))


### BREAKING CHANGES

* - ComponentTree 对象不再可用，只给出当前 SourceFile 的 Component
列表（平铺）
- dependency resolver API 不再可用，比如 .getRuntimeDependencyDeclarations() 已经被移除

## [1.13.1](https://github.com/baidu/san-ssr/compare/v1.13.0...v1.13.1) (2020-06-12)


### Bug Fixes

* types for Component ([9007876](https://github.com/baidu/san-ssr/commit/9007876a4439d599820c03733cd9dd2e5ae6a710))

# [1.13.0](https://github.com/baidu/san-ssr/compare/v1.12.0...v1.13.0) (2020-06-02)


### Features

* ssrOnly, see [#59](https://github.com/baidu/san-ssr/issues/59) ([ccca8e9](https://github.com/baidu/san-ssr/commit/ccca8e96e6db3ce001e2915d53881ac247309004))
* 支持根元素为组件，[#58](https://github.com/baidu/san-ssr/issues/58) ([0602a77](https://github.com/baidu/san-ssr/commit/0602a7746c827951b83c8939df15c488727613b6))

# [1.12.0](https://github.com/baidu/san-ssr/compare/v1.11.2...v1.12.0) (2020-05-29)


### Features

* support <fragment>, see [#53](https://github.com/baidu/san-ssr/issues/53) ([7b74ec1](https://github.com/baidu/san-ssr/commit/7b74ec1b708b4beb5a6601d80c87c094959e8ba4))

## [1.11.2](https://github.com/baidu/san-ssr/compare/v1.11.1...v1.11.2) (2020-05-18)


### Bug Fixes

* call SanData#get() without arguments, closes [#57](https://github.com/baidu/san-ssr/issues/57) ([6b0e696](https://github.com/baidu/san-ssr/commit/6b0e6965bcd02dd4a29dca80f2be027d9088afba))

## [1.11.1](https://github.com/baidu/san-ssr/compare/v1.11.0...v1.11.1) (2020-05-14)


### Bug Fixes

* this.parentComponent for slots, see [#52](https://github.com/baidu/san-ssr/issues/52) ([f23068f](https://github.com/baidu/san-ssr/commit/f23068f734f415dcf1ddde291e81c2ca571f5f79))

# [1.11.0](https://github.com/baidu/san-ssr/compare/v1.10.2...v1.11.0) (2020-05-14)


### Features

* support for this.parentComponent, see [#52](https://github.com/baidu/san-ssr/issues/52) ([480105c](https://github.com/baidu/san-ssr/commit/480105c9be5d07d972a0843b81bc8e014c894fa7))

## [1.10.2](https://github.com/baidu/san-ssr/compare/v1.10.1...v1.10.2) (2020-03-27)


### Performance Improvements

* reutilization of RendererCompiler ([8269ae1](https://github.com/baidu/san-ssr/commit/8269ae14199f7faae5b6b0aa2145b3d0d80d0e61))

## [1.10.1](https://github.com/baidu/san-ssr/compare/v1.10.0...v1.10.1) (2020-03-19)


### Bug Fixes

* Component#getComponentType() not working ([440e48f](https://github.com/baidu/san-ssr/commit/440e48fa25b1df08681943ef71e5d181368c4a44))
* JSEmitter not flushing when fullText() called ([d79fe95](https://github.com/baidu/san-ssr/commit/d79fe95d81faf30537fdb4201b0e08bd4c07449e))


### Performance Improvements

* fix dot notation in dataAccess and callExpr ([c708bcd](https://github.com/baidu/san-ssr/commit/c708bcdd2e1c7d6684cc410e44a1062bc330b980))

# [1.10.0](https://github.com/baidu/san-ssr/compare/v1.9.7...v1.10.0) (2020-03-04)


### Features

* data.removeAt() during SSR ([30c929e](https://github.com/baidu/san-ssr/commit/30c929ec102e57a76310ae79b68d46c6764e8e34))

## [1.9.7](https://github.com/baidu/san-ssr/compare/v1.9.6...v1.9.7) (2020-03-02)


### Bug Fixes

* SanData#get() return undefined when not found ([a54918f](https://github.com/baidu/san-ssr/commit/a54918fb66d40c30b1240605a64cd853c66fb318))

## [1.9.6](https://github.com/baidu/san-ssr/compare/v1.9.5...v1.9.6) (2020-02-20)


### Bug Fixes

* fixed ts-morph version ([bcbc3e3](https://github.com/baidu/san-ssr/commit/bcbc3e380cc8fa775a0dc26f5e4e6dadef029e09))

## [1.9.5](https://github.com/baidu/san-ssr/compare/v1.9.4...v1.9.5) (2020-02-20)


### Bug Fixes

* remove dependency `ts2php` ([f930199](https://github.com/baidu/san-ssr/commit/f930199ca124031eb51cbbaf8e5a8c7fd23d90ed))

## [1.9.4](https://github.com/baidu/san-ssr/compare/v1.9.3...v1.9.4) (2020-02-19)


### Bug Fixes

* add /types in package.json#files ([59d2c4f](https://github.com/baidu/san-ssr/commit/59d2c4f22bde43ad2e6958ff225569bec9c16983))

## [1.9.3](https://github.com/baidu/san-ssr/compare/v1.9.2...v1.9.3) (2020-02-18)


### Bug Fixes

* remove console.log ([a9393b6](https://github.com/baidu/san-ssr/commit/a9393b6ed491872802b0939f87902cb691a29c5a))
* utils path in runtime emitter ([6bf432e](https://github.com/baidu/san-ssr/commit/6bf432e563cacc5b82e756222f61ef18a6f676ec))

## [1.9.2](https://github.com/baidu/san-ssr/compare/v1.9.1...v1.9.2) (2020-01-14)


### Bug Fixes

* url in package.json ([bd4ef00](https://github.com/baidu/san-ssr/commit/bd4ef003b051d46d66a22c0e0208ada7acbb0259))

## [1.9.1](https://github.com/baidu/san-ssr/compare/v1.9.0...v1.9.1) (2020-01-10)


### Bug Fixes

* ensure data access with valid identifier ([8284ddb](https://github.com/baidu/san-ssr/commit/8284ddb756acc2c46266bbbcfdaa057ee5f8778e))

# [1.9.0](https://github.com/baidu/san-ssr/compare/v1.8.1...v1.9.0) (2020-01-08)


### Features

* filters#this point to component instance ([034c295](https://github.com/baidu/san-ssr/commit/034c2957c72368519ef225e975713ac4dd7093f6))

## [1.8.1](https://github.com/baidu/san-ssr/compare/v1.8.0...v1.8.1) (2020-01-06)


### Bug Fixes

* not call inited in compile time, see [#41](https://github.com/baidu/san-ssr/issues/41) ([8801964](https://github.com/baidu/san-ssr/commit/8801964cbbdeb0279266e2a9450ba0096542c661))

# [1.8.0](https://github.com/baidu/san-ssr/compare/v1.7.1...v1.8.0) (2020-01-05)


### Features

* compile to renderer ([a2383a1](https://github.com/baidu/san-ssr/commit/a2383a192cb991e7432f56f9497c06315f6e2fbe))

## [1.7.1](https://github.com/baidu/san-ssr/compare/v1.7.0...v1.7.1) (2020-01-02)


### Bug Fixes

* type for initData() ([92c99a4](https://github.com/baidu/san-ssr/commit/92c99a46b617c817e04f10b5f3f939b71a7e760d))

# [1.7.0](https://github.com/baidu/san-ssr/compare/v1.6.0...v1.7.0) (2020-01-02)


### Features

* not to calculate computed in compile time, see [#42](https://github.com/baidu/san-ssr/issues/42) ([c0f4875](https://github.com/baidu/san-ssr/commit/c0f48750816b4f19e9a86f8c0d3805acee2a9d4c))
* SanProject#parseSanApp() ([e628ab1](https://github.com/baidu/san-ssr/commit/e628ab1c024bf8540ee2b153ee17cb43a11928fd))

# [1.6.0](https://github.com/baidu/san-ssr/compare/v1.5.3...v1.6.0) (2020-01-02)


### Features

* call inited() in runtime, fixes [#41](https://github.com/baidu/san-ssr/issues/41) ([4da4dfe](https://github.com/baidu/san-ssr/commit/4da4dfe15737cae0c4ee7dbbe3fec20a48d55091))

## [1.5.3](https://github.com/baidu/san-ssr/compare/v1.5.2...v1.5.3) (2019-12-26)


### Bug Fixes

* remove requiring test case impl on start ([930c323](https://github.com/baidu/san-ssr/commit/930c323bf8affa6d8b1420d861d0b4d89bc839e6))

## [1.5.2](https://github.com/baidu/san-ssr/compare/v1.5.1...v1.5.2) (2019-12-26)


### Bug Fixes

* don't throw when tsconfig not specified ([08aaa10](https://github.com/baidu/san-ssr/commit/08aaa10dc315f396553f6c708c0c4389c72480ff))

## [1.5.1](https://github.com/baidu/san-ssr/compare/v1.5.0...v1.5.1) (2019-12-26)


### Bug Fixes

* Renderer signature ([1e0ce6e](https://github.com/baidu/san-ssr/commit/1e0ce6ef9573a3d60f8e5489c5915922bb6a311d))

# [1.5.0](https://github.com/baidu/san-ssr/compare/v1.4.0...v1.5.0) (2019-12-25)


### Features

* compileToSource, compileToRenderer, see [#1](https://github.com/baidu/san-ssr/issues/1) ([b404dfa](https://github.com/baidu/san-ssr/commit/b404dfa6937228011f65dd175ee5bca8fae3351f))

# [1.4.0](https://github.com/baidu/san-ssr/compare/v1.3.11...v1.4.0) (2019-12-25)


### Features

* noTemplateOutput, see [#34](https://github.com/baidu/san-ssr/issues/34) ([6038a0a](https://github.com/baidu/san-ssr/commit/6038a0a1bce60f1370092393dddba3e3a7b70fac))

## [1.3.11](https://github.com/baidu/san-ssr/compare/v1.3.10...v1.3.11) (2019-12-23)


### Bug Fixes

* common-js not caching the actual file path ([aee90ea](https://github.com/baidu/san-ssr/commit/aee90ea43a7c01ad2aef23a0e5ae0344e9b3f276))

## [1.3.10](https://github.com/baidu/san-ssr/compare/v1.3.9...v1.3.10) (2019-11-26)


### Bug Fixes

* add sourcefile before parseSanApp() ([4ad19ed](https://github.com/baidu/san-ssr/commit/4ad19ed8e1d3eb2d4b7ec427dd398f00b6ce4baf))

## [1.3.9](https://github.com/baidu/san-ssr/compare/v1.3.8...v1.3.9) (2019-11-21)


### Bug Fixes

* remove console.log ([6488873](https://github.com/baidu/san-ssr/commit/64888731d59577c6087bbe333364d2776447709f))

## [1.3.8](https://github.com/baidu/san-ssr/compare/v1.3.7...v1.3.8) (2019-11-21)


### Bug Fixes

* multiple parses for the same project ([60424d1](https://github.com/baidu/san-ssr/commit/60424d113f18d0e2ad1b99aef735bd9d3aff3bb4))

## [1.3.7](https://github.com/baidu/san-ssr/compare/v1.3.6...v1.3.7) (2019-11-19)


### Bug Fixes

* not throw when tsconfig not defined ([9ec8a18](https://github.com/baidu/san-ssr/commit/9ec8a18cf84158da6757f1e47a32eb0a2989d6b0))

## [1.3.6](https://github.com/baidu/san-ssr/compare/v1.3.5...v1.3.6) (2019-11-19)


### Bug Fixes

* dependencies ([b8f7828](https://github.com/baidu/san-ssr/commit/b8f78289fb114c43d4f6941da359d9703eb47a3c))

## [1.3.5](https://github.com/baidu/san-ssr/compare/v1.3.4...v1.3.5) (2019-11-15)


### Bug Fixes

* `$` in php string ([fd252f4](https://github.com/baidu/san-ssr/commit/fd252f48152328b69fd4435049f4f6868d01f0e6))

## [1.3.4](https://github.com/baidu/san-ssr/compare/v1.3.3...v1.3.4) (2019-11-14)


### Bug Fixes

* format compilerOptions for ts2php, fixes [#19](https://github.com/baidu/san-ssr/issues/19) ([cb2329d](https://github.com/baidu/san-ssr/commit/cb2329da1c0dc091f57cbef53300a55bc851c34e))
* remove <!--s-text--><!--/s-text--> when noDataOutput is true, fixes [#21](https://github.com/baidu/san-ssr/issues/21) ([c05ef7d](https://github.com/baidu/san-ssr/commit/c05ef7db664a62781c74228e7f0bf4c0117b69ea))

## [1.3.3](https://github.com/baidu/san-ssr/compare/v1.3.2...v1.3.3) (2019-11-13)


### Bug Fixes

* remove <!--s-text--><!--/s-text--> when noDataOutput is true, fixes [#21](https://github.com/baidu/san-ssr/issues/21) ([4f5132c](https://github.com/baidu/san-ssr/commit/4f5132c2c90e9caa927ca74e68741050f94d46fb))

## [1.3.2](https://github.com/baidu/san-ssr/compare/v1.3.1...v1.3.2) (2019-11-09)


### Bug Fixes

* format compilerOptions for ts2php, fixes [#19](https://github.com/baidu/san-ssr/issues/19) ([279769a](https://github.com/baidu/san-ssr/commit/279769a82c440f2b957f89a23bdb7ffc70fa9bb4))

## [1.3.1](https://github.com/baidu/san-ssr/compare/v1.3.0...v1.3.1) (2019-11-08)


### Bug Fixes

* temp fix for data.set call in method ([e60a0ad](https://github.com/baidu/san-ssr/commit/e60a0adee020997e40f788ee5cd83186c9a2ef17))

# [1.3.0](https://github.com/baidu/san-ssr/compare/v1.2.1...v1.3.0) (2019-11-08)


### Features

* configuable module content for CommonJS loader, fixes [#12](https://github.com/baidu/san-ssr/issues/12) ([92e6b16](https://github.com/baidu/san-ssr/commit/92e6b1696d8742b252b4f84bdc02d6e556e0f09f))

## [1.2.1](https://github.com/baidu/san-ssr/compare/v1.2.0...v1.2.1) (2019-11-07)


### Bug Fixes

* refactor non-constant property initializer for php, fixes [#16](https://github.com/baidu/san-ssr/issues/16) ([b112ed5](https://github.com/baidu/san-ssr/commit/b112ed53929400e252aae088ce8a696833e0cd01))

# [1.2.0](https://github.com/baidu/san-ssr/compare/v1.1.2...v1.2.0) (2019-11-07)


### Features

* emit runtime/components/renderer only when targeted to php, close [#2](https://github.com/baidu/san-ssr/issues/2) ([859966b](https://github.com/baidu/san-ssr/commit/859966b84de63bedfa3a85fcf3f6632557071327))

## [1.1.2](https://github.com/baidu/san-ssr/compare/v1.1.1...v1.1.2) (2019-11-06)


### Bug Fixes

* method in San Component, [#10](https://github.com/baidu/san-ssr/issues/10), [#11](https://github.com/baidu/san-ssr/issues/11) ([80ab41a](https://github.com/baidu/san-ssr/commit/80ab41a820321cb207f876064f3da8b4a5c52ecb))

## [1.1.1](https://github.com/baidu/san-ssr/compare/v1.1.0...v1.1.1) (2019-11-05)


### Bug Fixes

* remove IIFE for compatibility issues, see [#9](https://github.com/baidu/san-ssr/issues/9) ([b3707c2](https://github.com/baidu/san-ssr/commit/b3707c2e2b6baf74e271cd55457d5544005dccc0))
