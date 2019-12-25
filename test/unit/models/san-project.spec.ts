import { SanProject } from '../../../src/models/san-project'
import { defineComponent } from 'san'
import { resolve } from 'path'

const stubRoot = resolve(__dirname, '../../stub')

describe('SanProject', function () {
    it('should not throw if called with no options', function () {
        expect(() => new SanProject()).not.toThrow()
    })

    it('should not throw if tsConfigFilePath not found', function () {
        expect(() => new SanProject({
            tsConfigFilePath: null // simulate the case when no tsconfig found
        })).not.toThrow()
    })

    describe('#compile()', () => {
        it('should compile TypeScript to JavaScript renderer by default', function () {
            const proj = new SanProject()
            const code = proj.compile(resolve(stubRoot, './a.comp.ts'))

            expect(code).toContain('html += "A')
            expect(code).toContain('exports = module.exports = function (data, noDataOutput) {')
        })

        it('should compile JavaScript to JavaScript renderer', function () {
            const proj = new SanProject()
            const code = proj.compile(resolve(stubRoot, './a.comp.js'))

            expect(code).toContain('html += "A')
            expect(code).toContain('exports = module.exports = function (data, noDataOutput) {')
        })

        it('should compile ComponentClass to JavaScript renderer', function () {
            const proj = new SanProject()
            const componentClass = defineComponent({ template: '<span>A</span>' })
            const code = proj.compile(componentClass as any)

            expect(code).toContain('html += "A')
            expect(code).toMatch(/^exports = module.exports = function \(data, noDataOutput\) {/)
        })

        it('should support bare function output', function () {
            const proj = new SanProject()
            const componentClass = require(resolve(stubRoot, './a.comp.js'))
            const code = proj.compile(componentClass, 'js', {
                bareFunction: true
            })

            expect(code).toContain('html += "A')
            expect(code).toMatch(/^function \(data, noDataOutput\) {/)
        })
    })

    describe('#compileToRenderer()', function () {
        it('should compile to a renderer function', function () {
            const proj = new SanProject()
            const render = proj.compileToRenderer(resolve(stubRoot, './a.comp.ts'))

            expect(render).toBeInstanceOf(Function)
            expect(render({}, true)).toEqual('<div>A</div>')
        })

        it('should compile to a renderer function which accepts data', function () {
            const proj = new SanProject()
            const render = proj.compileToRenderer(resolve(stubRoot, './name.comp.js'))

            expect(render).toBeInstanceOf(Function)
            expect(render({ name: 'Harttle' }, true)).toEqual('<div>name: Harttle</div>')
        })
    })
})
