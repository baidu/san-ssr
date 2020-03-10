import { getComponentClassIdentifier, isChildClassOf } from '../../../src/utils/ast-util'
import { Project } from 'ts-morph'

describe('utils/ast-util', function () {
    describe('.getComponentClassIdentifier()', function () {
        it('should get component class identifier', () => {
            const proj = new Project({ addFilesFromTsConfig: false })
            const file = proj.createSourceFile('foo.ts', `import { Component } from 'san'`)
            expect(getComponentClassIdentifier(file)).toEqual('Component')
        })
        it('should return undefined if Component not imported', () => {
            const proj = new Project({ addFilesFromTsConfig: false })
            const file = proj.createSourceFile('foo.ts', `import { ANode } from 'san'`)
            expect(getComponentClassIdentifier(file)).toBeUndefined()
        })
        it('should get component class identifier for import as', () => {
            const proj = new Project({ addFilesFromTsConfig: false })
            const file = proj.createSourceFile('foo.ts', `import { Component as SanComponent } from 'san'`)
            expect(getComponentClassIdentifier(file)).toEqual('SanComponent')
        })
    })
    describe('.isChildClassOf()', function () {
        it('should return true if is lhs is child class of rhs', () => {
            const proj = new Project({ addFilesFromTsConfig: false })
            const file = proj.createSourceFile('foo.ts', `
            class Bar {}
            class Foo extends Bar {}
            `)
            expect(isChildClassOf(file.getClass('Foo'), 'Bar')).toBeTruthy()
        })
        it('should return false if is lhs is not child class of rhs', () => {
            const proj = new Project({ addFilesFromTsConfig: false })
            const file = proj.createSourceFile('foo.ts', `
            class Bar {}
            class Coo {}
            class Foo extends Bar {}
            `)
            expect(isChildClassOf(file.getClass('Foo'), 'Coo')).toBeFalsy()
        })
        it('should return false if rhs class not exist', () => {
            const proj = new Project({ addFilesFromTsConfig: false })
            const file = proj.createSourceFile('foo.ts', `
            class Bar {}
            class Foo extends Bar {}
            `)
            expect(isChildClassOf(file.getClass('Foo'), 'Coo')).toBeFalsy()
        })
        it('should return false if lhs has no parent class', () => {
            const proj = new Project({ addFilesFromTsConfig: false })
            const file = proj.createSourceFile('foo.ts', `
            class Bar {}
            class Foo {}
            `)
            expect(isChildClassOf(file.getClass('Foo'), 'Bar')).toBeFalsy()
        })
    })
})
