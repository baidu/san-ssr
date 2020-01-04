const { Component } = require('san')

class MyComponent extends Component {
    initData () {
        return {
            date: new Date('1996-07-26T07:33:20.000Z')
        }
    }
}
MyComponent.filters = {
    year: function (date) {
        return date.getFullYear()
    }
}
MyComponent.template = '<div><b title="{{date|year}}">{{date|year}}</b></div>'
module.exports = exports = MyComponent
