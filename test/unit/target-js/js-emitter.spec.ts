import { JSEmitter } from '../../../src/target-js/js-emitter'
import { SyntaxKind, FunctionDefinition, VariableDefinition } from '../../../src/ast/renderer-ast-dfn'
import { L } from '../../../src/ast/renderer-ast-util'

describe('JSEmitter', function () {
    let emitter: JSEmitter

    beforeEach(function () {
        emitter = new JSEmitter()
    })

    describe('#writeSyntaxNode()', function () {
        it('should emit Date as new Date expression', () => {
            emitter.writeSyntaxNode({
                kind: SyntaxKind.Literal,
                value: { foo: 'bar', date: new Date('2020-12-16T09:45:38.897Z') }
            })
            expect(emitter.fullText()).toEqual('{"foo":"bar","date":new Date(1608111938897)}')
        })
        it('should emit url filter', () => {
            emitter.writeSyntaxNode({
                kind: SyntaxKind.EncodeURIComponent,
                value: { kind: SyntaxKind.Literal, value: 'foo' }
            })
            expect(emitter.fullText()).toEqual('encodeURIComponent("foo")')
        })
        it('should emit variable definition without initial value', () => {
            emitter.writeSyntaxNode({
                kind: SyntaxKind.VariableDefinition,
                name: 'foo'
            })
            expect(emitter.fullText()).toEqual('let foo')
        })
        it('should emit function', () => {
            emitter.writeSyntaxNode({
                kind: SyntaxKind.FunctionDefinition,
                name: 'render',
                args: [],
                body: []
            })
            expect(emitter.fullText()).toEqual('function render () {}')
        })
        it('should throw if kind not supported', () => {
            expect(() => emitter.writeSyntaxNode({ kind: 88888 } as any)).toThrow(/not supported/)
        })
    })
    describe('write function', function () {
        it('should write function without arguments', function () {
            emitter.writeFunction()

            expect(emitter.fullText()).toEqual('function () {\n}')
        })

        it('should write function with only name', function () {
            emitter.writeFunction('bar')

            expect(emitter.fullText()).toEqual('function bar () {\n}')
        })

        it('should write function with arguments', function () {
            emitter.writeFunction('bar', ['a', 'b'], function () {
                emitter.writeLine('echo')
            })

            expect(emitter.fullText()).toEqual('function bar (a, b) {\n    echo\n}')
        })

        it('should write function definition with initial', function () {
            emitter.writeFunctionDefinition(new FunctionDefinition(
                'bar',
                [new VariableDefinition('a', L({}))],
                []
            ))

            expect(emitter.fullText()).toEqual('function bar (a = {}) {}')
        })
    })

    describe('write block', function () {
        it('should write block with callback', function () {
            emitter.writeBlock('foo', function () {
                emitter.writeLine('bar')
            })

            expect(emitter.fullText()).toEqual('foo {\n    bar\n}\n')
        })
        it('should write block without callback', function () {
            emitter.writeBlock('foo')

            expect(emitter.fullText()).toEqual('foo {\n}\n')
        })
        it('should write block without expr', function () {
            emitter.writeBlock('')

            expect(emitter.fullText()).toEqual('{\n}\n')
        })
    })
})
