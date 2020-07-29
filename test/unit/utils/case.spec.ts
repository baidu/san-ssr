import { parseSanHTML, assertDeepEqual, assertSanHTMLEqual, compareSanHTML, deepEqual } from '../../../src/utils/case'

describe('utils/case', function () {
    describe('.deepEqual()', function () {
        it('should return true if primitive types equal', () => {
            expect(deepEqual(false, false)).toBeTruthy()
        })
        it('should return false if primitive types not equal', () => {
            expect(deepEqual(false, undefined)).toBeFalsy()
        })
        it('should return true if object equals', () => {
            expect(deepEqual({ foo: 1 }, { foo: 1 })).toBeTruthy()
        })
        it('should return false if rhs is not object', () => {
            expect(deepEqual({ foo: 1 }, undefined)).toBeFalsy()
        })
        it('should return false if object property not equal', () => {
            expect(deepEqual({ foo: 1 }, { foo: 2 })).toBeFalsy()
        })
        it('should ignore property order', () => {
            expect(deepEqual({ foo: 1, bar: 2 }, { bar: 2, foo: 1 })).toBeTruthy()
        })
    })
    describe('.assertDeepEqual()', function () {
        it('should throw if not equal', () => {
            expect(() => assertDeepEqual({ foo: 1 }, { foo: 2 })).toThrow()
        })
        it('should not throw if equal', () => {
            expect(() => assertDeepEqual({ foo: 1 }, { foo: 1 })).not.toThrow()
        })
    })
    describe('.parseSanHTML', () => {
        it('should parse data and html separately', () => {
            const [data, html] = parseSanHTML('<div><!--s-data:{"foo":"bar"}--><input></div>')
            expect(data).toEqual({ foo: 'bar' })
            expect(html).toEqual('<div><input></div>')
        })
        it('should parse data as {} if s-data not closed', () => {
            const [data, html] = parseSanHTML('<div><!--s-data:{"foo":"bar"}<input></div>')
            expect(data).toEqual({})
            expect(html).toEqual('<div><!--s-data:{"foo":"bar"}<input></div>')
        })
    })
    describe('.compareSanHTML()', function () {
        it('should return true if identical', () => {
            expect(compareSanHTML(
                '<div><!--s-data:{"foo":"bar"}--><input></div>',
                '<div><!--s-data:{"foo":"bar"}--><input></div>'
            )).toBeUndefined()
        })
        it('should return false if data not equal', () => {
            expect(compareSanHTML(
                '<div><!--s-data:{"foo":"bar"}--><input></div>',
                '<div><!--s-data:{"foo":"foo"}--><input></div>'
            )).toEqual('data not equal')
        })
        it('should return false if html not equal', () => {
            expect(compareSanHTML(
                '<div><!--s-data:{"foo":"bar"}--><input></div>',
                '<div><!--s-data:{"foo":"bar"}--><input data-hidden></div>'
            )).toEqual('html not equal')
        })
        it('should ignore order of data properties', () => {
            expect(compareSanHTML(
                '<div><!--s-data:{"foo": 1, "bar": 2}--><input></div>',
                '<div><!--s-data:{"bar": 2, "foo": 1}--><input></div>'
            )).toBeUndefined()
        })
    })
    describe('.assertSanHTMLEqual()', function () {
        it('should throw if san htmls not equal', () => {
            expect(() => assertSanHTMLEqual(
                '<div><!--s-data:{"foo": 1}--><input></div>',
                '<div><!--s-data:{"foo": 1}--><input data-hidden></div>'
            )).toThrow('html not equal')
        })
        it('should not throw if san htmls equal', () => {
            expect(() => assertSanHTMLEqual(
                '<div><!--s-data:{"foo": 1, "bar": 2}--><input></div>',
                '<div><!--s-data:{"bar": 2, "foo": 1}--><input></div>'
            )).not.toThrow()
        })
    })
})
