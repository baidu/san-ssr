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

/*
 * San HTML 数据和 DOM 部分比较（不依赖 Object key 顺序）
 */
export function compareSanHTML (expected: string, got: string) {
    const [data0, html0] = parseSanHTML(expected)
    const [data1, html1] = parseSanHTML(got)
    if (!deepEqual(data0, data1)) {
        return 'data not qual'
    }
    if (html0 !== html1) {
        return 'html not qual'
    }
}

function deepEqual (lhs: any, rhs: any) {
    if (typeof lhs === 'object' && lhs !== null) {
        const keys = new Set([...Object.keys(lhs), ...Object.keys(rhs)])
        for (const key of keys) {
            if (!deepEqual(lhs[key], rhs[key])) return false
        }
        return true
    }
    return JSON.stringify(lhs) === JSON.stringify(rhs)
}
