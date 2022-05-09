import { _ } from '../../../src/runtime/underscore'
import { Component } from 'san'
import type { SanComponent } from 'san'

describe('utils/underscore', function () {
    describe('.escapeHTML()', function () {
        it('should ignore normal characters', () => {
            expect(_.escapeHTML('foo bar')).toEqual('foo bar')
        })
        it('should escape HTML special characters', () => {
            expect(_.escapeHTML('<a foo="bar">')).toEqual('&lt;a foo=&quot;bar&quot;&gt;')
        })
    })
    describe('.classFilter()', () => {
        it('should join class', () => {
            expect(_.classFilter(['a', 'b', undefined, 'c']))
                .toEqual('a b c')
        })
        it('not array', () => {
            expect(_.classFilter('a'))
                .toEqual('a')
        })
    })
    describe('.xclassFilter()', () => {
        it('should append outer styles', () => {
            expect(_.xclassFilter(['foo', 'bar'], 'coo'))
                .toEqual('coo foo bar')
        })
    })
    describe('.xstyleFilter()', () => {
        it('should append outer styles', () => {
            expect(_.xstyleFilter('height: 10px', 'width: 10px'))
                .toEqual('width: 10px;height: 10px')
        })
        it('should return outer styles if inner not given', () => {
            expect(_.xstyleFilter('height: 10px', ''))
                .toEqual('height: 10px')
        })
    })
    describe('.styleFilter()', () => {
        it('should return null for null', () => {
            expect(_.styleFilter(null)).toBeNull()
        })
        it('should return as it is for primitive types', () => {
            expect(_.styleFilter(false as any)).toEqual(false)
            expect(_.styleFilter(1 as any)).toEqual(1)
        })
        it('should serialize a single style property', () => {
            expect(_.styleFilter({ height: '100%' })).toEqual('height:100%;')
        })
        it('should serialize style properties', () => {
            expect(_.styleFilter({ height: '100%', width: '50%' })).toEqual('height:100%;width:50%;')
        })
    })
    describe('.createInstanceFromClass()', () => {
        it('should create instance of class', () => {
            function Component () {}
            Component.prototype = { foo: 'FOO' }
            expect(_.createInstanceFromClass(Component as any)).toHaveProperty('foo', 'FOO')
        })
        it('should not call inited', () => {
            const inited = jest.fn()
            class MyComponent extends Component {
                inited () {
                    inited()
                }
            }
            expect(_.createInstanceFromClass(MyComponent)).toHaveProperty('inited')
            expect(inited).not.toHaveBeenCalled()
        })
        it('should not call initData', () => {
            const mockFn = jest.fn()
            class MyComponent extends Component {
                initData () {
                    mockFn()
                }
            }
            expect(_.createInstanceFromClass(MyComponent)).toHaveProperty('initData')
            expect(mockFn).not.toHaveBeenCalled()
        })
        it('should not call computed', () => {
            const foo = jest.fn()
            class MyComponent extends Component {
                static computed = { foo }
            }
            expect(_.createInstanceFromClass(MyComponent)).toHaveProperty('computed.foo', foo)
            expect(foo).not.toHaveBeenCalled()
        })
        it('should keep components', () => {
            class AAA extends Component {
                static template = '<div></div>'
            }
            class MyComponent extends Component {
                static template = '<div><aaa/></div>'
                static components = {
                    aaa: AAA
                }
            }
            expect(_.createInstanceFromClass(MyComponent)).toHaveProperty('components.aaa', AAA)
        })
    })
    describe('.attrFilter', () => {
        it('should not escape if specified', () => {
            expect(_.attrFilter('class', 'dark', false)).toEqual(' class="dark"')
        })
    })
    describe('.handleError()', () => {
        const handleError = _.handleError
        it('should call parent error', () => {
            const spy = jest.fn()
            const instance = {
                parentComponent: {
                    error: spy
                } as unknown as SanComponent<{}>
            } as SanComponent<{}>

            handleError(new Error('error'), instance, 'test')

            expect(spy).toHaveBeenCalled()
            const args = spy.mock.calls[0]
            expect(args[2]).toBe('test')
            expect(args[0] instanceof Error).toBe(true)
            expect(args[0].message).toBe('error')
        })
        it('should not call parent error', () => {
            const spy = jest.fn()
            const spy2 = jest.fn()
            const instance = {
                parentComponent: {
                    error: spy2
                } as unknown as SanComponent<{}>,
                error: spy
            } as unknown as SanComponent<{}>

            handleError(new Error('error'), instance, 'test')

            expect(spy).toHaveBeenCalled()
            expect(spy2).toHaveBeenCalledTimes(0)
            const args = spy.mock.calls[0]
            expect(args[2]).toBe('test')
            expect(args[0] instanceof Error).toBe(true)
            expect(args[0].message).toBe('error')
        })
        it('should throw error', () => {
            const spy = jest.fn()
            const instance = {
                parentComponent: {
                } as SanComponent<{}>
            } as SanComponent<{}>

            try {
                handleError(new Error('error'), instance, 'test')
            } catch (e) {
                spy(e)
            }

            expect(spy).toHaveBeenCalled()
            const args = spy.mock.calls[0]
            expect(args[0] instanceof Error).toBe(true)
            expect(args[0].message).toBe('error')
        })
    })
    describe('.getRootCtx()', () => {
        it('should ignore init pased ctx', () => {
            const rootCtx = makeContext({})
            let childCtx = rootCtx
            for (let i = 0; i < 100; i++) {
                childCtx = makeContext(childCtx)
            }

            const res = _.getRootCtx(childCtx)

            expect(res === rootCtx).toBeTruthy()

            function makeContext (parent: any): any {
                return {
                    parentCtx: parent
                }
            }
        })
    })
})
