import { expr } from '../../../../src/target-js/compilers/expr-compiler'
import { parseExpr, parseTemplate } from 'san'

describe('target-js/compilers/expr-compiler', () => {
    describe('.expr()', () => {
        it('should compile a binary expression', () => {
            const e = parseExpr('a + b')
            expect(expr(e)).toEqual('ctx.data.a + ctx.data.b')
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
            expect(expr(exp)).toContain('encodeURIComponent("foo")')
        })
        it('should compile boolean expression', () => {
            expect(expr(parseExpr('false'))).toEqual('false')
            expect(expr(parseExpr('true'))).toEqual('true')
        })
        it('should compile custom filter', () => {
            const e = parseTemplate('{{"foo"|bar("coo")}}')
            const exp = e.children[0].textExpr
            expect(expr(exp)).toContain('ctx.instance.filters["bar"].call(ctx.instance, "foo", "coo")')
        })
        it('should escape text value by default', () => {
            const e = parseTemplate('{{"<"}}<')
            const exp = e.children[0].textExpr
            expect(expr(exp, 'html')).toEqual('_.output("<", true) + "&lt;"')
        })
        it('should not escape text value if raw specified', () => {
            const e = parseTemplate('{{"\'foo\'" | raw}}')
            const exp = e.children[0].textExpr
            expect(expr(exp, 'html')).toEqual('_.output("\'foo\'", false)')
        })
    })
    describe('.text()', () => {
        it('should compile to empty string for empty text', () => {
            expect(expr({ type: 7, segs: [] } as any)).toEqual('""')
        })
    })
})
