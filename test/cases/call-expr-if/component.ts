import { Component } from 'san'

export default class MyComponent extends Component {
    static template = '<div><u s-if="isWorking(time)">work</u><b s-else>rest</b></div>'

    isWorking (time) {
        if (time < 9 || time > 18) {
            return false
        }

        return true
    }
}
