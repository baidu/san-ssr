import { Computed } from './component'

interface DataObject {
    [key: string]: any
}

/**
 * SSR 期间的 Data 实现，替代 import('san').SanData
 *
 * * 不涉及视图更新
 * * 便于编译期优化
 */
export class SanData {
    data: DataObject
    computed: Computed

    constructor (data: DataObject, computed: Computed) {
        this.data = data
        this.computed = computed
    }

    get (path: string): any {
        if (this.computed[path]) return this.computed[path].call({ data: this })
        return this.parseExpr(path).reduce(
            (val: any, name: string) => val == null ? val : val[name],
            this.data
        )
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
    removeAt (path: string, index: number) {
        const value: any[] = this.get(path)
        if (value && value.splice) value.splice(index, 1)
    }
    parseExpr (expr: string): string[] {
        return expr.split('.')
    }
}
