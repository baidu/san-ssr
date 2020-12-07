# [4.1.0](https://github.com/baidu/san-ssr/compare/v4.0.3...v4.1.0) (2020-12-07)


### Features

* emitHelpers ([0cd221f](https://github.com/baidu/san-ssr/commit/0cd221f01a504344c849f9fd188ac8b94a387d93))
* s-data 注释转义特殊字符消除 XSS 隐患 ([c29c22f](https://github.com/baidu/san-ssr/commit/c29c22fe91232abb3a9badb73b4f752d28e57569))

## [4.0.3](https://github.com/baidu/san-ssr/compare/v4.0.2...v4.0.3) (2020-11-20)


### Bug Fixes

* script 内容跳过转义，见 [#73](https://github.com/baidu/san-ssr/issues/73) ([3ea06a4](https://github.com/baidu/san-ssr/commit/3ea06a4b0b66b367513541b9903e8d422e8d87ce))

## [4.0.2](https://github.com/baidu/san-ssr/compare/v4.0.1...v4.0.2) (2020-11-11)


### Bug Fixes

* add estree type (which is exported) as a dependency ([e8d0f90](https://github.com/baidu/san-ssr/commit/e8d0f9037ca2998b7c8b74b00c6362b4e11eef4c))

## [4.0.1](https://github.com/baidu/san-ssr/compare/v4.0.0...v4.0.1) (2020-11-09)


### Bug Fixes

* move all render functions to exports.sanSSRRenders ([74536c9](https://github.com/baidu/san-ssr/commit/74536c901656ce64e2275ebdbc94cef415b8ee03))

# [4.0.0](https://github.com/baidu/san-ssr/compare/v3.0.1...v4.0.0) (2020-11-05)


### Documentation

* more use cases in demo/ ([17e19d2](https://github.com/baidu/san-ssr/commit/17e19d25ef1ea5b03657e704db77d117afc12186))


### Features

* is directive ([f8c2b81](https://github.com/baidu/san-ssr/commit/f8c2b81fe175b44a147a1ab24da0419316a9ccbe))
* JSSanSourceFile ([549531e](https://github.com/baidu/san-ssr/commit/549531ed4c491b6a64e1196f1b37f06eace462bf))
* SanFileParser ([50c7387](https://github.com/baidu/san-ssr/commit/50c7387a6ca99855ed32e15d47a888a5001e1733))
* support s-is, see https://github.com/baidu/san/issues/533 ([df78670](https://github.com/baidu/san-ssr/commit/df786702ea1654a6b6c537790ec148b1cdd1423b))


### BREAKING CHANGES

* 不再支持 getComponentType
* SanSourceFile ComponentInfo 类型有变

## [3.0.1](https://github.com/baidu/san-ssr/compare/v3.0.0...v3.0.1) (2020-08-27)


### Bug Fixes

* undefined/null should be output as "" ([37e91b2](https://github.com/baidu/san-ssr/commit/37e91b2e47250030642bd1d900267bde419196c1))

# [3.0.0](https://github.com/baidu/san-ssr/compare/v2.2.4...v3.0.0) (2020-08-04)


### Bug Fixes

* trigger release ([815ae66](https://github.com/baidu/san-ssr/commit/815ae66c1d51fa6478491f2339359c8dad04a551))


### BREAKING CHANGES

* dependencies including ts-morph are all upgraded

## [2.2.4](https://github.com/baidu/san-ssr/compare/v2.2.3...v2.2.4) (2020-07-31)


### Bug Fixes

* 输入为 TypeScript 时不调用构造函数 ([40bf654](https://github.com/baidu/san-ssr/commit/40bf654054f75b25e6a9782dea55f23644602662))

## [2.2.3](https://github.com/baidu/san-ssr/compare/v2.2.2...v2.2.3) (2020-07-27)


### Bug Fixes

* rename ComponentReference#relativeFilePath->specifier ([adda06b](https://github.com/baidu/san-ssr/commit/adda06bab887a499d90b3e5b1a381df49bc1597f))
* 根元素为组件时，s-data 不正确的问题 ([fd87852](https://github.com/baidu/san-ssr/commit/fd878523181170d035b700edf7137ecc1f7421ff))

## [2.2.2](https://github.com/baidu/san-ssr/compare/v2.2.1...v2.2.2) (2020-07-16)


### Bug Fixes

* trimWhitespace and delimiters, see https://baidu.github.io/san/doc/api/#trimWhitespace ([ca9be69](https://github.com/baidu/san-ssr/commit/ca9be698fa4f7b17071e6fb4e5fbf5c435b38a78))

## [2.2.1](https://github.com/baidu/san-ssr/compare/v2.2.0...v2.2.1) (2020-07-10)


### Bug Fixes

* 只在合并数据时属性名转 camelCase ([af4893f](https://github.com/baidu/san-ssr/commit/af4893f564a9890bf9a182da88ce2d4304c4c39e))

# [2.2.0](https://github.com/baidu/san-ssr/compare/v2.1.0...v2.2.0) (2020-07-06)


### Features

* support san@3.9.0 ([5de18cc](https://github.com/baidu/san-ssr/commit/5de18ccbcda62f695ea078ba68c066453aaa77cb))

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
