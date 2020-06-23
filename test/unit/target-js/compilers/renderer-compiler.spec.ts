import { RendererCompiler } from '../../../../src/target-js/compilers/renderer-compiler'
import { defineComponent } from 'san'
import { ComponentClassParser } from '../../../../src/parsers/component-class-parser'

describe('target-js/compilers/renderer-compiler', () => {
    describe('#compileComponentRendererBody()', () => {
        it('should compile a single div renderer', () => {
            const ComponentClass = defineComponent({
                template: '<div></div>',
                foo: [1, x => x]
            })
            const sourceFile = new ComponentClassParser(ComponentClass, '/tmp/foo.js').parse()
            const compiler = new RendererCompiler(false)
            compiler.compileComponentRendererBody(sourceFile.componentInfos[0])
            expect(compiler.emitter.fullText()).toContain(`html += "<div>"`)
            expect(compiler.emitter.fullText()).toContain(`html += "</div>"`)
        })
    })
    describe('#emitInitDataInCompileTime()', () => {
        it('should call initData() in compile time', () => {
            const ComponentClass = defineComponent({
                template: '<div></div>',
                initData () {
                    return { foo: 'bar' }
                }
            })
            const sourceFile = new ComponentClassParser(ComponentClass, '/tmp/foo.js').parse()
            const compiler = new RendererCompiler(false)
            compiler.emitInitDataInCompileTime(sourceFile.componentInfos[0])
            expect(compiler.emitter.fullText()).toMatch(/ctx.data\["foo"\] = ctx\.data\["foo"\] \|\|/)
        })
        it('should default to {} if initData() returned falsy value', () => {
            const ComponentClass = defineComponent({
                template: '<div></div>',
                initData () {
                    return null
                }
            })
            const sourceFile = new ComponentClassParser(ComponentClass, '/tmp/foo.js').parse()
            const compiler = new RendererCompiler(false)
            compiler.emitInitDataInCompileTime(sourceFile.componentInfos[0])
            expect(compiler.emitter.fullText()).not.toMatch(/ctx.data\["foo"\] = ctx\.data\["foo"\] \|\|/)
        })
    })
})
