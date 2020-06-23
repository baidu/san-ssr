import { ComponentClassCompiler } from '../../../../src/target-js/compilers/component-compiler'
import { defineComponent } from 'san'
import { ComponentClassParser } from '../../../../src/parsers/component-class-parser'

describe('target-js/compilers/renderer-compiler', () => {
    describe('#compileComponentPrototypeSource()', () => {
        it('should compile array prototype to source', () => {
            const ComponentClass = defineComponent({
                template: '<div></div>',
                foo: [1, x => x]
            })
            const sourceFile = new ComponentClassParser(ComponentClass).parse()
            const compiler = new ComponentClassCompiler()
            compiler.compile(sourceFile.componentInfos[0])
            expect(compiler.emitter.fullText()).toEqual(`foo: [
    1,
    x => x
],
`)
        })
    })
})
