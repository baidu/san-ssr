export class Emitter {
    private indentLevel = 0
    private shiftWidth: number
    protected code = ''

    constructor (shiftWidth = 4) {
        this.shiftWidth = shiftWidth
    }

    public write (str: string) {
        this.code += str
    }

    /**
     * @deprecated 此前 Emitter 是 abstract class，这是 write 的默认实现
     */
    public defaultWrite (str: string) {
        this.code += str
    }

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
        for (const line of str.split('\n')) {
            this.carriageReturn()
            this.write(line)
        }
    }

    public feedLine (str: string) {
        let first = true
        for (const line of str.split('\n')) {
            if (!first) this.carriageReturn()
            first = false
            this.write(line)
        }
        this.writeNewLine()
    }

    public writeLine (str: string) {
        for (const line of str.split('\n')) {
            this.carriageReturn()
            this.write(line)
        }
        this.writeNewLine()
    }

    public writeLines (str: string) {
        for (const line of str.trim().split('\n')) {
            this.carriageReturn()
            this.write(line)
            this.writeNewLine()
        }
    }

    public writeIndentedLines (str: string) {
        this.indent()
        this.writeLines(str)
        this.unindent()
    }

    public carriageReturn () {
        if (!this.atLineBegin()) this.writeNewLine()
        for (let i = 0; i < this.indentLevel * this.shiftWidth; i++) {
            this.write(' ')
        }
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
