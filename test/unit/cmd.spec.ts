import { CMD } from '../../src/loaders/cmd'

describe('CMD', function () {
    it('should support exports assignment', function () {
        const cmd = new CMD({
            '/foo': 'exports.foo = 1'
        })

        expect(cmd.require('/foo')).toEqual({ foo: 1 })
    })

    it('should support module.exports assignment', function () {
        const cmd = new CMD({
            '/foo': 'module.exports = 1'
        })

        expect(cmd.require('/foo')).toEqual(1)
    })

    it('should resolve dependencies', function () {
        const cmd = new CMD({
            '/foo': 'module.exports = 1',
            '/bar': 'module.exports = require("./foo") + 1'
        })
        expect(cmd.require('/bar')).toEqual(2)
    })

    it('should cache resolved module', function () {
        const cmd = new CMD({
            '/bar': 'var i = 1\nmodule.exports = i++'
        })

        expect(cmd.require('/bar')).toEqual(1)
        expect(cmd.require('/bar')).toEqual(1)
    })
})
