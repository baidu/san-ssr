import { compileToSource, compileToRenderer } from '../../src/index'
import { defineComponent } from 'san'

describe('compileToSource', function () {
    it('should compile ComponentClass to JavaScript code', function () {
        const ComponentClass = defineComponent({ template: '<span>A</span>' })
        const code = compileToSource(ComponentClass as any)

        expect(code).toContain('html += "A')
        expect(code).toMatch(/^function render \(data, noDataOutput\) {/)
    })
})

describe('compileToRenderer', function () {
    it('should compile to a renderer function', function () {
        const ComponentClass = defineComponent({ template: '<span>A</span>' })
        const render = compileToRenderer(ComponentClass)

        expect(render).toBeInstanceOf(Function)
        expect(render({}, {
            noDataOutput: true
        })).toEqual('<span>A</span>')
    })

    it('should compile to a renderer function which accepts data', function () {
        const ComponentClass = defineComponent({ template: '<span>name: {{name}}</span>' })
        const render = compileToRenderer(ComponentClass)

        expect(render).toBeInstanceOf(Function)
        expect(render({ name: 'Harttle' }, {
            noDataOutput: true
        })).toEqual('<span>name: Harttle</span>')
    })

    it('should run inited only in run time', function () {
        const inited = jest.fn()
        const ComponentClass = defineComponent({ inited, template: '<div>a</div>' })
        const render = compileToRenderer(ComponentClass)

        expect(inited).not.toBeCalled()
        expect(render({}, {
            noDataOutput: true
        })).toEqual('<div>a</div>')
        expect(inited).toBeCalledTimes(1)
    })
})
