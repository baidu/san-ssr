import { Component } from 'san'

class Man extends Component {
    filters = {
        upper: function (source: string) {
            return source[0].toUpperCase() + source.slice(1)
        }
    }

    static template = '<div><slot name="test" var-n="data.name" var-email="data.email" var-sex="data.sex ? \'male\' : \'female\'"><p>{{n}},{{sex}},{{email}}</p></slot></div>'
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

    static template = '<div><x-man data="{{man}}"><h3 slot="test">{{n|upper}}</h3><b slot="test">{{sex|upper}}</b><u slot="test">{{email|upper}}</u></x-man></div>'
}
