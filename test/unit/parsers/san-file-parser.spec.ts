import { SanFileParser } from '../../../src/parsers/san-file-parser'

const defaultOptions = {
    sanReferenceInfo: {
        moduleName: ['san'],
        className: ['Component'],
        methodName: ['defineComponent']
    }
}

describe('SanFileParser', () => {
    describe('#parse()', () => {
        it('should parse a single defineComponent', () => {
            const script = `
            import { defineComponent } from 'san'
            module.exports = defineComponent({
                inited() {}
            })`
            const template = '<div>Foo</div>'
            const parser = new SanFileParser(script, template, '/tmp/foo.san', defaultOptions)
            const sourceFile = parser.parse()

            expect(sourceFile.getFilePath()).toEqual('/tmp/foo.san')
            expect(sourceFile.getFileContent()).toContain('template: "<div>Foo</div>"')
            expect(sourceFile.getFileContent()).toContain('inited() {},')
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
            const parser = new SanFileParser(script, template, '/tmp/foo.san', defaultOptions)
            const sourceFile = parser.parse()

            expect(sourceFile.getFilePath()).toEqual('/tmp/foo.san')
            expect(sourceFile.getFileContent()).toContain('inited() {},')
            expect(sourceFile.getFileContent()).toContain('template: "<div>Foo</div>"')
            expect(sourceFile.componentInfos).toHaveLength(1)
            expect(sourceFile.componentInfos[0]).toEqual(sourceFile.entryComponentInfo)
            expect(sourceFile.componentInfos[0].hasMethod('inited')).toBeTruthy()
            expect(sourceFile.componentInfos[0].root.children[0]).toMatchObject({
                textExpr: { type: 1, value: 'Foo' }
            })
        })
        it('should parse a single Component class', () => {
            const script = `
            import { Component } from 'san'
            export default class extends Component {
                inited() {}
                constructor() {
                    this.computed = {one: () => 1}
                }
            }`
            const template = '<div>Foo</div>'
            const parser = new SanFileParser(script, template, '/tmp/foo.san', defaultOptions)
            const sourceFile = parser.parse()

            expect(sourceFile.componentInfos).toHaveLength(1)
            expect(sourceFile.componentInfos[0]).toEqual(sourceFile.entryComponentInfo)
            expect(sourceFile.componentInfos[0].getComputedNames()).toEqual(['one'])
            expect(sourceFile.componentInfos[0].root.children[0]).toMatchObject({
                textExpr: { type: 1, value: 'Foo' }
            })
        })
        it('should parse a single Component class without constructor', () => {
            const script = `
            import { Component } from 'san'
            export default class extends Component {}`
            const template = '<div>Foo</div>'
            const parser = new SanFileParser(script, template, '/tmp/foo.san', defaultOptions)
            const sourceFile = parser.parse()

            expect(sourceFile.componentInfos).toHaveLength(1)
            expect(sourceFile.componentInfos[0]).toEqual(sourceFile.entryComponentInfo)
            expect(sourceFile.componentInfos[0].root.children[0]).toMatchObject({
                textExpr: { type: 1, value: 'Foo' }
            })
        })
        it('should throw if component not found', () => {
            const script = `
            const val = 3
            export default val`
            const template = '<div>Foo</div>'
            const parser = new SanFileParser(script, template, '/tmp/foo.san', defaultOptions)
            expect(() => parser.parse()).toThrow('entry component not found')
        })
    })
})
