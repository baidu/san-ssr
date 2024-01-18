import { ElementCompiler } from '../../../src/compilers/element-compiler'
import { defineComponent, parseTemplate } from 'san'
import { SyntaxKind } from '../../../src/ast/renderer-ast-dfn'
import { CTX_DATA } from '../../../src/ast/renderer-ast-util'
import { matchHTMLAddEqual } from '../../stub/util'
import { DynamicComponentInfo } from '../../../src'

describe('compilers/element-compiler', () => {
    let compiler
    beforeEach(() => {
        compiler = new ElementCompiler(null as any, { next: () => 'foo' } as any)
    })

    describe('#tagStart()', () => {
        it('should compile a simple <div> with customized tagName', () => {
            const template = '<div></div>'
            const aNode = parseTemplate(template)
            const component = defineComponent({
                template
            })
            const info = new DynamicComponentInfo('id', aNode, new Map(), 'normal', undefined, true, true, component)
            const nodes = [...compiler.tagStart(aNode, info)]
            expect(nodes).toEqual(expect.arrayContaining([
                matchHTMLAddEqual({ kind: SyntaxKind.Literal, value: '<' }),
                matchHTMLAddEqual({ kind: SyntaxKind.Identifier, name: 'tagName' }),
                matchHTMLAddEqual({ kind: SyntaxKind.Literal, value: '>' })
            ]))
        })
        it('should compile empty textarea', () => {
            const template = '<div><textarea></textarea></div>'
            const aNode = parseTemplate(template).children[0].children[0]
            const component = defineComponent({
                template
            })
            const info = new DynamicComponentInfo('id', aNode, new Map(), 'normal', undefined, true, true, component)
            const nodes = [...compiler.tagStart(aNode, info)]
            expect(nodes).toEqual(expect.arrayContaining([
                matchHTMLAddEqual({ kind: SyntaxKind.Literal, value: '<textarea' }),
                matchHTMLAddEqual({ kind: SyntaxKind.Literal, value: '>' })
            ]))
        })
        it('should compile input with readonly', () => {
            const template = '<div><input readonly></div>'
            const aNode = parseTemplate(template).children[0].children[0]
            const component = defineComponent({
                template
            })
            const info = new DynamicComponentInfo('id', aNode, new Map(), 'normal', undefined, true, true, component)
            const nodes = [...compiler.tagStart(aNode, info)]
            expect(nodes).toHaveLength(3)
            expect(nodes).toEqual(expect.arrayContaining([
                matchHTMLAddEqual({ kind: SyntaxKind.Literal, value: '<input' }),
                matchHTMLAddEqual({ kind: SyntaxKind.Literal, value: ' readonly' }),
                matchHTMLAddEqual({ kind: SyntaxKind.Literal, value: '>' })
            ]))
        })
        it('should compile input with readonly', () => {
            const template = '<div><input readonly="{{foo}}"></div>'
            const aNode = parseTemplate(template).children[0].children[0]
            const component = defineComponent({
                template
            })
            const info = new DynamicComponentInfo('id', aNode, new Map(), 'normal', undefined, true, true, component)
            const nodes = [...compiler.tagStart(aNode, info)]
            expect(nodes).toEqual(expect.arrayContaining([matchHTMLAddEqual({
                kind: SyntaxKind.HelperCall,
                name: 'boolAttrFilter',
                args: [
                    { kind: SyntaxKind.Literal, value: 'readonly' },
                    {
                        kind: SyntaxKind.BinaryExpression,
                        lhs: CTX_DATA,
                        op: '[]',
                        rhs: { kind: SyntaxKind.Literal, value: 'foo' }
                    }
                ]
            })]))
        })
        it('should treat checked as a normal property for non-input elements', () => {
            const template = '<div><span checked="{{foo}}"></span></div>'
            const aNode = parseTemplate(template).children[0].children[0]
            const component = defineComponent({
                template
            })
            const info = new DynamicComponentInfo('id', aNode, new Map(), 'normal', undefined, true, true, component)
            const nodes = [...compiler.tagStart(aNode, info)]
            expect(nodes).toEqual(expect.arrayContaining([matchHTMLAddEqual({
                kind: SyntaxKind.HelperCall,
                name: 'attrFilter',
                args: expect.arrayContaining([
                    { kind: SyntaxKind.Literal, value: 'checked' }
                ])
            })]))
        })
        it('should treat checked as a normal property if input[type] not specified', () => {
            const template = '<div><input checked="{{foo}}" value="1"></div>'
            const aNode = parseTemplate(template).children[0].children[0]
            const component = defineComponent({
                template
            })
            const info = new DynamicComponentInfo('id', aNode, new Map(), 'normal', undefined, true, true, component)
            const nodes = [...compiler.tagStart(aNode, info)]
            expect(nodes).toEqual(expect.arrayContaining([matchHTMLAddEqual({
                kind: SyntaxKind.HelperCall,
                name: 'attrFilter',
                args: expect.arrayContaining([
                    { kind: SyntaxKind.Literal, value: 'checked' }
                ])
            })]))
        })
        it('should treat checked as a normal property if type not recognized', () => {
            const template = '<div><input checked="{{foo}}" value="1" type="bar"></div>'
            const aNode = parseTemplate(
                template
            ).children[0].children[0]
            const component = defineComponent({
                template
            })
            const info = new DynamicComponentInfo('id', aNode, new Map(), 'normal', undefined, true, true, component)
            const nodes = [...compiler.tagStart(aNode, info)]
            expect(nodes).toEqual(expect.arrayContaining([matchHTMLAddEqual({
                kind: SyntaxKind.HelperCall,
                name: 'attrFilter',
                args: expect.arrayContaining([
                    { kind: SyntaxKind.Literal, value: 'checked' }
                ])
            })]))
        })
    })
    describe('#inner()', () => {
        it('should compile empty textarea', () => {
            const aNode = parseTemplate('<div><textarea></textarea></div>').children[0].children[0]
            const nodes = [...compiler.inner(aNode)]
            expect(nodes).toHaveLength(0)
        })
    })
    describe('#tagEnd()', () => {
        it('should compile a simple </div> with customized tagName', () => {
            const aNode = parseTemplate('<div></div>')
            const nodes = [...compiler.tagEnd(aNode)]
            expect(nodes).toEqual(expect.arrayContaining([
                matchHTMLAddEqual({ kind: SyntaxKind.Literal, value: '</' }),
                matchHTMLAddEqual({ kind: SyntaxKind.Identifier, name: 'tagName' }),
                matchHTMLAddEqual({ kind: SyntaxKind.Literal, value: '>' })
            ]))
        })
        it('should compile empty textarea', () => {
            const aNode = parseTemplate('<div><textarea></textarea></div>').children[0].children[0]
            const nodes = [...compiler.tagEnd(aNode)]
            expect(nodes).toEqual(expect.arrayContaining([
                matchHTMLAddEqual({ kind: SyntaxKind.Literal, value: '</textarea>' })
            ]))
        })
    })
})
