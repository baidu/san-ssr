import { refactorMemberInitializer } from '../../../src/target-php/transformers/refactor-member-initializer'
import { Project } from 'ts-morph'

describe('refactorMemberInitializer()', function () {
    const project = new Project()

    it('should skip string literal static initializer', function () {
        const sourceFile = project.createSourceFile('/tmp/static-str-literal', `
        class Foo {
            static staticLiteralStr: string = "foo"
        }`)
        const clazz = sourceFile.getClass('Foo')
        for (const prop of clazz.getProperties()) {
            refactorMemberInitializer(clazz, prop)
        }
        sourceFile.formatText()
        const text = sourceFile.getFullText()

        expect(text).toContain(`static staticLiteralStr: string = "foo"`)
        expect(text).not.toContain(`Foo.staticLiteralStr =`)
    })

    it('should refactor string variable static initializer', function () {
        const sourceFile = project.createSourceFile('/tmp/static-str-var', `
        const str = "foo"
        class Foo {
            static staticLiteralStr: string = str
        }`)
        const clazz = sourceFile.getClass('Foo')
        for (const prop of clazz.getProperties()) {
            refactorMemberInitializer(clazz, prop)
        }
        sourceFile.formatText()
        const text = sourceFile.getFullText()

        expect(text).toContain(`static staticLiteralStr: string`)
        expect(text).toContain(`Foo.staticLiteralStr = str`)
    })

    it('should skip string literal initializer', function () {
        const sourceFile = project.createSourceFile('/tmp/str-literal', `
        class Foo {
            literalStr: string = "str"
        }`)
        const clazz = sourceFile.getClass('Foo')
        for (const prop of clazz.getProperties()) {
            refactorMemberInitializer(clazz, prop)
        }
        const text = sourceFile.getFullText()

        expect(text).toContain(`literalStr: string = "str"`)
        expect(text).not.toContain(`constructor()`)
    })

    it('should refactor string literal initializer', function () {
        const sourceFile = project.createSourceFile('/tmp/str-var', `
        const str = "foo"
        class Foo {
            literalStr: string = str
        }`)
        const clazz = sourceFile.getClass('Foo')
        for (const prop of clazz.getProperties()) {
            refactorMemberInitializer(clazz, prop)
        }
        sourceFile.formatText()
        const text = sourceFile.getFullText()

        expect(text).toContain(`literalStr: string\n`)
        expect(text).toContain(`constructor() {`)
        expect(text).toContain(`super()`)
        expect(text).toContain(`this.literalStr = str`)
    })
})
