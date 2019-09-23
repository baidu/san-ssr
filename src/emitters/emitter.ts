export class Emitter {
    private indentLevel = 0
    private buffer = ''
    private shiftWidth

    constructor (shiftWidth = 4) {
        this.shiftWidth = shiftWidth
    }

    public fullText () {
        return this.buffer
    }

    public size () {
        return this.buffer.length
    }

    public indent () {
        this.indentLevel++
    }

    public unindent () {
        this.indentLevel--
    }

    public lastChar () {
        const buffer = this.buffer
        return buffer[buffer.length - 1]
    }

    public finishLine () {
        if (!this.size()) return
        if (this.lastChar() !== '\n') this.writeNewLine()
    }

    public writeNewLine () {
        this.write('\n')
    }

    public write (str) {
        this.buffer += str
    }

    public writeLine (str) {
        this.finishLine()
        this.writeIndent()
        this.buffer += str
        this.writeNewLine()
    }

    public writeLines (str: string) {
        this.finishLine()
        for (const line of str.trim().split('\n')) {
            this.writeIndent()
            this.buffer += line
            this.writeNewLine()
        }
    }

    public writeIndent () {
        for (let i = 0; i < this.indentLevel * this.shiftWidth; i++) {
            this.buffer += ' '
        }
    }
}
