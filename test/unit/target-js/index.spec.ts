import ToJSCompiler from '../../../src/target-js/index'
import { TypeScriptSanParser } from '../../../src/parsers/typescript-san-parser'
import { SanProject } from '../../../src/models/san-project'

describe('ToJSCompiler', () => {
    const proj = new SanProject()
    const cc = new ToJSCompiler(proj)

    describe('#compileToSource()', () => {
        it('should not throw if entry comopennt not found', () => {
            const sourceFile = proj.tsProject.createSourceFile('foo.ts', `
                import { Component } from 'san';
                class Foo extends Component {}
            `)
            expect(() => cc.compileToSource(new TypeScriptSanParser(sourceFile).parse())).not.toThrow()
        })
    })
})
