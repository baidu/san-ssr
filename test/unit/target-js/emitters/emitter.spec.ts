import { JSEmitter } from '../../../../src/target-js/emitters/emitter'

describe('JSEmitter', function () {
    let emitter

    beforeEach(function () {
        emitter = new JSEmitter()
    })

    describe('write html literal', function () {
        it('should write text', function () {
            emitter.write('foo')
            expect(emitter.fullText()).toEqual('foo')
        })

        it('should buffer html literal', function () {
            emitter.writeHTMLLiteral('foo')
            emitter.write('bar')
            expect(emitter.fullText()).toEqual('html += "foo";\nbar')
        })

        it('should flush buffer when fullText called', function () {
            emitter.writeHTMLLiteral('foo')
            expect(emitter.fullText()).toEqual('html += "foo";\n')
        })
    })

    it('should write data comment', function () {
        emitter.writeDataComment()

        expect(emitter.fullText()).toEqual('html += "<!--s-data:" + JSON.stringify(ctx.data) + "-->";\n')
    })

    describe('write switch case', function () {
        it('should write switch', function () {
            emitter.writeSwitch('type', function () {
                emitter.writeLine('case:t')
            })

            expect(emitter.fullText()).toEqual('switch (type) {\n    case:t\n}\n')
        })

        it('should write case without body', function () {
            emitter.writeCase('1')

            expect(emitter.fullText()).toEqual('case 1:\n')
        })

        it('should write case with break body', function () {
            emitter.writeCase('1', function () {
                emitter.writeBreak()
            })

            expect(emitter.fullText()).toEqual('case 1:\n    break;\n')
        })

        it('should write default without body', function () {
            emitter.writeDefault()

            expect(emitter.fullText()).toEqual('default:\n')
        })

        it('should write default with body', function () {
            emitter.writeDefault(function () {
                emitter.writeLine('foo')
            })

            expect(emitter.fullText()).toEqual('default:\n    foo\n')
        })

        it('should write no indent before default', function () {
            emitter.writeCase('1', function () {
                emitter.writeBreak()
            })

            emitter.writeDefault(function () {
                emitter.writeLine('foo')
            })

            emitter.writeLine('bar')

            expect(emitter.fullText()).toEqual('case 1:\n    break;\ndefault:\n    foo\nbar\n')
        })
    })

    describe('write function', function () {
        it('should write function without arguments', function () {
            emitter.writeFunction()

            expect(emitter.fullText()).toEqual('function () {\n}')
        })

        it('should write function with only name', function () {
            emitter.writeFunction('bar')

            expect(emitter.fullText()).toEqual('function bar () {\n}')
        })

        it('should write function with arguments', function () {
            emitter.writeFunction('bar', ['a', 'b'], function () {
                emitter.writeLine('echo')
            })

            expect(emitter.fullText()).toEqual('function bar (a, b) {\n    echo\n}')
        })

        it('should write anonymous function', function () {
            emitter.writeAnonymousFunction()

            expect(emitter.fullText()).toEqual('function () {\n}')
        })

        it('should write function call', function () {
            emitter.writeFunctionCall('bar', ['foo1', 'foo2'])

            expect(emitter.fullText()).toEqual('bar(foo1, foo2)')
        })
    })

    describe('write if', function () {
        it('should write if', function () {
            emitter.writeIf('foo', function () {
                emitter.writeLine('bar')
            })

            expect(emitter.fullText()).toEqual('if (foo) {\n    bar\n}\n')
        })

        it('should write else if', function () {
            emitter.writeIf('foo', function () {
                emitter.writeLine('bar')
            })

            emitter.beginElseIf('bar')
            emitter.endIf()

            expect(emitter.fullText()).toEqual('if (foo) {\n    bar\n}\nelse if (bar) {\n}\n')
        })

        it('should write else', function () {
            emitter.writeIf('foo', function () {
                emitter.writeLine('bar')
            })

            emitter.beginElse()
            emitter.endIf()

            expect(emitter.fullText()).toEqual('if (foo) {\n    bar\n}\nelse {\n}\n')
        })
    })

    describe('write for', function () {
        it('should write for', function () {
            emitter.writeFor('lists in list', function () {
                emitter.writeLine('list')
            })

            expect(emitter.fullText()).toEqual('for (lists in list) {\n    list\n}\n')
        })

        it('should write continue', function () {
            emitter.writeContinue()

            expect(emitter.fullText()).toEqual('continue;\n')
        })
    })

    describe('write block', function () {
        it('should write block with callback', function () {
            emitter.writeBlock('foo', function () {
                emitter.writeLine('bar')
            })

            expect(emitter.fullText()).toEqual('foo {\n    bar\n}\n')
        })
        it('should write block without callback', function () {
            emitter.writeBlock('foo')

            expect(emitter.fullText()).toEqual('foo {\n}\n')
        })
        it('should write block without expr', function () {
            emitter.writeBlock()

            expect(emitter.fullText()).toEqual('{\n}\n')
        })
    })
})
