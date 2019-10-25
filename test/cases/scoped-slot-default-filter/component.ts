import { Component } from 'san'

class Man extends Component {
    filters = {
        upper: function (source: string) {
            return source[0].toUpperCase() + source.slice(1)
        }
    }
    static template = '<div><slot var-n="data.name" var-email="data.email" var-sex="data.sex ? \'male\' : \'female\'"><p>{{n|upper}},{{sex|upper}},{{email|upper}}</p></slot></div>'
}

export default class MyComponent extends Component {
    static components = {
        'x-man': Man
    }

    filters = {
        upper: function (source: string) {
            return source.toUpperCase()
        }
    }

    static template = '<div><x-man data="{{man}}"/></div>'
}
