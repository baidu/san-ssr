import { Component } from 'san'

export default class MethodCall extends Component<any> {
    inited () {
        this.d.name = 'MethodCall'
        this.d.list = [1]
        this.d.list.push(2)
        this.d.list.push(...[3, 4, 5])
    }

    initData () {
        return {
            name: 'child'
        }
    }

    listCount () {
        return 'count: ' + this.d.list.length
    }

    static template = '<div>{{ name }} - {{listCount()}}</div>'
}
