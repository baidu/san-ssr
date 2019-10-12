import { FilterDeclarations, ComputedDeclarations } from 'san-ssr-php'
import { Component } from 'san'

export default class DemoComponent extends Component {
    static filters: FilterDeclarations = {
        sum: function (a: number, b: number) {
            return a + b
        }
    }
    static computed: ComputedDeclarations = {
        name: function () {
            const f = this.data.get('firstName')
            const l = this.data.get('lastName')
            return `${f} ${l}`
        }
    }
    static template = '<div><h1>{{name}}</h1></div>'
}