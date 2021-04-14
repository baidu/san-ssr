import { RendererCompiler } from '../../../src/compilers/renderer-compiler'
import { defineComponent } from 'san'
import { ComponentClassParser } from '../../../src/parsers/component-class-parser'
import { SyntaxKind } from '../../../src/ast/renderer-ast-node'
import { matchHTMLAddEqual } from '../../stub/util'

describe('compilers/renderer-compiler', () => {
    describe('#compileToRenderer()', () => {
        it('should compile a single div renderer', () => {
            const ComponentClass = defineComponent({
                template: '<div></div>',
                foo: [1, x => x]
            })
            const sourceFile = new ComponentClassParser(ComponentClass, '/tmp/foo.js').parse()
            const compiler = new RendererCompiler({})
            const body = [...compiler.compileToRenderer(sourceFile.componentInfos[0]).body]
            expect(body.pop()).toEqual(expect.objectContaining({
                kind: SyntaxKind.ReturnStatement,
                value: {
                    name: 'html',
                    kind: SyntaxKind.Identifier
                }
            }))
            expect(body.pop()).toEqual(matchHTMLAddEqual({
                value: '</div>',
                kind: SyntaxKind.Literal
            }))
        })
    })
})
