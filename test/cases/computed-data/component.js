const { Component } = require('san')

class MyComponent extends Component {}

MyComponent.computed = {
    realTitle: function () {
        return 'real' + this.data.get('title')
    }
}

MyComponent.template = '<div><b title="{{realTitle}}">{{realTitle}}</b></div>'
module.exports = exports = MyComponent
