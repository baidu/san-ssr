import { getDependenciesRecursively } from '../../../src/parsers/dependency-resolver'
import { Project } from 'ts-morph'

describe('parsers/dependency-resolver', () => {
    describe('.getDependenciesRecursively()', function () {
        it('should resolve diamond dependencies', function () {
            const project = new Project({ addFilesFromTsConfig: false })
            const p = project.createSourceFile('/p.ts', `
                import c1 from './c1'
                import c2 from './c2'`)
            const c1 = project.createSourceFile('/c1.ts', `
                import t from './t'
                export default 1`)
            const c2 = project.createSourceFile('/c2.ts', `
                import t from './t'
                export default 2`)
            const t = project.createSourceFile('/t.ts', `const a = 1; export default a`)
            const deps = getDependenciesRecursively(p)
            expect(deps.size).toEqual(3)
            expect(deps.get('/c1.ts')).toEqual(c1)
            expect(deps.get('/c2.ts')).toEqual(c2)
            expect(deps.get('/t.ts')).toEqual(t)
        })
        it('should skip none-existing source files', function () {
            const project = new Project({ addFilesFromTsConfig: false })
            const p = project.createSourceFile('/p.ts', `
                import c1 from './c1'
                import c2 from './c2'`)
            const c1 = project.createSourceFile('/c1.ts', `export default 1`)
            const deps = getDependenciesRecursively(p)

            expect(deps.size).toEqual(1)
            expect(deps.get('/c1.ts')).toEqual(c1)
        })
        it('should skip declaration files', function () {
            const project = new Project({ addFilesFromTsConfig: false })
            const p = project.createSourceFile('/p.ts', `
                import c1 from './c1'
                import { c2 } from './c2'`)
            const c1 = project.createSourceFile('/c1.ts', `export default 1`)
            project.createSourceFile('/c2.d.ts', `export type c2 = number`)
            const deps = getDependenciesRecursively(p)

            expect(deps.size).toEqual(1)
            expect(deps.get('/c1.ts')).toEqual(c1)
        })
    })
})
