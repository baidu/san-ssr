import { RETURN, BINARY, STATEMENT, L, I } from '../../../src/ast/renderer-ast-util'
import { mergeLiteralAdd } from '../../../src/optimizers/merge-literal-add'
import { FunctionDefinition } from '../../../src/ast/renderer-ast-dfn'

describe('optimizers/merge-literal-add', () => {
    it('should merge to successive html+=', () => {
        const fn = new FunctionDefinition('', [], [
            STATEMENT(BINARY(I('html'), '+=', L('foo'))),
            STATEMENT(BINARY(I('html'), '+=', L('bar')))
        ])
        mergeLiteralAdd(fn)
        expect(fn.body).toHaveLength(1)
        expect(fn.body[0]).toHaveProperty('value.rhs.value', 'foobar')
    })
    it('should not merge if not successive', () => {
        const fn = new FunctionDefinition('', [], [
            STATEMENT(BINARY(I('html'), '+=', L('foo'))),
            RETURN(I('html')),
            STATEMENT(BINARY(I('html'), '+=', L('bar')))
        ])
        mergeLiteralAdd(fn)
        expect(fn.body).toHaveLength(3)
    })
})
