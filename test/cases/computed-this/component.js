const { Component } = require('san')

class MyComponent extends Component {
    realTitle () {
        return 'real' + this.data.get('title')
    }
}
MyComponent.computed = {
    realTitle: function () {
        return this.realTitle()
    }
}
MyComponent.template = '<div><b title="{{realTitle}}">{{realTitle}}</b></div>'

exports = module.exports = MyComponent
