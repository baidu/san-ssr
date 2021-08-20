import Module from 'module'
import { ComponentReference } from '../models/component-reference'

export const COMPONENT_REFERENCE = Symbol('component-reference')

export function markExternalComponent (options: {isExternalComponent: (id: string, currentFilename: string) => boolean}) {
    const { isExternalComponent } = options
    const originRequire = Module.prototype.require
    Module.prototype.require = Object.assign(function (this: Module, id: string) {
        const currentFilename = this.filename

        if (isExternalComponent(id, currentFilename)) {
            return new Proxy({}, {
                get (target, p) {
                    if (p === COMPONENT_REFERENCE) {
                        return new ComponentReference(id, 'default')
                    }

                    return {
                        [COMPONENT_REFERENCE]: new ComponentReference(id, p as string)
                    }
                }
            })
        }

        return originRequire.call(this, id)
    }, originRequire)
}

// markExternalComponent({
//     isExternalComponent () {
//         return true
//     }
// })

// const a = require('aaa')
// const { b } = require('bbb')
// console.log(a, b)
