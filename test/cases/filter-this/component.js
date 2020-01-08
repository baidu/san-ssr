const { Component } = require('san')

class MyComponent extends Component {
    real () {
        return 'real'
    }
}
MyComponent.filters = {
    realTitle: function (title) {
        return title + this.real() + this.data.get('title')
    }
}
MyComponent.template = '<div><b title="{{title | realTitle}}">{{title | realTitle}}</b></div>'

exports = module.exports = MyComponent
