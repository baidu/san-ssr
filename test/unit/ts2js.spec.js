const { ts2js } = require('../../src/transpilers/ts2js')

describe('ts2js', function () {
    it('should compile types to nothing', function () {
        const src = 'let foo: string = "foobar"'

        expect(ts2js(src)).toEqual('var foo = "foobar";\n')
    })

    it('should compile import to require', function () {
        const src = 'import bar from "./bar"\nbar()'

        expect(ts2js(src)).toContain('var bar_1 = require("./bar");')
        expect(ts2js(src)).toContain('bar_1["default"]();')
    })
})
