import { _ } from '../../../src/utils/underscore'

describe('utils/underscore', function () {
    describe('.escapeHTML()', function () {
        it('should ignore normal characters', () => {
            expect(_.escapeHTML('foo bar')).toEqual('foo bar')
        })
        it('should escape HTML special characters', () => {
            expect(_.escapeHTML('<a foo="bar">')).toEqual('&lt;a foo=&quot;bar&quot;&gt;')
        })
    })
    describe('.extend()', () => {
        it('should return target if source not defined', () => {
            const target = {}
            expect(_.extend(target, undefined)).toEqual(target)
        })
    })
    describe('.includes()', () => {
        it('should return false if array not defined', () => {
            expect(_.includes(false as any, 'coo')).toBeFalsy()
        })
    })
    describe('._xclassFilter()', () => {
        it('should append outer styles', () => {
            expect(_._xclassFilter(['foo', 'bar'], 'coo'))
                .toEqual('coo foo bar')
        })
    })
    describe('._xstyleFilter()', () => {
        it('should append outer styles', () => {
            expect(_._xstyleFilter('height: 10px', 'width: 10px'))
                .toEqual('width: 10px;height: 10px')
        })
        it('should return outer styles if inner not given', () => {
            expect(_._xstyleFilter('height: 10px', ''))
                .toEqual('height: 10px')
        })
    })
    describe('.defaultStyleFilter()', () => {
        it('should return null for null', () => {
            expect(_.defaultStyleFilter(null)).toBeNull()
        })
        it('should return as it is for primitive types', () => {
            expect(_.defaultStyleFilter(false as any)).toEqual(false)
            expect(_.defaultStyleFilter(1 as any)).toEqual(1)
        })
        it('should serialize a single style property', () => {
            expect(_.defaultStyleFilter({ height: '100%' })).toEqual('height:100%;')
        })
        it('should serialize style properties', () => {
            expect(_.defaultStyleFilter({ height: '100%', width: '50%' })).toEqual('height:100%;width:50%;')
        })
    })
})
