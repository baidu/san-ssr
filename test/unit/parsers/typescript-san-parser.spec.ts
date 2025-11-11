import { TypeScriptSanParser } from '../../../src/parsers/typescript-san-parser'
import { Project } from 'ts-morph'

const defaultOptions = {
    sanReferenceInfo: {
        moduleName: ['san'],
        className: ['Component'],
        methodName: ['defineComponent']
    }
}
describe('.parseFromTypeScript()', () => {
    let proj: Project
    beforeEach(() => {
        proj = new Project({ skipAddingFilesFromTsConfig: true })
    })
    it('should parse a typescript file with single component', () => {
        const file = proj.createSourceFile('foo.ts', `
        import { Component } from 'san'
        class Foo extends Component {}
        export default class Bar extends Component {}
        `)
        const sourceFile = new TypeScriptSanParser().parse(file, defaultOptions)
        expect(sourceFile.componentInfos[0].classDeclaration.isDefaultExport()).toBe(false)
        expect(sourceFile.componentInfos[1].classDeclaration.isDefaultExport()).toBe(true)
    })

    it('should remove constructors', function () {
        const file = proj.createSourceFile('foo.ts', `
            import { Component } from 'san'
            function foo () {}
            export class MyComponent extends Component {
                foo = 'bar'
                constructor() {
                    foo()
                }
            }
        `)
        const sourceFile = new TypeScriptSanParser().parse(file, defaultOptions)
        expect(sourceFile.componentInfos).toHaveLength(1)

        const [info] = sourceFile.componentInfos
        expect(info.classDeclaration.getConstructors()).toHaveLength(0)
    })

    it('should return empty component infos if san.Component not imported', function () {
        const file = proj.createSourceFile('foo.ts', `
            import { foo } from 'foo'
            export class Foo extends Component {
                foo = 'bar'
                constructor() {
                    foo()
                }
            }
        `)
        const sourceFile = new TypeScriptSanParser().parse(file, defaultOptions)
        expect(sourceFile.componentInfos).toHaveLength(0)
    })

    it('should throw if prop of literal object is not property assignment', function () {
        const file = proj.createSourceFile('foo.ts', `
            import { Component } from 'san'
            const bar = {
                template: '<div>bar</div>'
            }
            export class MyComponent extends Component {
                static components = {
                    'v-bar': { ...bar }
                }
            }
        `)
        expect(() => {
            new TypeScriptSanParser().parse(file, defaultOptions)
        }).toThrow()
    })
})
