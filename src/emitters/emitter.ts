export abstract class Emitter {
    private indentLevel = 0
    private shiftWidth
    protected code = ''

    constructor (shiftWidth = 4) {
        this.shiftWidth = shiftWidth
    }

    public abstract write (str: string)
    public fullText () {
        return this.code
    }
    public indent () {
        this.indentLevel++
    }
    public unindent () {
        this.indentLevel--
    }
    public writeNewLine () {
        this.write('\n')
    }
    public nextLine (str: string) {
        this.writeIndent()
        this.write(str)
    }
    public feedLine (str: string) {
        this.write(str)
        this.writeNewLine()
    }
    public writeLine (str: string) {
        this.writeIndent()
        this.write(str)
        this.writeNewLine()
    }
    public writeLines (str: string) {
        for (const line of str.trim().split('\n')) {
            this.writeIndent()
            this.write(line)
            this.writeNewLine()
        }
    }
    public writeIndent () {
        if (!this.atLineBegin()) this.writeNewLine()
        for (let i = 0; i < this.indentLevel * this.shiftWidth; i++) {
            this.write(' ')
        }
    }

    protected defaultWrite (str: string) {
        this.code += str
    }

    private atLineBegin () {
        if (!this.size()) return true
        return this.lastChar() === '\n'
    }
    private size () {
        return this.code.length
    }
    private lastChar () {
        return this.code[this.size() - 1]
    }
}
