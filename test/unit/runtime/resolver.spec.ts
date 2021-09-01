import { createResolver } from '../../../src/runtime/resolver'
import { join } from 'path'
import san from 'san'

describe('runtime/resolver', () => {
    const resolver = createResolver({}, require)

    it('should resolve render from external module', () => {
        const render = resolver.getRenderer({ id: '0', specifier: join(__dirname, '../../stub/ssr.js') })
        expect(render()).toEqual('hello')
    })

    it('should change by custom require path', () => {
        const render = resolver.getRenderer(
            { id: '0', specifier: 'aaa' },
            { customSSRFilePath: () => join(__dirname, '../../stub/ssr.js') }
        )
        expect(render()).toEqual('hello')
    })

    it('should get child component class', () => {
        const ChildA = san.defineComponent({
            template: ''
        })
        const ChildB = san.defineComponent({
            template: ''
        })
        const MyComponent = san.defineComponent({
            template: '',
            components: {
                'child-a': ChildA,
                'child-b': ChildA,
                'child-c': 'self'
            }
        })

        const ref = { id: 'id', specifier: './som/path' }
        const ResComponent = resolver.getChildComponentClass({ id: 'id' }, MyComponent, 'child-a')
        expect(ResComponent === ChildA).toBe(true)
        const ResComponent2 = resolver.getChildComponentClass(ref, MyComponent, 'child-b', {
            customComponentFilePath () {
                return ChildB
            }
        })
        expect(ResComponent2 === ChildB).toBe(true)
        const ResComponent4 = resolver.getChildComponentClass(ref, MyComponent, 'child-b', {
            customComponentFilePath () {}
        })
        expect(ResComponent4 === ChildA).toBe(true)
        const fn = jest.fn()
        try {
            resolver.getChildComponentClass(ref, MyComponent, 'none-exist')
        } catch {
            fn()
        }
        expect(fn).toHaveBeenCalled()
        const ResComponent3 = resolver.getChildComponentClass(ref, MyComponent, 'child-c')
        expect(ResComponent3 === MyComponent).toBe(true)
    })
})
