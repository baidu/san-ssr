import { square } from './square'

export function enhance (num, times) {
    return num * square(times)
}
