const { Component } = require('san')

class List extends Component {}
List.template = '<ul><li s-for="item in list">{{item}}</li></ul>'

class MyComponent extends Component {}
MyComponent.components = {
    'x-l': List
}
MyComponent.template = '<div><x-l list="{{[1, true, ...ext, \'erik\', ...ext2]}}"/></div>'

exports = module.exports = MyComponent
