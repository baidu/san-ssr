/**
 * 该文件可能会以字符串形式直接输出到产物中
 * 因此不能引用外部模块，会因找不到外部模块报错
 */
interface DataObject {
    [key: string]: any
}

interface Computed {
    [k: string]: (this: { data: SanSSRData }) => any
}

/**
 * 字符串源码读取类，用于模板字符串解析过程
 *
 * @param {string} source 要读取的字符串
 */
class Walker {
    source: string
    len: number
    index: number
    constructor (source: string) {
        this.source = source
        this.len = this.source.length
        this.index = 0
    }

    /**
     * 向前读取符合规则的字符片段，并返回规则匹配结果
     *
     * @param reg 字符片段的正则表达式
     * @param isMatchStart 是否必须匹配当前位置
     * @return
     */
    match (reg: RegExp, isMatchStart: boolean) {
        reg.lastIndex = this.index

        const match = reg.exec(this.source)
        if (match && (!isMatchStart || this.index === match.index)) {
            this.index = reg.lastIndex
            return match
        }
    };
}

/**
 * 读取ident
 * 这里的 ident 指标识符(identifier)，也就是通常意义上的变量名
 * 这里默认的变量名规则为：由美元符号($)、数字、字母或者下划线(_)构成的字符串
 *
 * @inner
 * @param walker 源码读取对象
 * @return {string}
 */
function readIdent (walker: Walker) {
    const match = walker.match(/\s*([$0-9a-z_]+)/ig, true)

    if (!match) {
        throw new Error('[SAN_SSR FATAL] expect an ident: ' + walker.source.slice(walker.index))
    }

    return match[1]
}

/**
 * 读取字符串
 *
 * @param walker 源码读取对象
 */
function readString (walker: Walker) {
    const startChar = walker.source.charAt(walker.index)
    const index = walker.source.indexOf(startChar, walker.index + 1)

    if (index === -1) {
        throw new Error('[SAN_SSR FATAL] expect a string: ' + walker.source.slice(walker.index))
    }

    const value = walker.source.slice(walker.index + 1, index)
    walker.index = index + 1

    return value
}

/**
 * 读取访问表达式
 *
 * @param walker 源码读取对象
 * @return {Object}
 */
function readAccessor (walker: Walker) {
    const firstSeg = readIdent(walker)

    const result: (string | number)[] = [
        firstSeg
    ]

    while (walker.index < walker.len) {
        switch (walker.source.charCodeAt(walker.index)) {
        case 46: // .
            walker.index++

            // ident as string
            result.push(readIdent(walker))
            break

        case 91: { // [
            walker.index++
            let currentCode = walker.source.charCodeAt(walker.index)
            if (currentCode >= 48 && currentCode <= 57) { // 0-9
                result.push(+(walker.match(/[0-9]+(\.[0-9]+)?/g, true)![0]))
            } else if (currentCode === 34 || currentCode === 39) {
                result.push(readString(walker))
            } else {
                throw new Error('[SAN_SSR FATAL] identifier is not support: ' + walker.source.slice(walker.index))
            }
            currentCode = walker.source.charCodeAt(walker.index)
            if (currentCode !== 93) {
                throw new Error('[SAN_SSR FATAL] expect ]: ' + walker.source.slice(walker.index))
            }
            walker.index++
            break
        }

        default:
            throw new Error('[SAN_SSR FATAL] expect . or [: ' + walker.source.slice(walker.index))
        }
    }

    return result
}

/**
 * SSR 期间的 Data 实现，替代 import('san').SanSSRData
 *
 * * 不涉及视图更新
 * * 便于编译期优化
 */
export class SanSSRData {
    data: DataObject
    computed: Computed

    constructor (data: DataObject, instance: any) {
        this.data = data
        this.computed = instance.computed || {}
    }

    get (path: string): any {
        if (arguments.length === 0) return this.data
        if (this.computed[path]) return this.computed[path].call({ data: this })
        return this.parseExpr(path).reduce(
            (val: any, name: string | number) => val == null ? val : val[name],
            this.data
        )
    }

    set (path: string, value: any) {
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

    parseExpr (expr: string): (string|number)[] {
        return readAccessor(new Walker(expr))
    }
}
