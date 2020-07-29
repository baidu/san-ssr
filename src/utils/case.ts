/**
 * san ssr 测试样例工具，包括：
 *
 * - 数据部分的提取
 * - HTML 部分的判等
 * - 顺序无关的数据对象比较
 */
import debugFactory from 'debug'

const debug = debugFactory('case')

export function parseSanHTML (str: string) {
    const begin = str.indexOf('<!--s-data:')
    let data = {}
    let html = str
    if (begin !== -1) {
        const end = str.indexOf('-->', begin)
        if (end !== -1) {
            data = JSON.parse(str.slice(begin + 11, end))
            html = str.slice(0, begin) + str.slice(end + 3)
        }
    }
    return [data, html]
}

export function assertSanHTMLEqual (expected: string, got: string) {
    const result = compareSanHTML(expected, got)
    if (result) {
        throw new Error(result)
    }
}

export function assertDeepEqual (lhs: any, rhs: any) {
    if (!deepEqual(lhs, rhs)) {
        const msg = `San Data not equal, Expected:\n${JSON.stringify(lhs)}\nReceived\n${JSON.stringify(rhs)}`
        throw new Error(msg)
    }
}

/**
 * San HTML 数据和 DOM 部分比较（不依赖 Object key 顺序）
 *
 * @returns 相等时返回空（undefined），不相等时返回信息（比如 "data not equal"）
 */
export function compareSanHTML (expected: string, got: string) {
    const [data0, html0] = parseSanHTML(expected)
    const [data1, html1] = parseSanHTML(got)
    if (!deepEqual(data0, data1)) {
        return 'data not equal'
    }
    if (html0 !== html1) {
        return 'html not equal'
    }
}

export function deepEqual (lhs: any, rhs: any) {
    if (!isObject(lhs)) return lhs === rhs
    if (!isObject(rhs)) return false
    const keys = new Set([...Object.keys(lhs), ...Object.keys(rhs)])
    for (const key of keys) {
        if (!deepEqual(lhs[key], rhs[key])) return false
    }
    return true
}

function isObject (val: any) {
    return typeof val === 'object' && val !== null
}
