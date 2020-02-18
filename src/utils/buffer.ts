export function byteCount (s: string) {
    return encodeURI(s).split(/%..|./).length - 1
}
