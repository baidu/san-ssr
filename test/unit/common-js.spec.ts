import { CommonJS } from '../../src/loaders/common-js'
import { join, resolve } from 'path'

describe('CommonJS', function () {
    it('should readFile if not specified', function () {
        const fooPath = resolve(__dirname, '../stub/foo.js')
        const commonJS = new CommonJS()
        expect(commonJS.require(fooPath)).toEqual({ foo: 'FOO' })
    })
    it('should try append .js if not found', function () {
        const barPath = join(__dirname, '../stub/bar')
        const commonJS = new CommonJS({
            '/bar': `exports.bar = require('${barPath}').bar`
        })
        expect(commonJS.require('/bar')).toEqual({ bar: 'BAR' })
    })
    it('should support exports.foo = ', function () {
        const commonJS = new CommonJS({
            '/foo': 'exports.foo = 1'
        })
        expect(commonJS.require('/foo')).toEqual({ foo: 1 })
    })

    it('should support module.exports = ', function () {
        const commonJS = new CommonJS({
            '/foo': 'module.exports = 1'
        })
        expect(commonJS.require('/foo')).toEqual(1)
    })

    it('should resolve nested dependencies', function () {
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
