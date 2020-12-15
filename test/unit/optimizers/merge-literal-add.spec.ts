import { RETURN, BINARY, STATMENT, L, I } from '../../../src/ast/syntax-util'
import { mergeLiteralAdd } from '../../../src/optimizers/merge-literal-add'
import { FunctionDefinition } from '../../../src/ast/syntax-node'

describe('optimizers/merge-literal-add', () => {
    it('should merge to successive html+=', () => {
        const fn = new FunctionDefinition('', [], [
            STATMENT(BINARY(I('html'), '+=', L('foo'))),
            STATMENT(BINARY(I('html'), '+=', L('bar')))
        ])
        mergeLiteralAdd(fn)
        expect(fn.body).toHaveLength(1)
        expect(fn.body[0]).toHaveProperty('expression.rhs.value', 'foobar')
    })
    it('should not merge if not successive', () => {
        const fn = new FunctionDefinition('', [], [
            STATMENT(BINARY(I('html'), '+=', L('foo'))),
            RETURN(I('html')),
            STATMENT(BINARY(I('html'), '+=', L('bar')))
        ])
        mergeLiteralAdd(fn)
        expect(fn.body).toHaveLength(3)
    })
})
