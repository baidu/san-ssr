import {
    isTypedSanSourceFile, JSSanSourceFile, TypedSanSourceFile, DynamicSanSourceFile
} from '../../../src/models/san-source-file'
import { TypedComponentInfo } from '../../../src/models/component-info'
import { Project } from 'ts-morph'
import { ANode } from 'san'

describe('TypedSanSourceFile', function () {
    const proj = new Project({ skipAddingFilesFromTsConfig: true })
    const sourceFile = proj.createSourceFile('foo.ts', `
        import { Component } from 'san';
        class Foo extends Component {}
    `)

    describe('#getFilePath()', function () {
        it('should return file path', () => {
            const file = new TypedSanSourceFile([], sourceFile)
            expect(file.getFilePath()).toMatch(/.*foo.ts$/)
        })
    })
    describe('#getComponentClassDeclarations()', function () {
        it('should find the component class', () => {
            const info = new TypedComponentInfo('id', null as ANode, new Map(), undefined, true, true, sourceFile.getClass('Foo'))
            const file = new TypedSanSourceFile([info], sourceFile)
            const decls = [...file.getComponentClassDeclarations()]
            expect(decls).toHaveLength(1)
            expect(decls[0].getName()).toEqual('Foo')
        })
    })
})

describe('DynamicSanSourceFile', function () {
    const file = new DynamicSanSourceFile([], 'foo.js', {} as any)

    describe('#getFilePath()', function () {
        it('should return file path', () => {
            expect(file.getFilePath()).toEqual('foo.js')
        })
    })
})

describe('JSSanSourceFile', function () {
    const file = new JSSanSourceFile('foo.js', '', [])

    describe('#getFilePath()', function () {
        it('should return file path', () => {
            expect(file.getFilePath()).toEqual('foo.js')
        })
    })
})

describe('.isTypedComopnentInfo()', function () {
    it('should return true for typed component info', () => {
        const proj = new Project({ skipAddingFilesFromTsConfig: true })
        const sourceFile = proj.createSourceFile('foo.ts', 'class Foo {}')
        const file = new TypedSanSourceFile([], sourceFile)
        expect(isTypedSanSourceFile(file)).toBeTruthy()
    })
    it('should return false for dynamic component info', () => {
        const file = new DynamicSanSourceFile([], 'foo.js', {} as any)
        expect(isTypedSanSourceFile(file)).toBeFalsy()
    })
})
