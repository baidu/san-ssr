const san = require('san')

function outerCall (comp) {
    comp.d.list = [1, 2, 3]
}

class List extends san.Component {
    inited () {
        this.d.name = 'List'
        outerCall(this)
    }

    initData () {
        return {
            name: 'child'
        }
    }

    static computed = {
        listCount () {
            return 'count: ' + this.d.list.length
        }
    }

    static template = '<div>{{ name }} - {{listCount}}</div>'
}

const MethodCall = san.defineComponent({
    inited () {
        this.d.name = 'MethodCall'
        this.d.list = [1]
        this.d.list.push(2)
        this.d.list.push(...[3, 4, 5])
    },

    initData () {
        return {
            name: 'child'
        }
    },

    listCount () {
        return 'count: ' + this.d.list.length
    },

    template: '<div>{{ name }} - {{listCount()}}</div>'
})

module.exports = san.defineComponent({
    inited () {
        this.d.count = this.d.name.length || 0
    },

    initData () {
        return {
            name: 'MyComponent'
        }
    },

    components: {
        'c-list': List,
        'c-method-call': MethodCall
    },

    trimWhitespace: 'all',

    template: `<div>
        <div>{{name}} - count: {{count}}</div>
        <c-list></c-list>
        <c-method-call></c-method-call>
    </div>`
})
