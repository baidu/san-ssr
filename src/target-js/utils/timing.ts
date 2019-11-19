class Measure {
    private startTime: number

    constructor () {
        this.startTime = Date.now()
    }

    duration () {
        const dur = Date.now() - this.startTime
        return dur + 'ms'
    }
}

export function startMeasure () {
    return new Measure()
}

export function measure (fn: Function) {
    const m = new Measure()
    fn()
    return m.duration()
}
