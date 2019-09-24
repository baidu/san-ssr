import { Emitter } from '../emitters/emitter'

export class Compiler {
    private fileHeader

    constructor ({ fileHeader = '' } = {}) {
        this.fileHeader = fileHeader
    }

    public writeFileHeader (emitter: Emitter) {
        emitter.write(this.fileHeader)
    }
}
