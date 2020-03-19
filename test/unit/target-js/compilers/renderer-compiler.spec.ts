import { RendererCompiler } from '../../../../src/target-js/compilers/renderer-compiler'
import { defineComponent } from 'san'
import { ComponentInfo } from '../../../../src/models/component-info'

describe('target-js/compilers/renderer-compiler', () => {
    describe('#compileComponentPrototypeSource()', () => {
        it('should compile array prototype to source', () => {
            const ComponentClass = defineComponent({
                template: '<div></div>',
                foo: [1, x => x]
            })
            const info = new ComponentInfo({
                component: new ComponentClass(),
                componentClass: ComponentClass
            } as any)
            const compiler = new RendererCompiler(info, false, {} as any)
            compiler.compileComponentPrototypeSource()
            expect(compiler.emitter.fullText()).toEqual(`foo: [
    1,
    x => x
],
filters: {
},
computed: {
},
tagName: "div"
`)
        })
    })
})
