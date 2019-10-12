import { Emitter } from '../emitters/emitter'

export abstract class Compiler {
    private fileHeader

    constructor ({ fileHeader = '' } = {}) {
        this.fileHeader = fileHeader
    }

    public abstract compile(filepath: string);

    public writeFileHeader (emitter: Emitter) {
        emitter.write(this.fileHeader)
    }
}
