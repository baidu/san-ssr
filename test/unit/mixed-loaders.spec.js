const tsc = require('../../src/loaders/tsc.js')
const meta = require('../../src/loaders/meta.js')

describe('mixed loaders', function () {
    const filename = require.resolve('../stub/obj.ts')

    beforeEach(() => {
        delete require.cache[filename]
        tsc.apply()
        meta.apply('.ts')
    })

    afterEach(() => {
        meta.restore('.ts')
        tsc.restore()
    })

    it('should add meta for ts files', function () {
        const clazz = require('../stub/obj.ts').default

        expect(clazz.__meta.filename).toEqual(filename)
    })
})
