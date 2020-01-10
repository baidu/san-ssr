export function isValidIdentifier (str: string) {
    return !!/^[a-zA-Z_$][\w$]*$/.exec(str)
}
