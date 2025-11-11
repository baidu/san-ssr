import { Component } from 'san'

export default class MyComponent extends Component<any> {
    static computed = {
        name (this: { data: any, d: any }): string {
            const f = this.d.firstName
            const l = this.data.get('lastName')
            return `${f} ${l}`
        },
        computedValue () {
            return 1
        }
    }

    initData () {
        return {
            lastName: 'Doe',
            ssr: {
                count: 1
            }
        }
    }

    static template = '<div><h1>{{name}} - {{ssr.initedProxy}} - {{ssr.initedSet}} - {{ssr.count}} - {{ssr.notTransformed}}</h1></div>'

    inited () {
        // @ts-ignore
        this.d.ssr.initedProxy = 'inited-proxy'
        this.data.set('ssr.initedSet', 'inited-set')
        const field = 'count'
        // @ts-ignore
        this.d['ssr'][field] += 1
        const a = function (this: any) {
            // not transform this.d.notTransformed
            this.d.ssr.notTransformed = this.d.computedValue + 1
        }
        a.call(this)
    }
}
