import type { SsrSpecConfig } from '../../e2e.spec'

export default {
    enabled: {
        jssrc: false,
        comsrc: true,
        comrdr: false
    },
    compileOptions: {
        useProvidedComponentClass: {
            componentPath: '../../component.js',
            componentName: 'MyComponent'
        }
    }
} as SsrSpecConfig
