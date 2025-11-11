import {
    getPropertyStringArrayValue, getObjectLiteralPropertyKeys, getChildComponents, getPropertyStringValue,
    getComponentClassIdentifier, isChildClassOf
} from '../../../src/ast/ts-ast-util'
import { Project } from 'ts-morph'

describe('utils/ts-ast-util', function () {
    let proj: Project
    beforeEach(() => {
        proj = new Project({ skipAddingFilesFromTsConfig: true })
    })
    describe('.getPropertyStringArrayValue()', function () {
        it('should get array of strings', () => {
            const file = proj.createSourceFile('foo.ts', `
            class Foo {
                delimiters = ["{{", "}}"]
            }`)
            expect(getPropertyStringArrayValue(file.getClass('Foo'), 'delimiters')).toEqual(['{{', '}}'])
        })
        it('should return undefined if property not assigned', () => {
            const file = proj.createSourceFile('foo.ts', `
            class Foo {
                delimiters
            }`)
            expect(getPropertyStringArrayValue(file.getClass('Foo'), 'delimiters')).toBeUndefined()
        })
        it('should throw if not array literal', () => {
            const file = proj.createSourceFile('foo.ts', `
            let foo = [];
            class Foo {
                delimiters = foo
            }`)
            expect(() => getPropertyStringArrayValue(file.getClass('Foo'), 'delimiters')).toThrow(/invalid "delimiters": "foo", array literal expected/)
        })
    })
    describe('.getObjectLiteralPropertyKeys()', function () {
        it('should support method declaration, property assignment, and shorthanded', () => {
            const file = proj.createSourceFile('foo.ts', `
            function b() {}
            class Foo {
                computed = {
                    a(){},
                    'x-b': function () {},
                    b
                }
            }`)
            expect(getObjectLiteralPropertyKeys(file.getClass('Foo'), 'computed')).toEqual(['a', 'x-b', 'b'])
        })
        it('should throw for spread', () => {
            const file = proj.createSourceFile('foo.ts', 'let a = {}; class Foo { computed = {...a} }')
            expect(() => getObjectLiteralPropertyKeys(file.getClass('Foo'), 'computed'))
                .toThrow('object property not recognized')
        })
    })
    describe('.getChildComponents()', function () {
        const mockFn = () => {
            return {} as any
        }
        it('should get one single child component', () => {
            proj.createSourceFile('b.ts', 'export class B {}')
            const file = proj.createSourceFile('foo.ts', 'import {B} from \'./b\'; class Foo { components = { b: B } }')
            expect([...getChildComponents(file.getClass('Foo'), undefined, mockFn).entries()]).toEqual([
                ['b', { specifier: './b', id: 'B' }]
            ])
        })
        it('should get default child component', () => {
            proj.createSourceFile('b.ts', 'export class B {}')
            const file = proj.createSourceFile('foo.ts', 'import B from \'./b\'; class Foo { components = { b: B } }')
            expect([...getChildComponents(file.getClass('Foo'), undefined, mockFn).entries()]).toEqual([
                ['b', { specifier: './b', id: 'default' }]
            ])
        })
        it('should allow string literal as key', () => {
            proj.createSourceFile('b.ts', 'export class B {}')
            const file = proj.createSourceFile(
                'foo.ts', 'import B from \'./b\'; class Foo { components = { \'x-b\': B } }'
            )
            expect([...getChildComponents(file.getClass('Foo'), undefined, mockFn).entries()]).toEqual([
                ['x-b', { specifier: './b', id: 'default' }]
            ])
        })
        it('should allow child Components from current file', () => {
            const file = proj.createSourceFile('foo.ts', 'class B {}; class Foo { components = { \'x-b\': B } }')
            expect([...getChildComponents(file.getClass('Foo'), undefined, mockFn).entries()]).toEqual([
                ['x-b', { specifier: '.', id: 'B' }]
            ])
        })
        it('should throw for items not of PropertyAssignment type', () => {
            const file = proj.createSourceFile('foo.ts', 'class B {}; class Foo { components = { B } }')
            expect(() => getChildComponents(file.getClass('Foo'), undefined, mockFn)).toThrow('"B" not supported')
        })
        it('should throw for invalid string as value', () => {
            proj.createSourceFile('b.ts', 'export class B {}')
            const file = proj.createSourceFile(
                'foo.ts', 'import B from \'./b\'; class Foo { components = { b: \'B\' } }'
            )
            expect(() => getChildComponents(file.getClass('Foo'), undefined, mockFn)).toThrow('Invalid component for b')
        })
    })

    describe('.getPropertyStringValue()', function () {
        it('should return undefined if member not exist', () => {
            const file = proj.createSourceFile('foo.ts', 'class Foo { }')
            expect(getPropertyStringValue(file.getClass('Foo'), 'template')).toEqual(undefined)
        })
        it('should return undefined if member not initialized', () => {
            const file = proj.createSourceFile('foo.ts', 'class Foo { template: string }')
            expect(getPropertyStringValue(file.getClass('Foo'), 'template')).toEqual(undefined)
        })
        it('should return defaultValue if member not exist', () => {
            const file = proj.createSourceFile('foo.ts', 'class Foo { }')
            expect(getPropertyStringValue(file.getClass('Foo'), 'template', '')).toEqual('')
        })
        it('should work for member with a stirng literal initializer', () => {
            const file = proj.createSourceFile('foo.ts', 'class Foo { template = \'foo\' }')
            expect(getPropertyStringValue(file.getClass('Foo'), 'template')).toEqual('foo')
        })
        it('should work for static member with a stirng literal initializer', () => {
            const file = proj.createSourceFile('foo.ts', 'class Foo { static template = \'foo\' }')
            expect(getPropertyStringValue(file.getClass('Foo'), 'template')).toEqual('foo')
        })
        it('should work for static member with a const value initializer', () => {
            const file = proj.createSourceFile('foo.ts', 'const t = "foo"; class Foo { static template = t }')
            expect(getPropertyStringValue(file.getClass('Foo'), 'template')).toEqual('foo')
        })
        it('should throw if initialized by a value that initialized by complex expression', () => {
            const file = proj.createSourceFile('foo.ts', 'let t = "a" + "b"; class Foo { static template = t }')
            expect(() => getPropertyStringValue(file.getClass('Foo'), 'template'))
                .toThrow('"\\"a\\" + \\"b\\"" not supported, specify a string literal for "template"')
        })
        it('should throw if initialized by a value that not initialized', () => {
            const file = proj.createSourceFile('foo.ts', 'let t; class Foo { static template = t }')
            expect(() => getPropertyStringValue(file.getClass('Foo'), 'template'))
                .toThrow(/"let t" not supported, specify a string literal for "template"/)
        })
        it('should throw otherwise', () => {
            const file = proj.createSourceFile('foo.ts', 'const t = "foo"; class Foo { static template = 1 * 2 }')
            expect(() => getPropertyStringValue(file.getClass('Foo'), 'template'))
                .toThrow('invalid "template" property')
        })
    })
    const defaultSanReferenceInfo = {
        moduleName: ['san'],
        className: ['Component'],
        methodName: ['defineComponent']
    }
    describe('.getComponentClassIdentifier()', function () {
        it('should get component class identifier', () => {
            const file = proj.createSourceFile('foo.ts', 'import { Component } from \'san\'')
            expect(getComponentClassIdentifier(file, defaultSanReferenceInfo)).toEqual('Component')
        })
        it('should return undefined if "san" not imported', () => {
            const file = proj.createSourceFile('foo.ts', 'import { resolve } from \'path\'')
            expect(getComponentClassIdentifier(file, defaultSanReferenceInfo)).toBeUndefined()
        })
        it('should return undefined if Component not imported', () => {
            const file = proj.createSourceFile('foo.ts', 'import { ANode } from \'san\'')
            expect(getComponentClassIdentifier(file, defaultSanReferenceInfo)).toBeUndefined()
        })
        it('should get component class identifier for import as', () => {
            const file = proj.createSourceFile('foo.ts', 'import { Component as SanComponent } from \'san\'')
            expect(getComponentClassIdentifier(file, defaultSanReferenceInfo)).toEqual('SanComponent')
        })
        it('should get component class identifier for import default', () => {
            const file = proj.createSourceFile('foo.ts', 'import Component from \'san\'')
            expect(getComponentClassIdentifier(file, defaultSanReferenceInfo)).toEqual('Component')
        })
    })
    describe('.isChildClassOf()', function () {
        it('should return true if is lhs is child class of rhs', () => {
            const file = proj.createSourceFile('foo.ts', `
            class Bar {}
            class Foo extends Bar {}
            `)
            expect(isChildClassOf(file.getClass('Foo'), 'Bar')).toBeTruthy()
        })
        it('should return false if is lhs is not child class of rhs', () => {
            const file = proj.createSourceFile('foo.ts', `
            class Bar {}
            class Coo {}
            class Foo extends Bar {}
            `)
            expect(isChildClassOf(file.getClass('Foo'), 'Coo')).toBeFalsy()
        })
        it('should return false if rhs class not exist', () => {
            const file = proj.createSourceFile('foo.ts', `
            class Bar {}
            class Foo extends Bar {}
            `)
            expect(isChildClassOf(file.getClass('Foo'), 'Coo')).toBeFalsy()
        })
        it('should return false if lhs has no parent class', () => {
            const file = proj.createSourceFile('foo.ts', `
            class Bar {}
            class Foo {}
            `)
            expect(isChildClassOf(file.getClass('Foo'), 'Bar')).toBeFalsy()
        })
    })
})
