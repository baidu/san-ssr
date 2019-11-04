import { Component } from 'san'
import { defaultTo } from 'lodash'

export default class B extends Component {
    public static template = 'B'
    someMethod () {
        console.log(defaultTo(0, 10))
    }
}
