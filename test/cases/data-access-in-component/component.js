const { Component } = require('san')

class MyComponent extends Component {
    inited () {
        const { author, modified } = this.data.get()
        this.data.set('credit', `authored by ${author}, modified by ${modified}`)
    }
}

MyComponent.template = '<div>{{credit}}</div>'
module.exports = exports = MyComponent
