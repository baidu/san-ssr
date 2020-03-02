import { SanData } from '../../../src/models/san-data'

describe('models/SanData', () => {
    it('should get directly defined data', () => {
        const data = new SanData({ foo: 'FOO' }, {})
        expect(data.get('foo')).toEqual('FOO')
    })
    it('should get nested data', () => {
        const data = new SanData({ bar: { foo: 'FOO' } }, {})
        expect(data.get('bar.foo')).toEqual('FOO')
    })
    it('should get computed data', () => {
        const data = new SanData({}, { foo: () => 'FOO' })
        expect(data.get('foo')).toEqual('FOO')
    })
    it('computed data should override defined data', () => {
        const data = new SanData({ foo: 'FOO' }, { foo: () => 'Foo' })
        expect(data.get('foo')).toEqual('Foo')
    })
    it('should return undefined if not found', () => {
        const data = new SanData({ foo: 'FOO' }, {})
        expect(data.get('bar')).toBeUndefined()
    })
    it('should return undefined if not found nested', () => {
        const data = new SanData({ bar: { bar: 'FOO' } }, {})
        expect(data.get('bar.foo')).toBeUndefined()
    })
})
