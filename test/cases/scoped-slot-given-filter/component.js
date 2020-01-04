const { Component } = require('san')

class Man extends Component {}
Man.filters = {
    upper: function (source) {
        return source[0].toUpperCase() + source.slice(1)
    }
}

Man.template = '<div><slot name="test" var-n="data.name" var-email="data.email" var-sex="data.sex ? \'male\' : \'female\'"><p>{{n}},{{sex}},{{email}}</p></slot></div>'

class MyComponent extends Component {}

MyComponent.components = {
    'x-man': Man
}
MyComponent.filters = {
    upper: function (source) {
        return source.toUpperCase()
    }
}

MyComponent.template = '<div><x-man data="{{man}}"><h3 slot="test">{{n|upper}}</h3><b slot="test">{{sex|upper}}</b><u slot="test">{{email|upper}}</u></x-man></div>'

exports = module.exports = MyComponent
