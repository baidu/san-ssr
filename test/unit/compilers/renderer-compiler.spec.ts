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
        it('should call initData() in compile time for ComponentClass input', () => {
            const ComponentClass = defineComponent({
                template: '<div></div>',
                initData () {
                    return { foo: 'FOO' }
                }
            })
            const sourceFile = new ComponentClassParser(ComponentClass, '/tmp/foo.js').parse()
            const compiler = new RendererCompiler({})
            const renderer = compiler.compileToRenderer(sourceFile.componentInfos[0])
            const dataFoo = expect.objectContaining({
                kind: SyntaxKind.BinaryExpression,
                lhs: {
                    kind: SyntaxKind.Identifier,
                    name: 'data'
                },
                op: '[]',
                rhs: {
                    kind: SyntaxKind.Literal,
                    value: 'foo'
                }
            })
            expect(renderer.body).toEqual(expect.arrayContaining([expect.objectContaining({
                kind: SyntaxKind.AssignmentStatement,
                lhs: dataFoo,
                rhs: {
                    kind: SyntaxKind.BinaryExpression,
                    lhs: dataFoo,
                    op: '||',
                    rhs: {
                        kind: SyntaxKind.Literal,
                        value: 'FOO'
                    }

                }
            })]))
        })
        it('should not throw if initData() returned a falsy value', () => {
            const ComponentClass = defineComponent({
                template: '<div></div>',
                initData () {
                    return null
                }
            })
            const { componentInfos } = new ComponentClassParser(ComponentClass, '/tmp/foo.js').parse()
            const info = componentInfos[0]
            const compiler = new RendererCompiler({})
            const spy = jest.spyOn(info.proto, 'initData')
            expect(() => compiler.compileToRenderer(info)).not.toThrow()
            expect(spy).toHaveBeenCalled()
        })
    })
})
