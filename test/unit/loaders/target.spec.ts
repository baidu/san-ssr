import { loadCompilerClassByTarget } from '../../../src/loaders/target'

describe('loaders/target', function () {
    describe('.loadCompilerClassByTarget()', () => {
        it('should return compiler for target-js', () => {
            const compiler = loadCompilerClassByTarget('js')
            expect(compiler.name).toEqual('ToJSCompiler')
        })
        it('should find compiler if installed (ESM)', () => {
            const compiler = loadCompilerClassByTarget('fake-esm')
            expect(compiler.name).toEqual('FakeESM')
        })
        it('should find compiler if installed (CMD)', () => {
            const compiler = loadCompilerClassByTarget('fake-cmd')
            expect(compiler.name).toEqual('FakeCMD')
        })
        it('should throw if compiler not found', () => {
            expect(() => loadCompilerClassByTarget('rust'))
                .toThrow('failed to load "san-ssr-target-rust"')
        })
    })
})
