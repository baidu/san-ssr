import { Component } from 'san'
import List from './list'
import MethodCall from './method-call'

export default class MyComponent extends Component<any> {
    inited () {
        this.d.count = this.d.name.length || 0
    }

    initData () {
        return {
            name: 'MyComponent'
        }
    }

    static components = {
        'c-list': List,
        'c-method-call': MethodCall
    }

    static trimWhitespace = 'all'

    static template = `<div>
        <div>{{name}} - count: {{count}}</div>
        <c-list></c-list>
        <c-method-call></c-method-call>
    </div>`
}
