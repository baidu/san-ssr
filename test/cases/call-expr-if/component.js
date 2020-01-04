const { Component } = require('san')

class MyComponent extends Component {
    isWorking (time) {
        if (time < 9 || time > 18) {
            return false
        }

        return true
    }
}
MyComponent.template = '<div><u s-if="isWorking(time)">work</u><b s-else>rest</b></div>'
module.exports = exports = MyComponent
