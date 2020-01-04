const { Component } = require('san')

class MyComponent extends Component {}

MyComponent.computed = {
    less () {
        return this.data.get('normal') - 1
    },

    normal () {
        return this.data.get('num')
    },

    more () {
        return this.data.get('normal') + 1
    }
}
MyComponent.template = '<div><a>{{less}}</a><u>{{normal}}</u><b>{{more}}</b></div>'
module.exports = exports = MyComponent
