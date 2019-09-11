import { loader } from '../../src/loaders/meta'

describe('meta loader', function () {
    it('should add filename metadata', function () {
        const mod = { exports: { foo: 'FOO' } }
        loader(mod, '/some/file')

        expect(mod.exports).toHaveProperty('foo', 'FOO')
        expect(mod.exports).toHaveProperty('__meta', { filename: '/some/file' })
    })
})
