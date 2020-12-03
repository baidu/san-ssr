export function isValidIdentifier (str: string) {
    return !!/^[a-zA-Z_$][\w$]*$/.exec(str)
}

export function getMember<T> (clazz: Function, property: string, defaultValue: T): T
export function getMember<T> (clazz: Function, property: string): T | undefined
export function getMember<T> (clazz: Function, property: string, defaultValue?: T): T | undefined {
    if (clazz[property]) return clazz[property]
    if (clazz.prototype && clazz.prototype[property]) {
        return clazz.prototype[property]
    }
    return defaultValue
}

export function functionString (fn: Function) {
    let str = fn.toString()
    if (!/^\s*function(\s|\()/.test(str) && /^\s*\w+\s*\([^)]*\)\s*{/.test(str)) { // es6 method syntax: foo(){}
        str = 'function ' + str
    }
    /**
     * 去除函数外缩进。例如：
     *
     * Input:
     * function() {
     *         console.log(1)
     *         return 1
     *     }
     *
     * Output:
     * function() {
     *     console.log(1)
     *     return 1
     * }
     */
    const lines = str.split('\n')
    const firstLine = lines.shift()!
    const minIndent = lines.reduce(
        (min: number, line: string) => Math.min(min, /^\s*/.exec(line)![0].length),
        Infinity
    )
    return [firstLine, ...lines.map(line => line.slice(minIndent))].join('\n')
}

export function assertNever (arg: never) {
}
