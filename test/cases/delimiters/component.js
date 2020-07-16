const { Component } = require('san')

class MyComponent extends Component {}
MyComponent.delimiters = ['[[', ']]']
MyComponent.template = `<div>[[ title ]]</div>`

module.exports = exports = MyComponent
