const { apply, restore } = require('../../src/loaders/tsc.js')

describe('tsc loader', function () {
    const filename = require.resolve('../stub/obj.ts')

    beforeEach(() => {
        apply()
        delete require.cache[filename]
    })

    afterEach(restore)

    it('should load simple class', function () {
        const fn = require('../stub/obj.ts')

        expect(fn.default.toString()).toEqual(
            'function Foo() {\n    }'
        )
    })
})
