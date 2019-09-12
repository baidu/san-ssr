import { Compiler } from '../../src/transpilers/ts2php'
import { resolve } from 'path'

describe('ts2php', function () {
    const tsconfig = resolve(__dirname, '../tsconfig.json')

    it('should compile static property', function () {
        const cc = new Compiler(tsconfig)
        const path = resolve(__dirname, '../stub/a.comp.ts')
        const result = cc.compileComponent(path)

        expect(result).toContain('public static $template = "A";')
    })

    it('should remove san requrie', function () {
        const cc = new Compiler(tsconfig)
        const path = resolve(__dirname, '../stub/a.comp.ts')
        const result = cc.compileComponent(path)

        expect(result).not.toContain('require_once("san")')
    })

    it('should use relative path as namespace', function () {
        const cc = new Compiler(tsconfig)
        const path = resolve(__dirname, '../stub/a.comp.ts')
        const result = cc.compileComponent(path)

        expect(result).toContain('namespace stub\\a_comp')
    })

    it('should remove extends san.Component', function () {
        const cc = new Compiler(tsconfig)
        const path = resolve(__dirname, '../stub/a.comp.ts')
        const result = cc.compileComponent(path)

        expect(result).not.toContain('extends Component')
    })

    it('should rename component class name to Component', function () {
        const cc = new Compiler(tsconfig)
        const path = resolve(__dirname, '../stub/a.comp.ts')
        const result = cc.compileComponent(path)

        expect(result).toContain('class SanSSRPHPComponent {')
    })
})
