import { SanSSRData } from '../../../src/runtime/san-ssr-data'

describe('runtime/SanSSRData', () => {
    describe('.get()', () => {
        it('should get directly defined data', () => {
            const data = new SanSSRData({ foo: 'FOO' }, {})
            expect(data.get('foo')).toEqual('FOO')
        })
        it('should get nested data', () => {
            const data = new SanSSRData({ bar: { foo: 'FOO' } }, {})
            expect(data.get('bar.foo')).toEqual('FOO')
        })
        it('should get computed data', () => {
            const data = new SanSSRData({}, { computed: { foo: () => 'FOO' } })
            expect(data.get('foo')).toEqual('FOO')
        })
        it('computed data should override defined data', () => {
            const data = new SanSSRData({ foo: 'FOO' }, { computed: { foo: () => 'Foo' } })
            expect(data.get('foo')).toEqual('Foo')
        })
        it('should return undefined if not found', () => {
            const data = new SanSSRData({ foo: 'FOO' }, {})
            expect(data.get('bar')).toBeUndefined()
        })
        it('should return undefined if not found nested', () => {
            const data = new SanSSRData({ bar: { bar: 'FOO' } }, {})
            expect(data.get('bar.foo')).toBeUndefined()
        })
        it('should return undefined if parent not found', () => {
            const data = new SanSSRData({}, {})
            expect(data.get('bar.foo')).toBeUndefined()
        })
    })
    describe('.set()', () => {
        it('should overwrite an existing value', () => {
            const data = new SanSSRData({ bar: { foo: 'FOO' } }, {})
            expect(data.set('bar', 'BAR'))
            expect(data.get('bar')).toEqual('BAR')
        })
        it('should overwrite an existing nested value', () => {
            const data = new SanSSRData({ bar: { foo: 'FOO' } }, {})
            expect(data.set('bar.foo', 'BAR'))
            expect(data.get('bar.foo')).toEqual('BAR')
        })
        it('should create an new value', () => {
            const data = new SanSSRData({ bar: { foo: 'FOO' } }, {})
            expect(data.set('foo', 'BAR'))
            expect(data.get('foo')).toEqual('BAR')
        })
        it('should skip if parent not exist', () => {
            const data = new SanSSRData({}, {})
            expect(data.set('foo.bar', 'BAR'))
            expect(data.get('foo.bar')).toBeUndefined()
        })
    })
    describe('.removeAt()', () => {
        it('should an existing value', () => {
            const data = new SanSSRData({ bar: [1, 2, 3] }, {})
            expect(data.removeAt('bar', 1))
            expect(data.get('bar')).toEqual([1, 3])
            expect(data.removeAt('bar', -1))
            expect(data.get('bar')).toEqual([1])
        })
        it('should not throw when index overflow', () => {
            const data = new SanSSRData({ bar: [1, 2, 3] }, {})
            expect(data.removeAt('bar', 8))
            expect(data.get('bar')).toEqual([1, 2, 3])
        })
        it('should not throw when path not found', () => {
            const data = new SanSSRData({}, {})
            expect(data.removeAt('bar', 1))
            expect(data.get('bar')).toBeUndefined()
        })
    })
    describe('.parseExpr', () => {
        it('should parse []', () => {
            const data = new SanSSRData({}, {})
            expect(data.parseExpr('data1.data3[0].age')).toEqual(['data1', 'data3', 0, 'age'])
            expect(data.parseExpr('data1.data3["bbb"].age')).toEqual(['data1', 'data3', 'bbb', 'age'])
        })
        it('can use [] to get', () => {
            const data = new SanSSRData({
                data1: {
                    data2: {
                        schoolAge: 9
                    },
                    data3: [
                        {
                            age: 9
                        }
                    ]
                }
            }, {})
            expect(data.get('data1.data3[0].age')).toEqual(9)
        })
        it('can use [] to set', () => {
            const data = new SanSSRData({
                data1: {
                    data2: {
                        schoolAge: 9
                    },
                    data3: [
                        {
                            age: 9
                        }
                    ]
                }
            }, {})
            data.set('data1.data3[1]', { age: 10 })
            expect(data.get('data1.data3').length).toEqual(2)
        })
        it('readIndent error', () => {
            const data = new SanSSRData({}, {})
            expect(() => data.parseExpr('data1..data3')).toThrow(/expect an identifier/)
        })
        it('readString error', () => {
            const data = new SanSSRData({}, {})
            expect(() => data.parseExpr('data1["a]')).toThrow(/expect a string/)
        })
        it('parse [] error', () => {
            const data = new SanSSRData({}, {})
            expect(() => data.parseExpr('data1[a]')).toThrow(/identifier is not support/)
            expect(() => data.parseExpr('data1["a"')).toThrow(/expect ]/)
        })
        it('read accessor error', () => {
            const data = new SanSSRData({}, {})
            expect(() => data.parseExpr('data1-aaa')).toThrow(/expect . or \[/)
        })
    })
})
