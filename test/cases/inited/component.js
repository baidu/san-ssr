const { Component } = require('san')

class MyComponent extends Component {
    initData () {
        return {
            t: 'title'
        }
    }
    inited () {
        const data = this.data
        const realTitle = 'real' + data.get('title')
        data.set('_realTitle', realTitle)
    }
}

MyComponent.computed = {
    realTitle: function () {
        return this.data.get('_realTitle')
    }
}

MyComponent.template = '<div><b title="{{realTitle}}">{{realTitle}}</b></div>'

module.exports = exports = MyComponent
