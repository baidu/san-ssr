export function isValidIdentifier (str: string) {
    return !!/^[a-zA-Z_$][\w$]*$/.exec(str)
}

export function getMemberFromClass<T> (clazz: Function, property: string, defaultValue: T): T
export function getMemberFromClass<T> (clazz: Function, property: string): T | undefined
export function getMemberFromClass<T> (clazz: Function, property: string, defaultValue?: T): T | undefined {
    if ((clazz as any)[property] !== undefined) return (clazz as any)[property]
    if (clazz.prototype && clazz.prototype[property] !== undefined) {
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
    throw new Error(`"${JSON.stringify(arg)}" not supported`)
}
