import {
    markExternalComponent,
    cancelMarkExternalComponent
} from '../../../src'
import { ComponentReference } from '../../../src/models/component-reference'
import { COMPONENT_REFERENCE } from '../../../src/helpers/markExternalComponent'
import type { SsrSpecConfig } from '../../e2e.spec'

export default {
    enabled: {
        jssrc: true,
        comsrc: true,
        comrdr: false
    },
    context: {
        customSSRFilePath (specifier) {
            if (specifier.endsWith('childA.san')) {
                return specifier.replace('childA', 'childB')
            }
        }
    },
    beforeHook (type) {
        if (type === 'comsrc') {
            const id = './childA.san'
            markExternalComponent({
                isExternalComponent (specifier) {
                    if (specifier === id) {
                        return true
                    }

                    return false
                }
            })
            const mockComponentReferenceSymbol = COMPONENT_REFERENCE
            const mockComponentReference = ComponentReference
            jest.mock(id, () => {
                return new Proxy({}, {
                    get (target, p) {
                        if (p === mockComponentReferenceSymbol) {
                            // eslint-disable-next-line new-cap
                            return new mockComponentReference(id, 'default')
                        }
                        return {
                            // eslint-disable-next-line new-cap
                            [mockComponentReferenceSymbol]: new mockComponentReference(id, p as string)
                        }
                    }
                })
            }, { virtual: true })
        }
    },
    afterHook (type) {
        if (type === 'comsrc') {
            cancelMarkExternalComponent()
        }
    }
} as SsrSpecConfig
