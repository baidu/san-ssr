const { Component } = require('san')

class MyComponent extends Component {}

MyComponent.template = '<div>{{staff[0].first}} {{staff.0.last}}</div>'
module.exports = exports = MyComponent
