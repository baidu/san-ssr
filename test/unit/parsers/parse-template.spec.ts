import type { AElement } from 'san'
import { extractInterpNodeFromRootANode, parseAndNormalizeTemplate } from '../../../src/parsers/parse-template'

describe('parsers/parse-template', function () {
    describe('.extractInterpNodeFromRootANode()', () => {
        it('should extract from ExprInterpNode', () => {
            const root = {
                tagName: 'div',
                directives: {},
                props: [],
                events: [] as any,
                children: [{
                    textExpr: {
                        type: 5,
                        expr: { type: 4, paths: [{ type: 1, value: 'bar' }] },
                        filters: []
                    }
                }]
            } as any
            expect(extractInterpNodeFromRootANode(root)).toHaveProperty('type', 5)
        })
        it('should extract from ExprTextNode', () => {
            const root = {
                tagName: 'div',
                directives: {},
                props: [],
                events: [] as any,
                children: [{
                    textExpr: {
                        type: 7,
                        segs: [
                            { type: 5, expr: { type: 4, paths: [{ type: 1, value: 'bar' }] }, filters: [] }
                        ]
                    }
                }]
            } as any
            expect(extractInterpNodeFromRootANode(root)).toHaveProperty('type', 5)
        })
        it('should throw if not found', () => {
            const root = {
                tagName: 'div',
                directives: {},
                props: [],
                events: [] as any,
                children: [{ textExpr: {} }]
            } as any
            expect(() => extractInterpNodeFromRootANode(root)).toThrow(/not recognized/)
        })
    })
    describe('.parseAndNormalizeTemplate()', () => {
        it('shoud not append props', () => {
            const resNode = parseAndNormalizeTemplate('<div class="aaa" style="display: none;" id="bbb"></div>', {})
            expect((resNode as AElement).props.length).toBe(3)
        })
    })
})
