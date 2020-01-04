const { Component } = require('san')

class MyComponent extends Component {}

MyComponent.template = '<div><b title="{{title | real}}">{{title | real}}</b></div>'
MyComponent.filters = {
    real: function (x) {
        return 'real' + x
    }
}
module.exports = exports = MyComponent
