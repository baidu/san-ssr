import { SanFileParser } from '../../../src/parsers/san-file-parser'

describe('SanFileParser', () => {
    describe('#wireChildComponents()', () => {
        it('should parse a single defineComponent', () => {
            const script = `
            import { defineComponent } from 'san'
            export default defineComponent({
                inited() {}
            })`
            const template = '<div>Foo</div>'
            const parser = new SanFileParser(script, template, '/tmp/foo.san')
            const sourceFile = parser.parse()

            expect(sourceFile.getFilePath()).toEqual('/tmp/foo.san')
            expect(sourceFile.getFileContent()).toEqual(script)
            expect(sourceFile.componentInfos).toHaveLength(1)
            expect(sourceFile.componentInfos[0]).toEqual(sourceFile.entryComponentInfo)
            expect(sourceFile.componentInfos[0].hasMethod('inited')).toBeTruthy()
            expect(sourceFile.componentInfos[0].root.children[0]).toMatchObject({
                textExpr: { type: 1, value: 'Foo' }
            })
        })
        it('should parse a shorthand component', () => {
            const script = `
            export default {
                inited() {}
            }`
            const template = '<div>Foo</div>'
            const parser = new SanFileParser(script, template, '/tmp/foo.san')
            const sourceFile = parser.parse()

            expect(sourceFile.getFilePath()).toEqual('/tmp/foo.san')
            expect(sourceFile.getFileContent()).toEqual(script)
            expect(sourceFile.componentInfos).toHaveLength(1)
            expect(sourceFile.componentInfos[0]).toEqual(sourceFile.entryComponentInfo)
            expect(sourceFile.componentInfos[0].hasMethod('inited')).toBeTruthy()
            expect(sourceFile.componentInfos[0].root.children[0]).toMatchObject({
                textExpr: { type: 1, value: 'Foo' }
            })
        })
    })
})
