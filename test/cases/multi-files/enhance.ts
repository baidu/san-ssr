import { square } from './square'

export function enhance (num: number, times: number) {
    return num * square(times)
}
