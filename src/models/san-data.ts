import { Computed } from './component'

/**
 * SSR 期间的 Data 实现
 */
export class SanData {
    data: any
    computed: Computed

    constructor (data, computed: Computed) {
        this.data = data
        this.computed = computed
    }

    get (path) {
        if (this.computed[path]) {
            return this.computed[path].call({ data: this })
        }
        const seq = this.parseExpr(path)
        let data = this.data
        seq.forEach(name => {
            if (data[name] !== undefined && data[name] !== null) {
                data = data[name]
            } else {
                return null
            }
        })
        return data
    }
    set (path, value) {
        const seq = this.parseExpr(path)
        let parent = this.data
        for (let i = 0; i < seq.length - 1; i++) {
            const name = seq[i]
            if (parent[name]) {
                parent = parent[name]
            } else {
                return null
            }
        }
        const key = seq.slice(-1)
        parent[key] = value
        return value
    }
    parseExpr (expr) {
        return expr.split('.')
    }
}
