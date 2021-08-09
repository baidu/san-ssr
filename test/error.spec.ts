import { SanProject } from '../dist/index'
import san from 'san'

it('lifecycle hook: inited', function () {
    const spy = jest.fn()
    const Child = san.defineComponent({
        template: '<h1>test</h1>',
        inited: function () {
            throw new Error('error')
        }
    })
    const MyComponent = san.defineComponent({
        template: '<div><x-child /></div>',
        components: {
            'x-child': Child
        },
        error: spy
    })

    const project = new SanProject()
    const renderer = project.compileToRenderer(MyComponent)

    renderer({})

    expect(spy).toHaveBeenCalled()

    const args = spy.mock.calls[0]
    expect(args[2]).toBe('hook:inited')
    expect(args[1] instanceof Child).toBe(true)
    expect(args[0] instanceof Error).toBe(true)
    expect(args[0].message).toBe('error')
})

it('initData', function () {
    const spy = jest.fn()
    const Child = san.defineComponent({
        template: '<h1>test</h1>',
        initData: function () {
            throw new Error('error')
        }
    })
    const MyComponent = san.defineComponent({
        template: '<div><x-child /></div>',
        components: {
            'x-child': Child
        },
        error: spy
    })

    const project = new SanProject()
    const renderer = project.compileToRenderer(MyComponent)

    renderer({})

    expect(spy).toHaveBeenCalled()

    const args = spy.mock.calls[0]
    expect(args[2]).toBe('initData')
    expect(args[1] instanceof Child).toBe(true)
    expect(args[0] instanceof Error).toBe(true)
    expect(args[0].message).toBe('error')
})

it('computed', function () {
    const spy = jest.fn()
    const Child = san.defineComponent({
        template: '<h1>{{ message }}</h1>',
        computed: {
            message: function () {
                throw new Error('error')
            }
        }
    })
    const MyComponent = san.defineComponent({
        template: '<div><x-child /></div>',
        components: {
            'x-child': Child
        },
        error: spy
    })

    const project = new SanProject()
    const renderer = project.compileToRenderer(MyComponent)

    renderer({})

    expect(spy).toHaveBeenCalled()

    const args = spy.mock.calls[0]
    expect(args[2]).toBe('computed:message')
    expect(args[1] instanceof Child).toBe(true)
    expect(args[0] instanceof Error).toBe(true)
    expect(args[0].message).toBe('error')
})

it('filter', function () {
    const spy = jest.fn()
    const Child = san.defineComponent({
        template: '<h1>{{ msg | add }}</h1>',
        filters: {
            add: function () {
                throw new Error('error')
            }
        },
        initData: function () {
            return {
                msg: 'test'
            }
        }
    })
    const MyComponent = san.defineComponent({
        template: '<div><x-child /></div>',
        components: {
            'x-child': Child
        },
        error: spy
    })

    const project = new SanProject()
    const renderer = project.compileToRenderer(MyComponent)

    renderer({})

    expect(spy).toHaveBeenCalled()

    const args = spy.mock.calls[0]
    expect(args[2]).toBe('filter:add')
    expect(args[1] instanceof Child).toBe(true)
    expect(args[0] instanceof Error).toBe(true)
    expect(args[0].message).toBe('error')
})

it('slot children', function () {
    const spy = jest.fn()
    const slotChild = san.defineComponent({
        template: '<span>test</span>',
        inited: function () {
            throw new Error('error')
        }
    })
    const Child = san.defineComponent({
        template: '<h1><slot /></h1>'
    })
    const MyComponent = san.defineComponent({
        template: '<div><x-child><x-slot-child /></x-child></div>',
        components: {
            'x-child': Child,
            'x-slot-child': slotChild
        },
        error: spy
    })

    const project = new SanProject()
    const renderer = project.compileToRenderer(MyComponent)

    renderer({})

    expect(spy).toHaveBeenCalled()

    const args = spy.mock.calls[0]
    expect(args[2]).toBe('hook:inited')
    expect(args[1] instanceof slotChild).toBe(true)
    expect(args[0] instanceof Error).toBe(true)
    expect(args[0].message).toBe('error')
})
