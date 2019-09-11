import { apply, restore } from '../../src/loaders/tsc'

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
            'class Foo {\n}'
        )
    })
})
