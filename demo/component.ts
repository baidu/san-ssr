import { Component } from 'san'

export default class MyComponent extends Component {
    static computed = {
        name (this: { data: any }): string {
            const f = this.data.get('firstName')
            const l = this.data.get('lastName')
            return `${f} ${l}`
        }
    }

    static template = '<div><h1>{{name}}</h1></div>'
}