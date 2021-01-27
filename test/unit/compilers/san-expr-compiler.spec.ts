import { sanExpr as expr, OutputType } from '../../../src/compilers/san-expr-compiler'
import { SyntaxKind } from '../../../src/ast/renderer-ast-node'
import { CTX_DATA } from '../../../src/ast/renderer-ast-factory'
import { parseExpr, parseTemplate } from 'san'

describe('compilers/san-expr-compiler', () => {
    describe('.expr()', () => {
        it('should compile a binary expression', () => {
            const e = parseExpr('a + b')
            const dataItem = (value: string) => ({
                kind: SyntaxKind.BinaryExpression,
                lhs: CTX_DATA,
                op: '[]',
                rhs: { kind: SyntaxKind.Literal, value }
            })
            expect(expr(e)).toEqual(expect.objectContaining({
                kind: SyntaxKind.BinaryExpression,
                lhs: dataItem('a'),
                op: '+',
                rhs: dataItem('b')
            }))
        })
        it('should throw for unexpected expression type', () => {
            const e = parseExpr('!b')
            e.type = 222
            expect(() => expr(e)).toThrow(/unexpected expression/)
        })
        it('should throw for unexpected unary operator', () => {
            const e = parseExpr('!b')
            e['operator'] = '~'.charCodeAt(0)
            expect(() => expr(e)).toThrow('unexpected unary operator "~"')
        })
        it('should compile url filter', () => {
            const e = parseTemplate('{{"foo"|url}}')
            const exp = e.children[0].textExpr
            expect(expr(exp)).toEqual({
                kind: SyntaxKind.EncodeURIComponent,
                value: { kind: SyntaxKind.Literal, value: 'foo' }
            })
        })
        it('should compile boolean expression', () => {
            expect(expr(parseExpr('false'))).toEqual({ kind: SyntaxKind.Literal, value: false })
            expect(expr(parseExpr('true'))).toEqual({ kind: SyntaxKind.Literal, value: true })
        })
        it('should compile custom filter', () => {
            const e = parseTemplate('{{"foo"|bar("coo")}}')
            const exp = e.children[0].textExpr
            expect(expr(exp)).toEqual({
                kind: SyntaxKind.FilterCall,
                name: 'bar',
                args: [
                    { kind: SyntaxKind.Literal, value: 'foo' },
                    { kind: SyntaxKind.Literal, value: 'coo' }
                ]
            })
        })
        it('should escape text value by default', () => {
            const e = parseTemplate('{{"<"}}<')
            const exp = e.children[0].textExpr
            expect(expr(exp, OutputType.ESCAPE_HTML)).toEqual({
                kind: SyntaxKind.BinaryExpression,
                lhs: {
                    kind: SyntaxKind.HelperCall,
                    name: 'output',
                    args: [
                        { kind: SyntaxKind.Literal, value: '<' },
                        { kind: SyntaxKind.Literal, value: true }
                    ]
                },
                op: '+',
                rhs: { kind: SyntaxKind.Literal, value: '&lt;' }
            })
        })
        it('should not escape text value if raw specified', () => {
            const e = parseTemplate('{{"\'foo\'" | raw}}')
            const exp = e.children[0].textExpr
            expect(expr(exp, OutputType.ESCAPE_HTML)).toEqual({
                kind: SyntaxKind.HelperCall,
                name: 'output',
                args: [
                    { kind: SyntaxKind.Literal, value: "'foo'" },
                    { kind: SyntaxKind.Literal, value: false }
                ]
            })
        })
    })
    describe('.text()', () => {
        it('should compile to empty string for empty text', () => {
            expect(expr({ type: 7, segs: [] } as any)).toEqual(
                { kind: SyntaxKind.Literal, value: '' }
            )
        })
    })
    describe('.interp()', () => {
        it('should compile url filter', () => {
            const e = parseTemplate('{{"foo"|url}}')
            const exp = e.children[0].textExpr
            expect(expr(exp)).toEqual({
                kind: SyntaxKind.EncodeURIComponent,
                value: { kind: SyntaxKind.Literal, value: 'foo' }
            })
        })
    })
})
