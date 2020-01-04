const { Component } = require('san')

class Man extends Component {
}
Man.filters = {
    upper: function (source) {
        return source[0].toUpperCase() + source.slice(1)
    }
}
Man.template = '<div><slot var-n="data.name" var-email="data.email" var-sex="data.sex ? \'male\' : \'female\'"><p>{{n|upper}},{{sex|upper}},{{email|upper}}</p></slot></div>'

class MyComponent extends Component {}
MyComponent. components = {
    'x-man': Man
}

MyComponent.filters = {
    upper: function (source) {
        return source.toUpperCase()
    }
}

MyComponent.template = '<div><x-man data="{{man}}"/></div>'
module.exports = exports = MyComponent
