import { compileToSource, compileToRenderer } from '../../src/index'
import { defineComponent } from 'san'
import terser from 'terser'

describe('compileToSource', function () {
    it('should compile ComponentClass to JavaScript code', function () {
        const ComponentClass = defineComponent({ template: '<span>A</span>' })
        const code = compileToSource(ComponentClass as any)
        expect(code).toContain('html += "A')
        expect(code).toMatch(/^function render \(data, info\) {/)
    })

    it('should use aliased helper name in compiled Component code', async function () {
        const ComponentClass = defineComponent({ template: '<span>A</span>' })
        const code = compileToSource(ComponentClass as any)

        expect(code).toContain('_attrFilter = _.attrFilter')
        expect(code).toContain('_escapeHTML = _.escapeHTML')
        expect(code).toContain('_classFilter = _.classFilter')
        expect(code).toContain('_styleFilter = _.styleFilter')
        expect(code).toContain('_iterate = _.iterate')
        expect(code).toContain('_output = _.output')
        const compressed = await terser.minify({
            'code.js': code
        }, {
            mangle: true
        })
        // helper 压缩后变量名会变成 a,b,c 等短名称
        expect(compressed.code).toMatch(/[a-z]=[a-z]\.attrFilter/)
        expect(compressed.code).toMatch(/[a-z]=[a-z]\.escapeHTML/)
        expect(compressed.code).toMatch(/[a-z]=[a-z]\.classFilter/)
        expect(compressed.code).toMatch(/[a-z]=[a-z]\.styleFilter/)
        expect(compressed.code).toMatch(/[a-z]=[a-z]\.attrFilter/)
        // 移除未使用的 helper
        expect(compressed.code).not.toMatch(/[a-z]=[a-z]\.iterate/)
        expect(compressed.code).not.toMatch(/[a-z]=[a-z]\.output/)
    })
})

describe('compileToRenderer', function () {
    it('should compile to a renderer function', function () {
        const ComponentClass = defineComponent({ template: '<span>A</span>' })
        const render = compileToRenderer(ComponentClass as unknown as san.Component)

        expect(render).toBeInstanceOf(Function)
        expect(render({}, {
            noDataOutput: true
        })).toEqual('<span>A</span>')
    })

    it('should compile to a renderer function which accepts data', function () {
        const ComponentClass = defineComponent({ template: '<span>name: {{name}}</span>' })
        const render = compileToRenderer(ComponentClass as unknown as san.Component)

        expect(render).toBeInstanceOf(Function)
        expect(render({ name: 'Harttle' }, {
            noDataOutput: true
        })).toEqual('<span>name: Harttle</span>')
    })

    it('should run inited only in run time', function () {
        const inited = jest.fn()
        const ComponentClass = defineComponent({ inited, template: '<div>a</div>' })
        const render = compileToRenderer(ComponentClass as unknown as san.Component)

        expect(inited).not.toBeCalled()
        expect(render({}, {
            noDataOutput: true
        })).toEqual('<div>a</div>')
        expect(inited).toBeCalledTimes(1)
    })
})
