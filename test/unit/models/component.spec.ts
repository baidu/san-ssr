import { isComponentClass } from '../../../src/models/component'

describe('models/component', function () {
    describe('.isComponentClass()', function () {
        it('non-function is false', function () {
            expect(isComponentClass(123)).toEqual(false)
        })

        it('class with static template property is true', function () {
            function comp () {}
            comp.template = '<div>'

            expect(isComponentClass(comp)).toEqual(true)
        })

        it('class without template property is false', function () {
            function comp () {}

            expect(isComponentClass(comp)).toEqual(false)
        })

        it('class with template property is true', function () {
            function comp () {}
            comp.prototype.template = '<div>'

            expect(isComponentClass(comp)).toEqual(true)
        })

        it('empty template string should be considered valid', function () {
            function comp () {}
            comp.prototype.template = ''

            expect(isComponentClass(comp)).toEqual(true)
        })

        it('class with non-string template property is false', function () {
            function comp () {}
            comp.prototype.template = 123

            expect(isComponentClass(comp)).toEqual(false)
        })
    })
})
