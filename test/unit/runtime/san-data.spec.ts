import { SanData } from '../../../src/runtime/san-data'

describe('runtime/SanData', () => {
    describe('.get()', () => {
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
        it('should return undefined if parent not found', () => {
            const data = new SanData({}, {})
            expect(data.get('bar.foo')).toBeUndefined()
        })
    })
    describe('.set()', () => {
        it('should overwrite an existing value', () => {
            const data = new SanData({ bar: { foo: 'FOO' } }, {})
            expect(data.set('bar', 'BAR'))
            expect(data.get('bar')).toEqual('BAR')
        })
        it('should overwrite an existing nested value', () => {
            const data = new SanData({ bar: { foo: 'FOO' } }, {})
            expect(data.set('bar.foo', 'BAR'))
            expect(data.get('bar.foo')).toEqual('BAR')
        })
        it('should create an new value', () => {
            const data = new SanData({ bar: { foo: 'FOO' } }, {})
            expect(data.set('foo', 'BAR'))
            expect(data.get('foo')).toEqual('BAR')
        })
        it('should skip if parent not exist', () => {
            const data = new SanData({}, {})
            expect(data.set('foo.bar', 'BAR'))
            expect(data.get('foo.bar')).toBeUndefined()
        })
    })
    describe('.removeAt()', () => {
        it('should an existing value', () => {
            const data = new SanData({ bar: [1, 2, 3] }, {})
            expect(data.removeAt('bar', 1))
            expect(data.get('bar')).toEqual([1, 3])
            expect(data.removeAt('bar', -1))
            expect(data.get('bar')).toEqual([1])
        })
        it('should not throw when index overflow', () => {
            const data = new SanData({ bar: [1, 2, 3] }, {})
            expect(data.removeAt('bar', 8))
            expect(data.get('bar')).toEqual([1, 2, 3])
        })
        it('should not throw when path not found', () => {
            const data = new SanData({}, {})
            expect(data.removeAt('bar', 1))
            expect(data.get('bar')).toBeUndefined()
        })
    })
})
