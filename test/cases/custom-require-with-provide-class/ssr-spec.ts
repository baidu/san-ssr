import { ComponentReference } from '../../../src/models/component-reference'
import { COMPONENT_REFERENCE } from '../../../src/helpers/markExternalComponent'
import path from 'path'
import type { SsrSpecConfig } from '../../e2e.spec'

const mockId = './childA.san'
export default {
    enabled: {
        jssrc: false,
        comsrc: true,
        comrdr: false
    },
    context: {
        customComponentFilePath ({ specifier, tagName }) {
            if (specifier === './childA.san') {
                if (tagName === 'x-b') {
                    return path.resolve(__dirname, './childB.san')
                }
                return path.resolve(__dirname, './childA.san')
            }
        },
        customSSRFilePath ({ specifier, tagName }) {
            if (specifier === './childA.san') {
                if (tagName === 'x-b') {
                    return './childB.san'
                }
                return './childA.san'
            }
        }
    },
    compileOptions: {
        useProvidedComponentClass: true
    },
    beforeHook (type) {
        if (type === 'comsrc') {
            // 这里实际应该执行：
            // markExternalComponent({
            //     isExternalComponent (specifier) {
            //         if (specifier === id) {
            //             return true
            //         }

            //         return false
            //     }
            // })
            const mockComponentReferenceSymbol = COMPONENT_REFERENCE
            const mockComponentReference = ComponentReference
            jest.mock(mockId, () => {
                return new Proxy({}, {
                    get (target, p) {
                        if (p === mockComponentReferenceSymbol) {
                            // eslint-disable-next-line new-cap
                            return new mockComponentReference(mockId, 'default')
                        }
                        return {
                            // eslint-disable-next-line new-cap
                            [mockComponentReferenceSymbol]: new mockComponentReference(mockId, p as string)
                        }
                    }
                })
            }, { virtual: true })
        }
    },
    afterHook (type) {
        if (type === 'comsrc') {
            // 这里实际应该执行：
            // cancelMarkExternalComponent()

            jest.unmock(mockId)
        }
    }
} as SsrSpecConfig
