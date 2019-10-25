import { Component } from 'san'

export default class DemoComponent extends Component {
    static filters = {
        sum: function (a: number, b: number) {
            return a + b
        }
    }
    static computed = {
        name: function () {
            const f = this.data.get('firstName')
            const l = this.data.get('lastName')
            return `${f} ${l}`
        }
    }
    static template = '<div><h1>{{name}}</h1></div>'
}