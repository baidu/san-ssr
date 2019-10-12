export function byteCount (s) {
    return encodeURI(s).split(/%..|./).length - 1
}
