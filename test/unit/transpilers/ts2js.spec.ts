import { tsCode2js } from '../../../src/transpilers/ts2js'

describe('transpilers/ts2js', () => {
    describe('.tsCode2js()', () => {
        it('should transpile ts code to js', () => {
            const targetCode = tsCode2js('const foo: number = 1', {})
            expect(targetCode).toEqual('var foo = 1;\n')
        })
    })
})
