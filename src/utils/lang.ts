export function isValidIdentifier (str: string) {
    return !!/^[a-zA-Z_$][\w$]*$/.exec(str)
}

export function getMember<T> (clazz: Function, property: string, defaultValue?: T): T | undefined {
    if (clazz[property]) return clazz[property]
    if (clazz.prototype && clazz.prototype[property]) {
        return clazz.prototype[property]
    }
    return defaultValue
}
