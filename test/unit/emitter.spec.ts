import { Emitter } from '../../src/utils/emitter'

describe('Emitter', function () {
    let emitter
    class XEmitter extends Emitter {
        write (str) {
            this.defaultWrite(str)
        }
    }
    beforeEach(function () {
        emitter = new XEmitter()
    })

    it('should write chars', function () {
        emitter.write('foo')
        emitter.write('bar')

        expect(emitter.fullText()).toEqual('foobar')
    })

    it('should write new lines', function () {
        emitter.writeNewLine()

        expect(emitter.fullText()).toEqual('\n')
    })

    describe('#writeLine()', function () {
        it('should write line', function () {
            emitter.writeLine('foobar')

            expect(emitter.fullText()).toEqual('foobar\n')
        })

        it('should finish current line', function () {
            emitter.write('foo')
            emitter.writeLine('bar')

            expect(emitter.fullText()).toEqual('foo\nbar\n')
        })

        it('should not add NL if exists', function () {
            emitter.write('foo\n')
            emitter.writeLine('bar')

            expect(emitter.fullText()).toEqual('foo\nbar\n')
        })
    })

    describe('#writeLines', function () {
        it('should add indent to each line', function () {
            emitter.indent()
            emitter.writeLines('foo\nbar')

            expect(emitter.fullText()).toEqual('    foo\n    bar\n')
        })
    })

    describe('#feedLine()', function () {
        it('should indent all lines', function () {
            emitter.indent()
            emitter.write('!')
            emitter.feedLine('foo()\nbar()')

            expect(emitter.fullText()).toEqual('!foo()\n    bar()\n')
        })
    })

    describe('#indent()', function () {
        it('should default to 4', function () {
            emitter.write('{')
            emitter.indent()
            emitter.writeLine('foo')
            emitter.unindent()
            emitter.write('}')

            expect(emitter.fullText()).toEqual('{\n    foo\n}')
        })

        it('can be set to 2', function () {
            const emitter = new XEmitter(2)
            emitter.write('{')
            emitter.indent()
            emitter.writeLine('foo')
            emitter.unindent()
            emitter.write('}')

            expect(emitter.fullText()).toEqual('{\n  foo\n}')
        })
    })
})
