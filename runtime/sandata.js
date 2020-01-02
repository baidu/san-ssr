class SanData {
    constructor (ctx) {
        this.ctx = ctx
        this.data = ctx.data
        this.computedNames = ctx.computedNames
    }

    get (path) {
        if (this.computedNames.indexOf(path) !== -1) {
            return this.ctx.proto.computed[path].apply(this.ctx.proto)
        }
        const seq = this.parseExpr(path)
        let data = this.data
        seq.forEach(name => {
            if (data[name] !== undefined && data[name] !== null) {
                data = data[name]
            } else {
                return null
            }
        })
        return data
    }
    set (path, value) {
        const seq = this.parseExpr(path)
        let parent = this.data
        for (let i = 0; i < seq.length - 1; i++) {
            const name = seq[i]
            if (parent[name]) {
                parent = parent[name]
            } else {
                return null
            }
        }
        const key = seq.slice(-1)
        parent[key] = value
        return value
    }
    parseExpr (expr) {
        return expr.split('.')
    }
}
