import { Component } from 'san'

function outerCall (comp: Component<any>) {
    comp.d.list = [1, 2, 3]
}

export default class List extends Component<any> {
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
