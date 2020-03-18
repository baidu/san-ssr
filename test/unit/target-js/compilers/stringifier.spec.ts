import { stringifier } from '../../../../src/target-js/compilers/stringifier'

describe('target-js/compilers/stringifier', () => {
    it('should not contain inherited properties', () => {
        const c = Object.create({ bar: 'BAR' })
        c.foo = 'FOO'
        expect(stringifier.any(c)).toEqual('{"foo":"FOO"}')
    })
    it('should stringify boolean', () => {
        expect(stringifier.any(true)).toEqual('true')
        expect(stringifier.any(false)).toEqual('false')
    })
    it('should stringify null', () => {
        expect(stringifier.any(null)).toEqual('null')
    })
    it('should throw for function', () => {
        expect(() => stringifier.any(x => x)).toThrow('Cannot Stringify: x => x')
    })
})
