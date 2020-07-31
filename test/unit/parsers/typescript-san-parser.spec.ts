import { TypeScriptSanParser } from '../../../src/parsers/typescript-san-parser'
import { Project } from 'ts-morph'

describe('.parseFromTypeScript()', () => {
    let proj
    beforeEach(() => {
        proj = new Project({ addFilesFromTsConfig: false })
    })
    it('should parse a typescript file with single component', () => {
        const file = proj.createSourceFile('foo.ts', `
        import { Component } from 'san'
        class Foo extends Component {}
        export default class Bar extends Component {}
        `)
        const sourceFile = new TypeScriptSanParser().parse(file)
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
        const sourceFile = new TypeScriptSanParser().parse(file)
        expect(sourceFile.componentInfos).toHaveLength(1)

        const [info] = sourceFile.componentInfos
        expect(info.classDeclaration.getConstructors()).toHaveLength(0)
    })
})
