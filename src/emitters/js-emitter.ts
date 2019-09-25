import { Emitter } from './emitter'

export class JSEmitter extends Emitter {
    public writeRuntime () {
    }

    public write (str: string) {
        return this.defaultWrite(str)
    }
}
