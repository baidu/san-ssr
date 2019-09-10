const { apply, restore } = require('../../src/loaders/meta.js')

describe('meta loader', function () {
    const objfile = require.resolve('../stub/obj.js')
    const nullfile = require.resolve('../stub/null.js')

    beforeEach(() => {
        apply('.js')
        delete require.cache[objfile]
        delete require.cache[nullfile]
    })

    afterEach(() => restore('.js'))

    it('should add filename metadata', function () {
        expect(require('../stub/obj.js')).toEqual({
            foo: 'FOO',
            __meta: { filename: objfile }
        })
    })

    it('should not throw if exports null', function () {
        expect(require('../stub/null.js')).toEqual(null)
    })
})
