/**
 * 抗冲突变量名产生器
 *
 * 产生一个带有 name 的不重复的变量名。例如 key，key1，key2，...
 */
export class IDGenerator {
    private counts = new Map()

    public next (name: string) {
        this.increaseCount(name)
        return name + (this.getCount(name) || '')
    }

    private getCount (name: string) {
        return this.counts.has(name) ? this.counts.get(name) : -1
    }

    private increaseCount (name: string) {
        return this.counts.set(name, this.getCount(name) + 1)
    }
}
