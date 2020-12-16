import { parse } from 'acorn'
import { getLiteralValue, getStringValue, findExportNames, isModuleExports, findESMImports, findScriptRequires } from '../../../src/ast/js-ast-util'

const pm = (script: string) => parse(script, { sourceType: 'module', ecmaVersion: 2020 }) as any
const p = (script: string) => parse(script, { ecmaVersion: 2020 }) as any

describe('js-ast-util', () => {
    describe('.isModuleExports()', () => {
        it('should return true for module.exports =', () => {
            const root = pm('module.exports = class Foo {}') as any
            expect(isModuleExports(root.body[0].expression.left)).toBeTruthy()
        })
    })
    describe('.findESMImports()', () => {
        it('should parse imports in ES module', () => {
            const script = `
            import { Component } from 'san'
            import { Component as c } from 'san'
            `
            const imports = [...findESMImports(pm(script))]
            expect(imports).toHaveLength(2)
            expect(imports[0]).toEqual(['Component', 'san', 'Component'])
            expect(imports[1]).toEqual(['c', 'san', 'Component'])
        })
        it('should parse default import in ES module', () => {
            const script = 'import XComponent from "./x-component"'
            const imports = [...findESMImports(pm(script))]
            expect(imports).toHaveLength(1)
            expect(imports[0]).toEqual(['XComponent', './x-component', 'default'])
        })
    })
    describe('.findScriptRequires()', () => {
        it('should parse const {Component, defineComponent} = require', () => {
            const script = 'const {Component, defineComponent} = require("san")'
            const imports = [...findScriptRequires(p(script))]
            expect(imports).toHaveLength(2)
            expect(imports[0]).toEqual(['Component', 'san', 'Component'])
            expect(imports[1]).toEqual(['defineComponent', 'san', 'defineComponent'])
        })
        it('should parse const san = require("san")', () => {
            const script = 'const san = require("san")'
            const imports = [...findScriptRequires(p(script))]
            expect(imports).toHaveLength(1)
            expect(imports[0]).toEqual(['san', 'san', 'default'])
        })
        it('should parse const {defineComponent: def} = require("san")', () => {
            const script = 'const {defineComponent: def} = require("san")'
            const imports = [...findScriptRequires(p(script))]
            expect(imports).toHaveLength(1)
            expect(imports[0]).toEqual(['def', 'san', 'defineComponent'])
        })
        it('should parse const define = require("san").defineComponent', () => {
            const script = 'const define = require("san").defineComponent'
            const imports = [...findScriptRequires(p(script))]
            expect(imports).toHaveLength(1)
            expect(imports[0]).toEqual(['define', 'san', 'defineComponent'])
        })
    })
    describe('.findExportNames()', () => {
        it('should ignore export class', () => {
            const script = 'export class Foo {}'
            expect(findExportNames(pm(script))).toHaveLength(0)
        })
        it('should find export const foo = bar', () => {
            const script = 'export const foo = bar'
            const node = parse(script, { sourceType: 'module', ecmaVersion: 2020 }) as any
            expect(findExportNames(node)).toEqual([['bar', 'foo']])
        })
        it('should find default export', () => {
            const script = 'export default foo'
            const node = parse(script, { sourceType: 'module', ecmaVersion: 2020 }) as any
            expect(findExportNames(node)).toEqual([['foo', 'default']])
        })
        it('should find module.exports = foo', () => {
            const script = 'module.exports = foo'
            expect(findExportNames(pm(script))).toEqual([['foo', 'default']])
        })
        it('should find module.exports.foo', () => {
            const script = 'module.exports.foo = bar'
            expect(findExportNames(p(script))).toEqual([['bar', 'foo']])
        })
        it('should find module.exports = {...}', () => {
            const script = 'module.exports = { foo: bar }'
            expect(findExportNames(p(script))).toEqual([['bar', 'foo']])
        })
    })
    describe('.getStringValue()', () => {
        it('should throw if not parsed correctly', () => {
            const script = 'function a() {}'
            const fn = p(script).body[0]
            expect(() => getStringValue(fn)).toThrow('[0,15) cannot evaluate string value')
        })
    })
    describe('.getLiteralValue()', () => {
        it('should thorw if not supported', () => {
            const script = 'function a() {}'
            const fn = p(script).body[0]
            expect(() => getLiteralValue(fn)).toThrow('[0,15) expected literal')
        })
    })
})
