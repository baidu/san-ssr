## [1.3.11](https://github.com/searchfe/san-ssr/compare/v1.3.10...v1.3.11) (2019-12-23)


### Bug Fixes

* common-js not caching the actual file path ([aee90ea](https://github.com/searchfe/san-ssr/commit/aee90ea43a7c01ad2aef23a0e5ae0344e9b3f276))

## [1.3.10](https://github.com/searchfe/san-ssr/compare/v1.3.9...v1.3.10) (2019-11-26)


### Bug Fixes

* add sourcefile before parseSanApp() ([4ad19ed](https://github.com/searchfe/san-ssr/commit/4ad19ed8e1d3eb2d4b7ec427dd398f00b6ce4baf))

## [1.3.9](https://github.com/searchfe/san-ssr/compare/v1.3.8...v1.3.9) (2019-11-21)


### Bug Fixes

* remove console.log ([6488873](https://github.com/searchfe/san-ssr/commit/64888731d59577c6087bbe333364d2776447709f))

## [1.3.8](https://github.com/searchfe/san-ssr/compare/v1.3.7...v1.3.8) (2019-11-21)


### Bug Fixes

* multiple parses for the same project ([60424d1](https://github.com/searchfe/san-ssr/commit/60424d113f18d0e2ad1b99aef735bd9d3aff3bb4))

## [1.3.7](https://github.com/searchfe/san-ssr/compare/v1.3.6...v1.3.7) (2019-11-19)


### Bug Fixes

* not throw when tsconfig not defined ([9ec8a18](https://github.com/searchfe/san-ssr/commit/9ec8a18cf84158da6757f1e47a32eb0a2989d6b0))

## [1.3.6](https://github.com/searchfe/san-ssr/compare/v1.3.5...v1.3.6) (2019-11-19)


### Bug Fixes

* dependencies ([b8f7828](https://github.com/searchfe/san-ssr/commit/b8f78289fb114c43d4f6941da359d9703eb47a3c))

## [1.3.5](https://github.com/searchfe/san-ssr/compare/v1.3.4...v1.3.5) (2019-11-15)


### Bug Fixes

* $ in php string ([fd252f4](https://github.com/searchfe/san-ssr/commit/fd252f48152328b69fd4435049f4f6868d01f0e6))

## [1.3.4](https://github.com/searchfe/san-ssr/compare/v1.3.3...v1.3.4) (2019-11-14)


### Bug Fixes

* format compilerOptions for ts2php, fixes [#19](https://github.com/searchfe/san-ssr/issues/19) ([cb2329d](https://github.com/searchfe/san-ssr/commit/cb2329da1c0dc091f57cbef53300a55bc851c34e))
* remove <!--s-text--><!--/s-text--> when noDataOutput is true, fixes [#21](https://github.com/searchfe/san-ssr/issues/21) ([c05ef7d](https://github.com/searchfe/san-ssr/commit/c05ef7db664a62781c74228e7f0bf4c0117b69ea))

## [1.3.3](https://github.com/searchfe/san-ssr/compare/v1.3.2...v1.3.3) (2019-11-13)


### Bug Fixes

* remove <!--s-text--><!--/s-text--> when noDataOutput is true, fixes [#21](https://github.com/searchfe/san-ssr/issues/21) ([4f5132c](https://github.com/searchfe/san-ssr/commit/4f5132c2c90e9caa927ca74e68741050f94d46fb))

## [1.3.2](https://github.com/searchfe/san-ssr/compare/v1.3.1...v1.3.2) (2019-11-09)


### Bug Fixes

* format compilerOptions for ts2php, fixes [#19](https://github.com/searchfe/san-ssr/issues/19) ([279769a](https://github.com/searchfe/san-ssr/commit/279769a82c440f2b957f89a23bdb7ffc70fa9bb4))

## [1.3.1](https://github.com/searchfe/san-ssr/compare/v1.3.0...v1.3.1) (2019-11-08)


### Bug Fixes

* temp fix for data.set call in method ([e60a0ad](https://github.com/searchfe/san-ssr/commit/e60a0adee020997e40f788ee5cd83186c9a2ef17))

# [1.3.0](https://github.com/searchfe/san-ssr/compare/v1.2.1...v1.3.0) (2019-11-08)


### Features

* configuable module content for CommonJS loader, fixes [#12](https://github.com/searchfe/san-ssr/issues/12) ([92e6b16](https://github.com/searchfe/san-ssr/commit/92e6b1696d8742b252b4f84bdc02d6e556e0f09f))

## [1.2.1](https://github.com/searchfe/san-ssr/compare/v1.2.0...v1.2.1) (2019-11-07)


### Bug Fixes

* refactor non-constant property initializer for php, fixes [#16](https://github.com/searchfe/san-ssr/issues/16) ([b112ed5](https://github.com/searchfe/san-ssr/commit/b112ed53929400e252aae088ce8a696833e0cd01))

# [1.2.0](https://github.com/searchfe/san-ssr/compare/v1.1.2...v1.2.0) (2019-11-07)


### Features

* emit runtime/components/renderer only when targeted to php, close [#2](https://github.com/searchfe/san-ssr/issues/2) ([859966b](https://github.com/searchfe/san-ssr/commit/859966b84de63bedfa3a85fcf3f6632557071327))

## [1.1.2](https://github.com/searchfe/san-ssr/compare/v1.1.1...v1.1.2) (2019-11-06)


### Bug Fixes

* method in San Component, [#10](https://github.com/searchfe/san-ssr/issues/10), [#11](https://github.com/searchfe/san-ssr/issues/11) ([80ab41a](https://github.com/searchfe/san-ssr/commit/80ab41a820321cb207f876064f3da8b4a5c52ecb))

## [1.1.1](https://github.com/searchfe/san-ssr/compare/v1.1.0...v1.1.1) (2019-11-05)


### Bug Fixes

* remove IIFE for compatibility issues, see [#9](https://github.com/searchfe/san-ssr/issues/9) ([b3707c2](https://github.com/searchfe/san-ssr/commit/b3707c2e2b6baf74e271cd55457d5544005dccc0))
