export class IDGenerator {
    private counts = new Map()

    /**
     * 从 name 产生一个 ID。例如 name="key"：
     * 第一次调用：key0，第二次调用：key1，第三次调用：key2，...
     */
    public generate (name: string) {
        const id = this.get(name)
        this.increaseCount(name)
        return id
    }

    /**
     * 获取最近一次 name 对应的 id
     */
    public get (name: string) {
        return name + this.getCount(name)
    }

    private getCount (name: string) {
        return this.counts.get(name) || 0
    }

    private increaseCount (name: string) {
        return this.counts.set(name, this.getCount(name) + 1)
    }
}
