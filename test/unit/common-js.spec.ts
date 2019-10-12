import { CommonJS } from '../../src/loaders/common-js'

describe('CommonJS', function () {
    it('should support exports assignment', function () {
        const commonJS = new CommonJS({
            '/foo': 'exports.foo = 1'
        })

        expect(commonJS.require('/foo')).toEqual({ foo: 1 })
    })

    it('should support module.exports assignment', function () {
        const commonJS = new CommonJS({
            '/foo': 'module.exports = 1'
        })

        expect(commonJS.require('/foo')).toEqual(1)
    })

    it('should resolve dependencies', function () {
        const commonJS = new CommonJS({
            '/foo': 'module.exports = 1',
            '/bar': 'module.exports = require("./foo") + 1'
        })
        expect(commonJS.require('/bar')).toEqual(2)
    })

    it('should cache resolved module', function () {
        const commonJS = new CommonJS({
            '/bar': 'var i = 1\nmodule.exports = i++'
        })

        expect(commonJS.require('/bar')).toEqual(1)
        expect(commonJS.require('/bar')).toEqual(1)
    })
})
