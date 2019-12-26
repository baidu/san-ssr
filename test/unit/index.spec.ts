import { compileToSource, compileToRenderer } from '../../src/index'
import { defineComponent } from 'san'

describe('compileToSource', function () {
    it('should compile ComponentClass to JavaScript code', function () {
        const ComponentClass = defineComponent({ template: '<span>A</span>' })
        const code = compileToSource(ComponentClass as any)

        expect(code).toContain('html += "A')
        expect(code).toMatch(/^function \(data, noDataOutput\) {/)
    })
})

describe('compileToRenderer', function () {
    it('should compile to a renderer function', function () {
        const ComponentClass = defineComponent({ template: '<span>A</span>' })
        const render = compileToRenderer(ComponentClass)

        expect(render).toBeInstanceOf(Function)
        expect(render({}, true)).toEqual('<span>A</span>')
    })

    it('should compile to a renderer function which accepts data', function () {
        const ComponentClass = defineComponent({ template: '<span>name: {{name}}</span>' })
        const render = compileToRenderer(ComponentClass)

        expect(render).toBeInstanceOf(Function)
        expect(render({ name: 'Harttle' }, true)).toEqual('<span>name: Harttle</span>')
    })
})
