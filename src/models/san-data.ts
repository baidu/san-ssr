import { Computed } from './component'

interface DataObject {
    [key: string]: any
}

/**
 * SSR 期间的 Data 实现
 */
export class SanData {
    data: DataObject
    computed: Computed

    constructor (data: DataObject, computed: Computed) {
        this.data = data
        this.computed = computed
    }

    get (path: string): any {
        if (this.computed[path]) {
            return this.computed[path].call({ data: this })
        }
        const seq = this.parseExpr(path)
        let data = this.data
        seq.forEach((name: string) => {
            if (data[name] !== undefined && data[name] !== null) {
                data = data[name]
            } else {
                return null
            }
        })
        return data
    }
    set (path: string, value: string) {
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
        parent[seq.pop()!] = value
        return value
    }
    parseExpr (expr: string): string[] {
        return expr.split('.')
    }
}
