const reservedNames = [/^list$/i]

export function isReserved (name: string) {
    for (const reserved of reservedNames) {
        if (reserved.test(name)) return true
    }
    return false
}
