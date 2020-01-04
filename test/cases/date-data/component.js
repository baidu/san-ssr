const { Component } = require('san')

class MyComponent extends Component {}

MyComponent.filters = {
    year: function (date) {
        return date.getFullYear()
    }
}
MyComponent.template = '<div><b title="{{date|year}}">{{date|year}}</b></div>'

module.exports = exports = MyComponent
